import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LessonView, ExtendedHubArticle } from './LessonView';
import { HubArticle } from '@/types';
import { stripHtml, resolveSeoTitle } from '@/lib/seo';
import { getCanonicalPostPath, isLesson } from '@/lib/routes';

interface PageProps {
  params: { slug: string };
}

type LessonDataResult =
  | { notFound: true; redirectUrl?: never; raw?: never; article?: never; relatedHubArticles?: never }
  | { redirectUrl: string; notFound?: never; raw?: never; article?: never; relatedHubArticles?: never }
  | { raw: any; article: ExtendedHubArticle; relatedHubArticles: HubArticle[]; notFound?: never; redirectUrl?: never };

async function getLessonData(slug: string): Promise<LessonDataResult> {
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
    if (!isLesson(data.content_type)) {
      return {
        redirectUrl: getCanonicalPostPath(data.content_type, data.slug),
      };
    }

    const mappedArticle: ExtendedHubArticle = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      category: data.category || 'Lessons & Insights',
      subtitle: data.meta_description || '',
      publishDate: data.published_at
        ? new Date(data.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Curated Guide',
      readTime: '8 min read',
      author: {
        name: 'Editorial Team',
        role: 'Venture Graph Research',
      },
      introduction: data.meta_description ? [data.meta_description] : [],
      lessons: [],
      htmlContent: data.content || '',
    };

    // Fetch related lessons
    const { data: relatedData } = await supabase
      .from('posts')
      .select('id, title, slug, category, meta_description, published_at')
      .in('content_type', ['lessons_hub', 'lessons'])
      .eq('status', 'published')
      .is('deleted_at', null)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3);

    const relatedHubArticles: HubArticle[] = (relatedData || []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category: item.category || 'Lessons & Insights',
      subtitle: item.meta_description || '',
      publishDate: item.published_at
        ? new Date(item.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent Archive',
      readTime: '6 min read',
      author: {
        name: 'Editorial Team',
        role: 'Venture Graph Research',
      },
      introduction: [],
      lessons: [],
    }));

    return {
      raw: data,
      article: mappedArticle,
      relatedHubArticles,
    };
  } catch (err) {
    console.error('Error in getLessonData:', err);
    return { notFound: true };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getLessonData(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';

  if (!result || result.notFound) {
    return {
      title: 'Lesson Guide Not Found',
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
  const canonicalUrl = `${siteUrl}/lessons/${post.slug}`;
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

export default async function LessonPage({ params }: PageProps) {
  const result = await getLessonData(params.slug);

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
    <LessonView
      slug={params.slug}
      initialArticle={result.article}
      initialRelatedHubArticles={result.relatedHubArticles}
    />
  );
}
