import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCanonicalPostPath } from '@/lib/routes';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const token = searchParams.get('token');
  const slug = searchParams.get('slug');

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  // Verify configured draft secret if provided
  const expectedSecret = process.env.DRAFT_PREVIEW_SECRET;
  if (expectedSecret && secret && secret !== expectedSecret) {
    return new Response('Invalid secret', { status: 401 });
  }

  const supabase = createAdminClient();
  let query = supabase
    .from('posts')
    .select('id, slug, preview_token, status, content_type')
    .eq('slug', slug)
    .is('deleted_at', null);

  if (token) {
    query = query.eq('preview_token', token);
  }

  const { data: post, error } = await query.maybeSingle();

  if (error || !post) {
    return new Response('Post not found or invalid preview token', { status: 404 });
  }

  // Enable Next.js draft mode
  draftMode().enable();

  // Redirect to canonical public route with preview parameters
  const canonicalPath = getCanonicalPostPath(post.content_type, post.slug);
  const redirectUrl = new URL(
    `${canonicalPath}?preview=true${token ? `&preview_token=${encodeURIComponent(token)}` : ''}`,
    request.url
  );

  return NextResponse.redirect(redirectUrl);
}
