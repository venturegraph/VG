'use client';

import React, { useState, useEffect } from 'react';
import {
  Header,
  MobileDrawer,
  Hero,
  FundingCard,
  FailureCard,
  LatestPostItem,
  TrendingItem,
  Newsletter,
  Footer,
} from '@/components';
import { Post, PostType, TrendingPost } from '@/types';
import {
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/lib/taxonomy';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [heroStory, setHeroStory] = useState<Post | null>(null);
  const [newFundings, setNewFundings] = useState<Post[]>([]);
  const [recentFailures, setRecentFailures] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      setIsLoading(true);
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .is('deleted_at', null)
          .order('published_at', { ascending: false });

        if (error || !data || data.length === 0) {
          return;
        }

        // Helper to format Post object
        const formatPost = (p: any, forcedType?: PostType): Post => {
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
        };

        // 1. Hero story: first case study with an image (or fallback to latest case study / post)
        const caseStudies = data.filter((p) => p.content_type === 'case_study');
        const heroCandidate = caseStudies.find((p) => p.featured_image_url) || caseStudies[0] || data[0];
        const hero = heroCandidate ? formatPost(heroCandidate, 'failure') : null;

        // 2. New Fundings: posts with funding in title, total_raised, or category
        const fundingRaw = data.filter(
          (p) =>
            p.title?.toLowerCase().includes('funding') ||
            p.title?.toLowerCase().includes('raised') ||
            (p.total_raised && p.content_type !== 'case_study') ||
            p.category === 'Funding Raised'
        );
        const fundingsToUse = fundingRaw.length >= 4 ? fundingRaw.slice(0, 4) : data.slice(0, 4);
        const fundings = fundingsToUse.map((p) => formatPost(p, 'funding'));

        // 3. Recent Failures: case studies
        const failuresRaw = caseStudies.length > 0 ? caseStudies.slice(0, 4) : data.slice(0, 4);
        const failures = failuresRaw.map((p) => formatPost(p, 'failure'));

        // 4. Latest Posts: most recent 5 posts
        const latest = data.slice(0, 5).map((p) => formatPost(p));

        // 5. Trending: top 5 posts ranked 1 to 5
        const trendingRaw = data.slice(0, 5);
        const trending: TrendingPost[] = trendingRaw.map((p, idx) => ({
          rank: String(idx + 1).padStart(2, '0'),
          title: p.title,
          slug: p.slug,
          category: p.subcategory || p.category || (p.content_type === 'case_study' ? 'Failure Analysis' : 'Venture News'),
        }));

        if (isMounted) {
          setHeroStory(hero);
          setNewFundings(fundings);
          setRecentFailures(failures);
          setLatestPosts(latest);
          setTrendingPosts(trending);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Top Header & Brand Bar */}
      <Header
        isDarkMode={isDarkMode}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Mobile Off-Canvas Drawer */}
      <MobileDrawer
        categories={NAV_CATEGORIES}
        isOpen={isMobileMenuOpen}
        secondaryItems={SECONDARY_NAV_ITEMS}
        onClose={() => setIsMobileMenuOpen(false)}
      />


      {/* Main Content Area */}
      <main className="w-full bg-background min-h-screen flex-1 transition-colors duration-200" style={{ paddingTop: 'var(--header-height, 11rem)' }}>
        {/* SECTION 1: HERO — SINGLE MOST RECENT CASE STUDY */}
        {heroStory ? (
          <Hero story={heroStory} />
        ) : isLoading ? (
          <div className="w-full min-h-[500px] bg-inverse-surface/10 animate-pulse flex items-center justify-center text-secondary">
            Loading featured case study...
          </div>
        ) : null}

        {/* SECTION 2: NEW FUNDINGS */}
        <section
          className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-12 lg:py-16"
          id="new-fundings"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-outline-variant/30 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 bg-tertiary rounded-full" />
                <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                  Capital Movement
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl lg:text-3xl text-on-surface tracking-tight font-semibold">
                New Fundings
              </h2>
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant max-w-md">
              Notable financing rounds, growth equity extensions, and strategic venture rounds closed across global technology sectors.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-6 rounded-xl bg-surface-container-low animate-pulse h-56 border border-outline-variant/20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newFundings.map((item) => (
                <FundingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3: RECENT FAILURES */}
        <section
          className="w-full bg-surface-container-low py-12 lg:py-16 border-t border-b border-outline-variant/30 transition-colors"
          id="recent-failures"
        >
          <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                  <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                    Case Studies
                  </span>
                </div>
                <h2 className="font-headline-lg text-2xl lg:text-3xl text-on-surface tracking-tight font-semibold">
                  Recent Failures
                </h2>
              </div>
              <p className="font-body-sm text-sm text-on-surface-variant max-w-md">
                Unvarnished post-mortems and structural breakdowns analyzing why venture-backed companies wound down operations.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="p-6 rounded-xl bg-surface-container animate-pulse h-56 border border-outline-variant/20" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentFailures.map((item) => (
                  <FailureCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: LATEST & TRENDING NOW (TWO-COLUMN EDITORIAL LAYOUT) */}
        <section
          className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-12 lg:py-16"
          id="latest-trending"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Column: Latest (Wider Column) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-on-surface rounded-full" />
                  <h2 className="font-headline-lg text-2xl text-on-surface tracking-tight font-semibold">
                    Latest Posts
                  </h2>
                </div>
                <span className="text-xs text-secondary">Chronological feed</span>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-4 rounded-lg bg-surface-container-low animate-pulse h-24" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/20 flex flex-col">
                  {latestPosts.map((post, idx) => (
                    <LatestPostItem
                      key={post.id}
                      isFirst={idx === 0}
                      isLast={idx === latestPosts.length - 1}
                      item={post}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Column: Trending Now (Ranked 1-5) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-primary-container rounded-full" />
                  <h2 className="font-headline-lg text-2xl text-on-surface tracking-tight font-semibold">
                    Trending Now
                  </h2>
                </div>
                <span className="text-xs text-secondary font-label-sm uppercase">Top 5</span>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="p-3 rounded-lg bg-surface-container-low animate-pulse h-14" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {trendingPosts.map((item) => (
                    <TrendingItem key={item.rank} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 5: NEWSLETTER SIGNUP BLOCK */}
        <Newsletter />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
