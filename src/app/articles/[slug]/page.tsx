import { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { draftMode } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { ArticleView } from './ArticleView';
import { CaseStudyArticle, Post } from '@/types';
import { stripHtml, resolveSeoTitle } from '@/lib/seo';
import { calculateReadTime } from '@/lib/readTime';
import { getUpdatedDateIfEligible, isUpdatedEligible } from '@/lib/dateUtils';
import { generateArticleJsonLd, generateBreadcrumbJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { serverSanitizeHtml } from '@/lib/sanitize';
import { getCanonicalPostPath, isCaseStudy } from '@/lib/routes';

interface PageProps {
  params: { slug: string };
  searchParams?: { preview_token?: string; preview?: string };
}

type ArticleDataResult =
  | { notFound: true; redirectUrl?: never; raw?: never; article?: never; relatedCaseStudies?: never }
  | { redirectUrl: string; notFound?: never; raw?: never; article?: never; relatedCaseStudies?: never }
  | { raw: any; article: CaseStudyArticle; relatedCaseStudies: Post[]; notFound?: never; redirectUrl?: never };

async function getArticleData(
  slug: string,
  isDraftMode: boolean = false,
  previewToken?: string,
  isPreviewQuery: boolean = false
): Promise<ArticleDataResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return { notFound: true };

  try {
    const isBypassRls = isDraftMode || Boolean(previewToken) || isPreviewQuery;
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
    } else if (!isDraftMode && !isPreviewQuery) {
      // Public visitors only see published posts where published_at <= now()
      query = query
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString());
    }

    const { data, error } = await query.maybeSingle();

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
      category: data.subcategory || data.category || 'Case Study',
      publishDate: data.published_at
        ? new Date(data.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Draft Preview',
      updatedDate: getUpdatedDateIfEligible(data.published_at, data.updated_at),
      readTime: calculateReadTime(data.content, '5 min read'),
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
      htmlContent: serverSanitizeHtml(data.content || ''),
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
      .select('id, title, slug, content_type, category, subcategory, content, published_at, meta_description, featured_image_url')
      .eq('content_type', 'case_study')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .is('deleted_at', null)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(4);

    const relatedCaseStudies: Post[] = (relatedData || []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      type: 'failure',
      category: item.subcategory || item.category || 'Case Study',
      publishDate: item.published_at
        ? new Date(item.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent',
      readTime: calculateReadTime(item.content, '6 min read'),
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

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const isDraft = draftMode().isEnabled;
  const previewToken = searchParams?.preview_token;
  const isPreview = isDraft || Boolean(previewToken) || searchParams?.preview === 'true';

  const result = await getArticleData(params.slug, isDraft, previewToken, searchParams?.preview === 'true');
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
  const title = resolveSeoTitle(post.seo_title, post.title);
  const description =
    post.meta_description ||
    (post.content ? stripHtml(post.content).slice(0, 155) + '...' : post.title);
  const defaultCanonical = `${siteUrl}/articles/${post.slug}`;
  const canonicalUrl = post.canonical_url?.trim() || defaultCanonical;
  const ogImage = post.featured_image_url || `${siteUrl}/icon.png`;

  const isNoindex = Boolean(post.is_noindex);
  const isNofollow = Boolean(post.is_nofollow);

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
    robots: (isNoindex || isNofollow) ? {
      index: !isNoindex,
      follow: !isNofollow,
    } : undefined,
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

export default async function ArticlePage({ params, searchParams }: PageProps) {
  const isDraft = draftMode().isEnabled;
  const previewToken = searchParams?.preview_token;
  const isPreview = isDraft || Boolean(previewToken) || searchParams?.preview === 'true';

  const result = await getArticleData(params.slug, isDraft, previewToken, searchParams?.preview === 'true');

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
  const defaultCanonical = `${siteUrl}/articles/${post.slug}`;
  const canonicalUrl = post.canonical_url?.trim() || defaultCanonical;
  const articleJsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.meta_description || post.title,
    url: canonicalUrl,
    imageUrl: post.featured_image_url || undefined,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    siteUrl,
    schemaType: post.schema_type,
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'Case Studies', url: `${siteUrl}/#recent-failures` },
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
      <ArticleView
        slug={params.slug}
        initialArticle={result.article}
        initialRelatedCaseStudies={result.relatedCaseStudies}
      />
    </>
  );
}
