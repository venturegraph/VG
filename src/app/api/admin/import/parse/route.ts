import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedWpPost {
  wp_post_id: string;
  title: string;
  slug: string;          // wp:post_name
  pubDate: string;
  wp_status: string;     // draft | publish | private | future
  categories: { name: string; domain: string }[];
  tags: { name: string; domain: string }[];
  hasFeaturedImage: boolean;
  featuredImageUrl: string | null;
  wordCount: number;
  /** Raw content:encoded HTML for downstream use */
  contentEncoded: string;
}

export interface ParseResult {
  totalItemsInFeed: number;
  totalPostsExtracted: number;
  skippedPostTypes: Record<string, number>;
  posts: ParsedWpPost[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags from a string and count whitespace-delimited words */
function countWords(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, ' ')   // remove all HTML tags
    .replace(/&[a-z]+;/gi, ' ') // collapse HTML entities
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

/** Coerce a value that fast-xml-parser may return as string | object | array to string */
function coerceString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.map(coerceString).join('');
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if ('#text' in obj) return coerceString(obj['#text']);
    if ('#cdata' in obj) return coerceString(obj['#cdata']);
  }
  return '';
}

/** Ensure value is always an array (fast-xml-parser returns single items as objects) */
function toArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === null || val === undefined) return [];
  return Array.isArray(val) ? val : [val];
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Expected multipart/form-data upload' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const xmlText = await (file as Blob).text();

    // ------------------------------------------------------------------
    // Parse with fast-xml-parser
    // ------------------------------------------------------------------
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      // WordPress XML uses CDATA heavily — parse it as strings
      cdataPropName: '#cdata',
      // Preserve arrays for elements that can repeat
      isArray: (name) =>
        ['item', 'category', 'wp:postmeta', 'wp:term'].includes(name),
      // Trim whitespace from text values
      trimValues: true,
      // Parse tag values that look like numbers as strings to preserve wp:post_id fidelity
      parseTagValue: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
      parsed = parser.parse(xmlText);
    } catch (parseErr) {
      return NextResponse.json(
        { error: `XML parse error: ${(parseErr as Error).message}` },
        { status: 422 }
      );
    }

    const channel = parsed?.rss?.channel;
    if (!channel) {
      return NextResponse.json(
        { error: 'Could not find <channel> in WXR feed. Is this a valid WordPress export file?' },
        { status: 422 }
      );
    }

    const items: unknown[] = toArray(channel.item);

    // ------------------------------------------------------------------
    // First pass: build attachment URL map  thumbnailId → url
    // WordPress stores the actual image URL in the attachment item's
    // <guid> element.  The featured image meta on a post contains
    // _thumbnail_id → the attachment's wp:post_id.
    // ------------------------------------------------------------------
    const attachmentUrlMap = new Map<string, string>();

    for (const rawItem of items) {
      const item = rawItem as Record<string, unknown>;
      const postType = coerceString(item['wp:post_type']);
      if (postType !== 'attachment') continue;

      const attachId = coerceString(item['wp:post_id']);
      // The attachment URL lives in <wp:attachment_url> or <guid>
      const attachUrl =
        coerceString(item['wp:attachment_url']) ||
        coerceString(item['guid']);
      if (attachId && attachUrl) {
        attachmentUrlMap.set(attachId, attachUrl);
      }
    }

    // ------------------------------------------------------------------
    // Second pass: extract posts
    // ------------------------------------------------------------------
    const skippedPostTypes: Record<string, number> = {};
    const posts: ParsedWpPost[] = [];
    let totalItemsInFeed = 0;

    for (const rawItem of items) {
      totalItemsInFeed++;
      const item = rawItem as Record<string, unknown>;

      const postType = coerceString(item['wp:post_type']);

      // Only process actual blog posts
      if (postType !== 'post') {
        skippedPostTypes[postType || '(unknown)'] =
          (skippedPostTypes[postType || '(unknown)'] ?? 0) + 1;
        continue;
      }

      // -- Basic fields --------------------------------------------------
      const wp_post_id = coerceString(item['wp:post_id']);
      const title = coerceString(item['title']);
      const slug = coerceString(item['wp:post_name']);
      const pubDate = coerceString(item['pubDate']);
      const wp_status = coerceString(item['wp:status']);

      // -- content:encoded -----------------------------------------------
      const rawContent =
        item['content:encoded'] ??
        (item['content'] as Record<string, unknown> | undefined)?.['encoded'];
      const contentEncoded = coerceString(rawContent);

      // -- Categories & tags ---------------------------------------------
      const categoryElements = toArray(item['category'] as unknown);
      const categories: { name: string; domain: string }[] = [];
      const tags: { name: string; domain: string }[] = [];

      for (const cat of categoryElements) {
        if (typeof cat === 'string') {
          categories.push({ name: cat, domain: 'category' });
          continue;
        }
        const catObj = cat as Record<string, unknown>;
        const domain = coerceString(catObj['@_domain']) || 'category';
        const name = coerceString(cat);

        if (!name) continue;
        if (domain === 'post_tag') {
          tags.push({ name, domain });
        } else {
          categories.push({ name, domain });
        }
      }

      // -- Featured image via _thumbnail_id ------------------------------
      const postmetas = toArray(item['wp:postmeta'] as unknown);
      let thumbnailId: string | null = null;

      for (const meta of postmetas) {
        const metaObj = meta as Record<string, unknown>;
        const key = coerceString(metaObj['wp:meta_key']);
        if (key === '_thumbnail_id') {
          thumbnailId = coerceString(metaObj['wp:meta_value']);
          break;
        }
      }

      const featuredImageUrl = thumbnailId
        ? (attachmentUrlMap.get(thumbnailId) ?? null)
        : null;

      posts.push({
        wp_post_id,
        title,
        slug,
        pubDate,
        wp_status,
        categories,
        tags,
        hasFeaturedImage: featuredImageUrl !== null,
        featuredImageUrl,
        wordCount: countWords(contentEncoded),
        contentEncoded,
      });
    }

    const result: ParseResult = {
      totalItemsInFeed,
      totalPostsExtracted: posts.length,
      skippedPostTypes,
      posts,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('[import/parse] Unexpected error:', err);
    return NextResponse.json(
      { error: `Server error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
