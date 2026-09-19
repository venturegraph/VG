import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';
import { getCanonicalPostPath } from '@/lib/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Static & Taxonomy routes (homepage, categories, lessons)
  const taxonomyHrefs = [
    ...SECONDARY_NAV_ITEMS.map((item) => item.href),
    ...NAV_CATEGORIES.flatMap((cat) => cat.items.map((item) => item.href)),
  ];

  const legalHrefs = [
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/disclaimer',
  ];

  const uniquePaths = Array.from(new Set(['/', ...taxonomyHrefs, ...legalHrefs]));

  const staticEntries: MetadataRoute.Sitemap = uniquePaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'hourly' : 'daily',
    priority: path === '/' ? 1.0 : 0.8,
  }));

  // 2. Dynamic published posts from Supabase
  if (!supabaseUrl || !supabaseAnonKey) {
    return staticEntries;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, content_type, updated_at')
      .eq('status', 'published')
      .is('deleted_at', null);

    if (error || !posts) {
      return staticEntries;
    }

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}${getCanonicalPostPath(post.content_type, post.slug)}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: post.content_type === 'case_study' ? 0.9 : 0.7,
    }));

    return [...staticEntries, ...postEntries];
  } catch {
    return staticEntries;
  }
}
