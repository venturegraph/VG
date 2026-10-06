import { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { draftMode } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { LessonView, ExtendedHubArticle } from './LessonView';
import { HubArticle } from '@/types';
import { stripHtml, resolveSeoTitle } from '@/lib/seo';
import { calculateReadTime } from '@/lib/readTime';
import { getUpdatedDateIfEligible, isUpdatedEligible } from '@/lib/dateUtils';
import { generateArticleJsonLd, generateBreadcrumbJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { serverSanitizeHtml } from '@/lib/sanitize';
import { getCanonicalPostPath, isLesson } from '@/lib/routes';

interface PageProps {
  params: { slug: string };
  searchParams?: { preview_token?: string; preview?: string };
}

type LessonDataResult =
  | { notFound: true; redirectUrl?: never; raw?: never; article?: never; relatedHubArticles?: never }
  | { redirectUrl: string; notFound?: never; raw?: never; article?: never; relatedHubArticles?: never }
  | { raw: any; article: ExtendedHubArticle; relatedHubArticles: HubArticle[]; notFound?: never; redirectUrl?: never };

async function getLessonData(
  slug: string,
  isDraftMode: boolean = false,
  previewToken?: string
): Promise<LessonDataResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return { notFound: true };

  try {
    const isBypassRls = isDraftMode || Boolean(previewToken);
    const supabase = isBypassRls
      ? createAdminClient()
      : createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null);

    if (previewToken) {
      query = query.eq('preview_token', previewToken);
    } else if (!isDraftMode) {
      query = query
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString());
    }

    const { data, error } = await query.maybeSingle();

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
      category: data.subcategory || data.category || 'Lessons & Insights',
      subtitle: data.meta_description || '',
      publishDate: data.published_at
        ? new Date(data.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Curated Guide',
      updatedDate: getUpdatedDateIfEligible(data.published_at, data.updated_at),
      readTime: calculateReadTime(data.content, '8 min read'),
      author: {
        name: 'Editorial Team',
        role: 'Venture Graph Research',
      },
      introduction: data.meta_description ? [data.meta_description] : [],
      lessons: [],
      htmlContent: serverSanitizeHtml(data.content || ''),
    };

    // Fetch related lessons (only published & elapsed published_at)
    const { data: relatedData } = await supabase
      .from('posts')
      .select('id, title, slug, category, subcategory, content, meta_description, published_at')
      .in('content_type', ['lessons_hub', 'lessons'])
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .is('deleted_at', null)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3);

    const relatedHubArticles: HubArticle[] = (relatedData || []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category: item.subcategory || item.category || 'Lessons & Insights',
      subtitle: item.meta_description || '',
      publishDate: item.published_at
        ? new Date(item.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent Archive',
      readTime: calculateReadTime(item.content, '6 min read'),
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

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const isDraft = draftMode().isEnabled;
  const previewToken = searchParams?.preview_token;
  const isPreview = isDraft || Boolean(previewToken) || searchParams?.preview === 'true';

  const result = await getLessonData(params.slug, isDraft, previewToken);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';

  if (!result || result.notFound) {
    return {
      title: 'Lesson Hub Not Found',
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

  if (isPreview) {
    return {
      title: `[PREVIEW] ${title} | Venture Graph`,
      description,
      robots: { index: false, follow: false, nocache: true },
    };
  }

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
      modifiedTime: isUpdatedEligible(post.published_at, post.updated_at) ? post.updated_at : undefined,
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

export default async function LessonPage({ params, searchParams }: PageProps) {
  const isDraft = draftMode().isEnabled;
  const previewToken = searchParams?.preview_token;
  const isPreview = isDraft || Boolean(previewToken) || searchParams?.preview === 'true';

  const result = await getLessonData(params.slug, isDraft, previewToken);

  if (!result || result.notFound) {
    notFound();
  }

  if (result.redirectUrl) {
    const targetUrl = isPreview
      ? `${result.redirectUrl}?preview=true${previewToken ? `&preview_token=${encodeURIComponent(previewToken)}` : ''}`
      : result.redirectUrl;

    if (isPreview) {
      redirect(targetUrl);
    } else {
      permanentRedirect(targetUrl);
    }
  }

  if (!result.article || !result.raw) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';
  const post = result.raw;
  const canonicalUrl = `${siteUrl}/lessons/${post.slug}`;
  const articleJsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.meta_description || post.title,
    url: canonicalUrl,
    imageUrl: post.featured_image_url || undefined,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    siteUrl,
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'Lessons & Insights', url: `${siteUrl}/lessons` },
    { name: result.article.category, url: canonicalUrl },
  ]);

  return (
    <>
      {isPreview && (
        <aside
          aria-label="Draft Preview Banner"
          className="sticky top-0 z-50 bg-amber-500 text-amber-950 font-sans font-medium text-xs px-4 py-2 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>
              <strong>Live Draft Preview:</strong> Viewing unpublished dispatch with authentic site typography &amp; layout.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-black/15 text-[10px] font-bold uppercase tracking-wider">
            Draft Mode Active
          </span>
        </aside>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <LessonView
        slug={params.slug}
        initialArticle={result.article}
        initialRelatedHubArticles={result.relatedHubArticles}
      />
    </>
  );
}
