import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { HomeView } from './HomeView';
import { Post, PostType, TrendingPost } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Venture Graph — The Startup Mortality & Capital Index',
  description:
    'Startup failure case studies, funding news, and founder playbooks. The definitive research index for venture-backed company shutdowns, funding rounds, and executive retrospectives.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Venture Graph — The Startup Mortality & Capital Index',
    description:
      'Startup failure case studies, funding news, and founder playbooks.',
    url: 'https://venturegraph.me',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venture Graph — The Startup Mortality & Capital Index',
    description:
      'Startup failure case studies, funding news, and founder playbooks.',
  },
};

// Helper to format a raw DB row into the Post shape used by the UI
function formatPost(p: any, forcedType?: PostType): Post {
  let postType: PostType = forcedType || 'news';
  if (!forcedType) {
    if (p.content_type === 'case_study') postType = 'failure';
    else if (p.content_type === 'lessons_hub' || p.content_type === 'lessons') postType = 'lessons';
    else if (p.title?.toLowerCase().includes('funding') || p.total_raised) postType = 'funding';
    else if (p.title?.toLowerCase().includes('layoff')) postType = 'layoff';
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
    readTime: '6 min read',
    excerpt: p.meta_description || (p.content ? p.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : p.title),
    image: p.featured_image_url || undefined,
    amount: p.total_raised || undefined,
    round: p.subcategory || 'Strategic Round',
    capitalType: p.category || 'Venture Round',
    stats: p.content_type === 'case_study' ? {
      totalRaised: p.total_raised || '$0',
      foundedYear: p.founded_year ? String(p.founded_year) : '—',
      shutdownYear: p.shutdown_year ? String(p.shutdown_year) : '—',
      hqCountry: p.hq_country || 'United States',
      failureReason: p.failure_reason || 'Market dynamics',
    } : undefined,
  };
}

async function getHomeData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      heroStory: null,
      newFundings: [],
      recentFailures: [],
      latestPosts: [],
      trendingPosts: [],
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        heroStory: null,
        newFundings: [],
        recentFailures: [],
        latestPosts: [],
        trendingPosts: [],
      };
    }

    // 1. Hero story: first case study with an image (or fallback to latest case study / post)
    const caseStudies = data.filter((p) => p.content_type === 'case_study');
    const heroCandidate = caseStudies.find((p) => p.featured_image_url) || caseStudies[0] || data[0];
    const heroStory = heroCandidate ? formatPost(heroCandidate, 'failure') : null;

    // 2. New Fundings: posts with funding in title, total_raised, or category
    const fundingRaw = data.filter(
      (p) =>
        p.title?.toLowerCase().includes('funding') ||
        p.title?.toLowerCase().includes('raised') ||
        (p.total_raised && p.content_type !== 'case_study') ||
        p.category === 'Funding Raised'
    );
    const fundingsToUse = fundingRaw.length >= 4 ? fundingRaw.slice(0, 4) : data.slice(0, 4);
    const newFundings = fundingsToUse.map((p) => formatPost(p, 'funding'));

    // 3. Recent Failures: case studies
    const failuresRaw = caseStudies.length > 0 ? caseStudies.slice(0, 4) : data.slice(0, 4);
    const recentFailures = failuresRaw.map((p) => formatPost(p, 'failure'));

    // 4. Latest Posts: most recent 5 posts
    const latestPosts = data.slice(0, 5).map((p) => formatPost(p));

    // 5. Trending: top 5 posts ranked 1 to 5
    const trendingRaw = data.slice(0, 5);
    const trendingPosts: TrendingPost[] = trendingRaw.map((p, idx) => ({
      rank: String(idx + 1).padStart(2, '0'),
      title: p.title,
      slug: p.slug,
      category: p.subcategory || p.category || (p.content_type === 'case_study' ? 'Failure Analysis' : 'Venture News'),
    }));

    return {
      heroStory,
      newFundings,
      recentFailures,
      latestPosts,
      trendingPosts,
    };
  } catch (err) {
    console.error('Failed to load homepage data:', err);
    return {
      heroStory: null,
      newFundings: [],
      recentFailures: [],
      latestPosts: [],
      trendingPosts: [],
    };
  }
}

export default async function HomePage() {
  const { heroStory, newFundings, recentFailures, latestPosts, trendingPosts } =
    await getHomeData();

  return (
    <HomeView
      heroStory={heroStory}
      newFundings={newFundings}
      recentFailures={recentFailures}
      latestPosts={latestPosts}
      trendingPosts={trendingPosts}
    />
  );
}
