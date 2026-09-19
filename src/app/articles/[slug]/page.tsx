import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArticleView } from './ArticleView';
import { CaseStudyArticle, Post } from '@/types';
import { stripHtml } from '@/lib/seo';
import { getCanonicalPostPath, isCaseStudy } from '@/lib/routes';

interface PageProps {
  params: { slug: string };
}

type ArticleDataResult =
  | { notFound: true; redirectUrl?: never; raw?: never; article?: never; relatedCaseStudies?: never }
  | { redirectUrl: string; notFound?: never; raw?: never; article?: never; relatedCaseStudies?: never }
  | { raw: any; article: CaseStudyArticle; relatedCaseStudies: Post[]; notFound?: never; redirectUrl?: never };

async function getArticleData(slug: string): Promise<ArticleDataResult> {
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
    if (!isCaseStudy(data.content_type)) {
      return {
        redirectUrl: getCanonicalPostPath(data.content_type, data.slug),
      };
    }

    const mappedArticle: CaseStudyArticle = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      type: 'failure',
      category: data.category || 'Case Study',
      publishDate: data.published_at
        ? new Date(data.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Draft Preview',
      readTime: '5 min read',
      excerpt: data.meta_description || data.title,
      subtitle: data.meta_description || '',
      image: data.featured_image_url || undefined,
      author: {
        name: 'Editorial Team',
        role: 'Venture Graph Forensics',
      },
      stats: {
        totalRaised: data.total_raised
          ? (String(data.total_raised).startsWith('$') ? String(data.total_raised) : `$${data.total_raised}`)
          : 'N/A',
        foundedYear: data.founded_year ? String(data.founded_year) : 'N/A',
        shutdownYear: data.shutdown_year ? String(data.shutdown_year) : 'N/A',
        hqCountry: data.hq_country || 'N/A',
        failureReason: data.failure_reason || 'N/A',
      },
      htmlContent: data.content || '',
      content: {
        introduction: data.meta_description ? [data.meta_description] : [],
        sections: [
          {
            heading: 'Forensic Breakdown',
            paragraphs: (data.content || '').split('\n\n').filter(Boolean),
          },
        ],
      },
    };

    // Fetch related case studies
    const { data: relatedData } = await supabase
      .from('posts')
      .select('id, title, slug, content_type, category, published_at, meta_description, featured_image_url')
      .eq('content_type', 'case_study')
      .eq('status', 'published')
      .is('deleted_at', null)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(4);

    const relatedCaseStudies: Post[] = (relatedData || []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      type: 'failure',
      category: item.category || 'Case Study',
      publishDate: item.published_at
        ? new Date(item.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent',
      readTime: '6 min read',
      excerpt: item.meta_description || item.title,
      image: item.featured_image_url || undefined,
    }));

    return {
      raw: data,
      article: mappedArticle,
      relatedCaseStudies,
    };
  } catch (err) {
    console.error('Error in getArticleData:', err);
    return { notFound: true };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getArticleData(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';

  if (!result || result.notFound) {
    return {
      title: 'Case Study Not Found',
    };
  }

  if (result.redirectUrl) {
    return {
      title: 'Redirecting...',
      robots: { index: false, follow: false },
    };
  }

  const post = result.raw;
  const title = post.seo_title || post.title;
  const description =
    post.meta_description ||
    (post.content ? stripHtml(post.content).slice(0, 155) + '...' : post.title);
  const canonicalUrl = `${siteUrl}/articles/${post.slug}`;
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

export default async function ArticlePage({ params }: PageProps) {
  const result = await getArticleData(params.slug);

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
    <ArticleView
      slug={params.slug}
      initialArticle={result.article}
      initialRelatedCaseStudies={result.relatedCaseStudies}
    />
  );
}
