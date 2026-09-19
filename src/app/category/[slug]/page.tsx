'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Header,
  MobileDrawer,
  FailureCard,
  FundingCard,
  Newsletter,
  Footer,
  CategoryFilterPills,
  FilterOption,
} from '@/components';
import { Post, PostType } from '@/types';
import {
  getCategoryMetadata,
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/lib/taxonomy';

function CategoryView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize filter from URL query param if present
  const initialFilter = searchParams?.get('type') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
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

  const metadata = useMemo(() => {
    return getCategoryMetadata(slug);
  }, [slug]);

  // Fetch real posts from Supabase for this category
  useEffect(() => {
    let isMounted = true;

    async function fetchCategoryPosts() {
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

        if (error || !data) {
          if (isMounted) setAllPosts([]);
          return;
        }

        // Filter posts matching this category/slug
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

        const mapped: Post[] = matched.map((p) => {
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

        if (isMounted) setAllPosts(mapped);
      } catch {
        if (isMounted) setAllPosts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCategoryPosts();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Sync filter change with URL without hard refresh
  const handleSelectFilter = (filterId: string) => {
    setActiveFilter(filterId);
    const url = new URL(window.location.href);
    if (filterId === 'all') {
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('type', filterId);
    }
    window.history.replaceState({}, '', url.toString());
  };

  // Generate dynamic filter pill options with real counts
  const filterOptions: FilterOption[] = useMemo(() => {
    const counts = {
      all: allPosts.length,
      failure: allPosts.filter((p) => p.type === 'failure').length,
      funding: allPosts.filter((p) => p.type === 'funding').length,
      layoff: allPosts.filter((p) => p.type === 'layoff').length,
      lessons: allPosts.filter((p) => p.type === 'lessons').length,
      news: allPosts.filter((p) => p.type === 'news').length,
    };

    const options: FilterOption[] = [{ id: 'all', label: 'All Items', count: counts.all }];
    if (counts.failure > 0) options.push({ id: 'failure', label: 'Case Studies', count: counts.failure });
    if (counts.funding > 0) options.push({ id: 'funding', label: 'Funding Alerts', count: counts.funding });
    if (counts.layoff > 0) options.push({ id: 'layoff', label: 'Layoffs & Restructuring', count: counts.layoff });
    if (counts.lessons > 0) options.push({ id: 'lessons', label: 'Founder Lessons', count: counts.lessons });
    if (counts.news > 0 && counts.layoff === 0) options.push({ id: 'news', label: 'Startup News', count: counts.news });

    return options;
  }, [allPosts]);

  // Filtered posts based on activeFilter
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return allPosts;
    return allPosts.filter((p) => p.type === activeFilter);
  }, [allPosts, activeFilter]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Top Header */}
      <Header
        isDarkMode={isDarkMode}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        categories={NAV_CATEGORIES}
        isOpen={isMobileMenuOpen}
        secondaryItems={SECONDARY_NAV_ITEMS}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="w-full bg-background min-h-screen flex-1 transition-colors duration-200" style={{ paddingTop: 'var(--header-height, 11rem)' }}>
        <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-secondary font-label-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-secondary">{metadata.parentCategory}</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">{metadata.title}</span>
          </nav>

          {/* Category Header */}
          <header className="mb-8 pb-6 border-b border-outline-variant/30">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 rounded bg-surface-container font-label-sm text-[11px] font-bold uppercase tracking-wider text-primary">
                {metadata.parentCategory}
              </span>
              <span className="text-secondary">•</span>
              <span className="text-xs text-secondary font-label-sm font-medium">
                {isLoading ? 'Querying records...' : `${allPosts.length} Documented Records`}
              </span>
            </div>

            <h1 className="font-headline-lg text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight font-semibold leading-tight">
              {metadata.title}
            </h1>

            <p className="mt-3 font-body-sm text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
              {metadata.description}
            </p>
          </header>

          {/* Filter Pills Bar */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-label-sm uppercase tracking-wider text-secondary font-bold">
                Filter:
              </span>
              <CategoryFilterPills
                activeFilter={activeFilter}
                options={filterOptions}
                onSelectFilter={handleSelectFilter}
              />
            </div>

            <div className="text-xs text-secondary font-label-sm">
              {isLoading ? 'Loading...' : `Showing ${filteredPosts.length} of ${allPosts.length} stories`}
            </div>
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-6 rounded-xl bg-surface-container-low animate-pulse h-64 border border-outline-variant/20 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-outline-variant/30 rounded w-1/3" />
                    <div className="h-6 bg-outline-variant/30 rounded w-4/5" />
                    <div className="h-3 bg-outline-variant/30 rounded w-full" />
                    <div className="h-3 bg-outline-variant/30 rounded w-2/3" />
                  </div>
                  <div className="h-4 bg-outline-variant/30 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 my-8">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">
                folder_open
              </span>
              <h3 className="font-headline-md text-lg font-semibold text-on-surface">
                {allPosts.length === 0
                  ? 'No documented stories in this category yet'
                  : 'No items match this filter'}
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant max-w-md mx-auto">
                {allPosts.length === 0
                  ? 'New post-mortems and market updates are added regularly. Browse other categories in the navigation above.'
                  : 'Try selecting a different filter option above or reset the filter to see all items.'}
              </p>
              {allPosts.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleSelectFilter('all')}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-wider font-label-md hover:bg-primary transition-colors"
                >
                  Reset Filter
                </button>
              ) : (
                <Link
                  href="/"
                  className="mt-4 inline-block px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-wider font-label-md hover:bg-primary transition-colors"
                >
                  Return to Home
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPosts.map((post) => {
                // Render FailureCard for failure case studies
                if (post.type === 'failure') {
                  return <FailureCard key={post.id} item={post} />;
                }
                // Render FundingCard for funding alerts
                if (post.type === 'funding') {
                  return <FundingCard key={post.id} item={post} />;
                }
                // Render formatted card for news/layoff/lessons
                const isLesson = post.type === 'lessons';
                const postUrl = isLesson ? `/lessons/${post.slug}` : `/news/${post.slug}`;

                return (
                  <article
                    key={post.id}
                    className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-[11px] font-semibold uppercase text-error">
                          {post.category}
                        </span>
                        <span className="text-xs text-secondary">{post.publishDate}</span>
                      </div>
                      <h3 className="font-headline-md text-lg text-on-surface font-semibold leading-snug hover:text-primary transition-colors">
                        <Link href={postUrl}>{post.title}</Link>
                      </h3>
                      <p className="mt-2 text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-secondary">
                      <span>{post.readTime}</span>
                      <Link
                        className="text-primary font-semibold hover:underline flex items-center gap-0.5"
                        href={postUrl}
                      >
                        {isLesson ? 'Read Lesson' : 'Read News'}{' '}
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Newsletter Block */}
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-secondary text-sm">
          Loading archive...
        </div>
      }
    >
      <CategoryView />
    </Suspense>
  );
}

