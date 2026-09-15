import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import DOMPurify from 'isomorphic-dompurify';
import type { ContentType } from '@/types';

// ---------------------------------------------------------------------------
// Request / response shapes
// ---------------------------------------------------------------------------

/** One post to commit — sent from the import review page */
export interface CommitPostPayload {
  wp_post_id: string;
  title: string;
  slug: string;
  contentType: ContentType;
  category: string;
  subcategory: string;
  contentEncoded: string;
  pubDate: string;
  featuredImageUrl: string | null;
  /** Original WP slug preserved for image lookup later */
  original_wp_slug: string;
}

export interface CommitRequest {
  posts: CommitPostPayload[];
}

export interface CommitRowResult {
  wp_post_id: string;
  slug: string;
  title: string;
  status: 'imported' | 'skipped' | 'failed';
  /** Populated for skipped (duplicate slug) */
  skipReason?: string;
  /** Populated for failed rows */
  error?: string;
}

export interface CommitResponse {
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  results: CommitRowResult[];
}

// ---------------------------------------------------------------------------
// POST /api/admin/import/commit
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // ------------------------------------------------------------------
  // 1. Auth — must be a logged-in admin
  // ------------------------------------------------------------------
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden — admin role required' },
      { status: 403 }
    );
  }

  // ------------------------------------------------------------------
  // 2. Parse body
  // ------------------------------------------------------------------
  let body: CommitRequest;
  try {
    body = (await request.json()) as CommitRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(body.posts) || body.posts.length === 0) {
    return NextResponse.json({ error: 'No posts provided' }, { status: 400 });
  }

  const authorId = user.id;
  const now = new Date().toISOString();

  // ------------------------------------------------------------------
  // 3. Process each post individually so one failure doesn't abort all
  // ------------------------------------------------------------------
  const results: CommitRowResult[] = [];

  for (const post of body.posts) {
    const rowBase: Pick<CommitRowResult, 'wp_post_id' | 'slug' | 'title'> = {
      wp_post_id: post.wp_post_id,
      slug: post.slug,
      title: post.title,
    };

    // Sanitize HTML content — same config as PostForm.tsx:352
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitizedContent = (DOMPurify as any).sanitize(
      post.contentEncoded ?? '',
      {
        USE_PROFILES: { html: true },
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'frameborder', 'data-type'],
      }
    );

    // Build the row to insert
    const row = {
      title: (post.title ?? '').trim(),
      slug: (post.slug ?? '').trim(),
      content_type: post.contentType,
      content: sanitizedContent,
      status: 'draft' as const,
      author_id: authorId,
      category: post.category || null,
      subcategory: post.subcategory || null,
      featured_image_url: post.featuredImageUrl || null,
      published_at: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      // Migration-tracking columns (schema.sql migration step)
      import_source: 'wordpress_migration',
      original_wp_slug: post.original_wp_slug || post.slug || null,
      original_wp_post_id: post.wp_post_id || null,
      image_migrated: false,
    };

    try {
      const { error: insertError } = await supabase
        .from('posts')
        .insert(row);

      if (insertError) {
        console.error('[commit/route] Insert error on post:', post.slug, insertError);
        // Postgres unique-constraint violation on slug → treat as skip
        if (
          insertError.code === '23505' &&
          (insertError.message.includes('slug') ||
            insertError.message.includes('posts_slug_key') ||
            insertError.message.includes('unique'))
        ) {
          results.push({
            ...rowBase,
            status: 'skipped',
            skipReason: `Duplicate slug "${post.slug}" already exists`,
          });
        } else {
          // Any other DB error → failed row
          results.push({
            ...rowBase,
            status: 'failed',
            error: insertError.message,
          });
        }
      } else {
        results.push({ ...rowBase, status: 'imported' });
      }
    } catch (err) {
      results.push({
        ...rowBase,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  // ------------------------------------------------------------------
  // 4. Summarise and return
  // ------------------------------------------------------------------
  const importedCount = results.filter((r) => r.status === 'imported').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  const response: CommitResponse = {
    importedCount,
    skippedCount,
    failedCount,
    results,
  };

  // Return 200 OK when all succeeded, or 207 Multi-Status when some or all rows were skipped/failed.
  // Never return 500 for data/schema results — reserve 500 strictly for unhandled server crashes.
  const httpStatus = importedCount === results.length ? 200 : 207;

  return NextResponse.json(response, { status: httpStatus });
}
