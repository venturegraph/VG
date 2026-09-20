import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CategoryView } from './CategoryView';
import { Post, PostType } from '@/types';
import { getCategoryMetadata } from '@/lib/taxonomy';

interface PageProps {
  params: { slug: string };
}

async function getCategoryPosts(slug: string): Promise<Post[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return [];

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false });

    if (error || !data) return [];

    const matched = data.filter((post) => {
      const cat = (post.category || '').toLowerCase();
      const subcat = (post.subcategory || '').toLowerCase();
      const title = (post.title || '').toLowerCase();
      const cType = post.content_type || '';

      switch (slug) {
        case 'ai':
          return subcat.includes('ai') || cat.includes('ai') || title.includes('ai');
        case 'ecommerce':
          return (
            subcat.includes('commerce') ||
            cat.includes('commerce') ||
            title.includes('commerce') ||
            title.includes('logistics')
          );
        case 'saas':
          return (
            subcat.includes('saas') ||
            cat.includes('saas') ||
            title.includes('saas') ||
            title.includes('software')
          );
        case 'fintech':
          return (
            subcat.includes('fintech') ||
            cat.includes('fintech') ||
            title.includes('fintech') ||
            title.includes('banking') ||
            title.includes('checkout')
          );

        case 'under-10m':
          return subcat.includes('under $10m') || subcat.includes('<10m') || subcat.includes('under 10m');
        case '10m-50m':
          return subcat.includes('10m') && subcat.includes('50m');
        case '50m-100m':
          return (subcat.includes('50m') && subcat.includes('100m')) || subcat.includes('50m–100m');
        case '100m-unicorn':
          return subcat.includes('100m') || subcat.includes('unicorn');

        case 'vc-backed':
          return subcat.includes('vc') || cat.includes('funding') || !post.subcategory;
        case 'bootstrapped':
          return subcat.includes('bootstrap');
        case 'crowdfunded':
          return subcat.includes('crowdfund') || title.includes('kickstarter');

        case 'startup-news':
          return cType === 'news';
        case 'shutdowns-collapses':
          return cType === 'case_study';
        case 'funding-alerts':
          return cType === 'news' && (title.includes('funding') || title.includes('raised') || post.total_raised != null);
        case 'layoffs':
          return cType === 'news' && (title.includes('layoff') || title.includes('insolv') || title.includes('wind-down'));

        case 'top-lists':
          return subcat.includes('top') || title.includes('10 ') || title.includes('top');
        case 'failure-patterns':
        case 'lessons-learned':
          return cType === 'lessons_hub' || cType === 'lessons' || cat.includes('lesson');

        default: {
          const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanCat = cat.replace(/[^a-z0-9]/g, '');
          const cleanSubcat = subcat.replace(/[^a-z0-9]/g, '');
          const words = slug.split('-');
          return (
            cleanCat.includes(cleanSlug) ||
            cleanSubcat.includes(cleanSlug) ||
            words.every((w) => title.includes(w) || cat.includes(w) || subcat.includes(w))
          );
        }
      }
    });

    return matched.map((p) => {
      let postType: PostType = 'news';
      if (p.content_type === 'case_study') {
        postType = 'failure';
      } else if (p.content_type === 'lessons_hub' || p.content_type === 'lessons') {
        postType = 'lessons';
      } else if (p.title?.toLowerCase().includes('funding') || p.total_raised) {
        postType = 'funding';
      } else if (p.title?.toLowerCase().includes('layoff') || p.title?.toLowerCase().includes('insolv')) {
        postType = 'layoff';
      }

      const dateStr = p.published_at || p.created_at;
      const formattedDate = dateStr
        ? new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recently';

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: postType,
        category: p.subcategory || p.category || (p.content_type === 'case_study' ? 'Case Study' : 'News'),
        subcategory: p.subcategory || undefined,
        publishDate: formattedDate,
        readTime: '5 min read',
        excerpt: p.meta_description || (p.content ? p.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : p.title),
        image: p.featured_image_url || undefined,
        amount: p.total_raised || undefined,
        round: p.subcategory || 'Strategic Round',
        capitalType: p.category || 'Strategic Capital',
        stats: p.content_type === 'case_study' ? {
          totalRaised: p.total_raised || '$0',
          foundedYear: p.founded_year ? String(p.founded_year) : '—',
          shutdownYear: p.shutdown_year ? String(p.shutdown_year) : '—',
          hqCountry: p.hq_country || 'United States',
          failureReason: p.failure_reason || 'Market dynamics',
        } : undefined,
      };
    });
  } catch (err) {
    console.error('Error fetching category posts on server:', err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const metadata = getCategoryMetadata(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';
  const canonicalUrl = `${siteUrl}/category/${params.slug}`;
  const title = metadata.title;
  const fullTitle = `${metadata.title} | Venture Graph`;
  const description = metadata.description;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: fullTitle,
      description,
      images: [
        {
          url: `${siteUrl}/icon.png`,
          alt: metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${siteUrl}/icon.png`],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const posts = await getCategoryPosts(params.slug);

  return (
    <CategoryView
      slug={params.slug}
      initialPosts={posts}
    />
  );
}
