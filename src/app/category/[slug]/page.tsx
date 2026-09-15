'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import {
  Header,
  MobileDrawer,
  PrimaryNav,
  FailureCard,
  FundingCard,
  LatestPostItem,
  Newsletter,
  Footer,
  CategoryFilterPills,
  FilterOption,
} from '@/components';
import {
  getCategoryData,
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/data/mockData';

function CategoryView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize filter from URL query param if present
  const initialFilter = searchParams?.get('type') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
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

  const categoryData = getCategoryData(slug);

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

  const allPosts = categoryData?.posts || [];

  // Generate dynamic filter pill options with counts
  const filterOptions: FilterOption[] = useMemo(() => {
    const counts = {
      all: allPosts.length,
      failure: allPosts.filter((p) => p.type === 'failure').length,
      funding: allPosts.filter((p) => p.type === 'funding').length,
      layoff: allPosts.filter((p) => p.type === 'layoff').length,
      lessons: allPosts.filter((p) => p.type === 'lessons').length,
    };

    const options: FilterOption[] = [{ id: 'all', label: 'All Items', count: counts.all }];
    if (counts.failure > 0) options.push({ id: 'failure', label: 'Case Studies', count: counts.failure });
    if (counts.funding > 0) options.push({ id: 'funding', label: 'Funding Alerts', count: counts.funding });
    if (counts.layoff > 0) options.push({ id: 'layoff', label: 'Layoffs & News', count: counts.layoff });
    if (counts.lessons > 0) options.push({ id: 'lessons', label: 'Founder Lessons', count: counts.lessons });

    return options;
  }, [allPosts]);

  // Filtered posts based on activeFilter
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return allPosts;
    return allPosts.filter((p) => p.type === activeFilter);
  }, [allPosts, activeFilter]);

  if (!categoryData) {
    return notFound();
  }

  const { metadata } = categoryData;

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

      {/* Two-Row Primary Nav */}
      <PrimaryNav
        categories={NAV_CATEGORIES}
        secondaryItems={SECONDARY_NAV_ITEMS}
      />

      {/* Main Content */}
      <main className="w-full pt-44 bg-background min-h-screen flex-1 transition-colors duration-200">
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
                {allPosts.length} Documented Records
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
              Showing {filteredPosts.length} of {allPosts.length} stories
            </div>
          </div>

          {/* Content Grid */}
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 my-8">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">
                folder_open
              </span>
              <h3 className="font-headline-md text-lg font-semibold text-on-surface">
                No items match this filter
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Try selecting a different filter option above or view all items.
              </p>
              <button
                type="button"
                onClick={() => handleSelectFilter('all')}
                className="mt-4 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold uppercase tracking-wider font-label-md"
              >
                Reset Filter
              </button>
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
                // Render formatted card for news/layoff
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
                        <Link href={`/news/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-secondary">
                      <span>{post.readTime}</span>
                      <Link
                        className="text-primary font-semibold hover:underline flex items-center gap-0.5"
                        href={`/news/${post.slug}`}
                      >
                        Read News <span className="material-symbols-outlined text-[14px]">chevron_right</span>
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
