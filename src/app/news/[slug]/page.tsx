import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { NewsView, ExtendedNewsArticle } from './NewsView';
import { Post } from '@/types';
import { stripHtml, resolveSeoTitle } from '@/lib/seo';
import { getCanonicalPostPath, isNews } from '@/lib/routes';

interface PageProps {
  params: { slug: string };
}

type NewsDataResult =
  | { notFound: true; redirectUrl?: never; raw?: never; article?: never; relatedNews?: never }
  | { redirectUrl: string; notFound?: never; raw?: never; article?: never; relatedNews?: never }
  | { raw: any; article: ExtendedNewsArticle; relatedNews: Post[]; notFound?: never; redirectUrl?: never };

async function getNewsData(slug: string): Promise<NewsDataResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return { notFound: true };

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) return { notFound: true };

    // Content type mismatch: redirect to canonical route
    if (!isNews(data.content_type)) {
      return {
        redirectUrl: getCanonicalPostPath(data.content_type, data.slug),
      };
    }

    const mappedArticle: ExtendedNewsArticle = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      type: 'funding',
      category: data.category || 'Startup News',
      publishDate: data.published_at
        ? new Date(data.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent',
      timestamp: data.published_at
        ? new Date(data.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent Dispatch',
      readTime: '4 min read',
      excerpt: data.meta_description || data.title,
      image: data.featured_image_url || undefined,
      amount: data.total_raised || undefined,
      author: {
        name: 'Editorial Team',
        role: 'Venture Graph Forensics',
      },
      htmlContent: data.content || '',
      content: {
        summary: data.meta_description || '',
        body: (data.content || '').split('\n\n').filter(Boolean),
      },
    };

    // Fetch related news
    const { data: relatedData } = await supabase
      .from('posts')
      .select('id, title, slug, content_type, category, published_at, meta_description, total_raised, featured_image_url')
      .neq('content_type', 'case_study')
      .neq('content_type', 'lessons_hub')
      .neq('content_type', 'lessons')
      .eq('status', 'published')
      .is('deleted_at', null)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3);

    const relatedNews: Post[] = (relatedData || []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      type: 'news',
      category: item.category || 'Startup News',
      publishDate: item.published_at
        ? new Date(item.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent',
      readTime: '4 min read',
      excerpt: item.meta_description || item.title,
      amount: item.total_raised || undefined,
      image: item.featured_image_url || undefined,
    }));

    return {
      raw: data,
      article: mappedArticle,
      relatedNews,
    };
  } catch (err) {
    console.error('Error in getNewsData:', err);
    return { notFound: true };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getNewsData(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';

  if (!result || result.notFound) {
    return {
      title: 'News Article Not Found',
    };
  }

  if (result.redirectUrl) {
    return {
      title: 'Redirecting...',
      robots: { index: false, follow: false },
    };
  }

  const post = result.raw;
  const title = resolveSeoTitle(post.seo_title, post.title);
  const description =
    post.meta_description ||
    (post.content ? stripHtml(post.content).slice(0, 155) + '...' : post.title);
  const canonicalUrl = `${siteUrl}/news/${post.slug}`;
  const ogImage = post.featured_image_url || `${siteUrl}/icon.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: `${title} | Venture Graph`,
      description,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      images: [
        {
          url: ogImage,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Venture Graph`,
      description,
      images: [ogImage],
    },
  };
}

export default async function NewsPage({ params }: PageProps) {
  const result = await getNewsData(params.slug);

  if (!result || result.notFound) {
    notFound();
  }

  if (result.redirectUrl) {
    permanentRedirect(result.redirectUrl);
  }

  if (!result.article) {
    notFound();
  }

  return (
    <NewsView
      slug={params.slug}
      initialArticle={result.article}
      initialRelatedNews={result.relatedNews}
    />
  );
}
