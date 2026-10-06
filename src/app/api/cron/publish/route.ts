import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCanonicalPostPath } from '@/lib/routes';

export const dynamic = 'force-dynamic';

async function handlePublishCron(request: NextRequest) {
  // 1. Guard route with CRON_SECRET authorization header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized: invalid or missing CRON_SECRET authorization header' },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // 2. Query Supabase for all posts where status = 'scheduled' AND published_at <= NOW()
    const { data: scheduledPosts, error: queryError } = await supabase
      .from('posts')
      .select('id, slug, content_type, published_at')
      .eq('status', 'scheduled')
      .lte('published_at', now)
      .is('deleted_at', null);

    if (queryError) {
      console.error('[cron/publish] Error querying scheduled posts:', queryError);
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled posts pending publication',
        publishedCount: 0,
        timestamp: now,
      });
    }

    // 3. Update status to 'published'
    const postIds = scheduledPosts.map((p) => p.id);
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        updated_at: now,
      })
      .in('id', postIds);

    if (updateError) {
      console.error('[cron/publish] Error updating post statuses:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Invalidate Next.js cache for newly published articles & public feeds
    for (const post of scheduledPosts) {
      const canonicalPath = getCanonicalPostPath(post.content_type, post.slug);
      revalidatePath(canonicalPath);
      revalidatePath(`/articles/${post.slug}`);
    }

    revalidatePath('/');
    revalidatePath('/admin/posts');

    try {
      revalidateTag('posts');
    } catch {
      // Ignore if tag-based cache provider is not configured
    }

    return NextResponse.json({
      success: true,
      publishedCount: scheduledPosts.length,
      publishedPosts: scheduledPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        published_at: p.published_at,
      })),
      timestamp: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown cron error';
    console.error('[cron/publish] Unexpected error during automated publishing:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handlePublishCron(request);
}

export async function POST(request: NextRequest) {
  return handlePublishCron(request);
}
