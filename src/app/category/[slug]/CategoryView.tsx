'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { Post } from '@/types';
import {
  getCategoryMetadata,
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/lib/taxonomy';

interface CategoryViewProps {
  initialPosts: Post[];
  slug: string;
}

function CategoryContent({ initialPosts, slug }: CategoryViewProps) {
  const searchParams = useSearchParams();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const allPosts = initialPosts;

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

  // Derived filter options based on the content types present in this category
  const filterOptions: FilterOption[] = useMemo(() => {
    const counts = {
      all: allPosts.length,
      failure: allPosts.filter((p) => p.type === 'failure').length,
      funding: allPosts.filter((p) => p.type === 'funding').length,
      layoff: allPosts.filter((p) => p.type === 'layoff').length,
      lessons: allPosts.filter((p) => p.type === 'lessons').length,
      news: allPosts.filter((p) => p.type === 'news').length,
    };

    const options: FilterOption[] = [{ id: 'all', label: 'All Dispatches', count: counts.all }];

    if (counts.failure > 0) options.push({ id: 'failure', label: 'Case Studies', count: counts.failure });
    if (counts.funding > 0) options.push({ id: 'funding', label: 'Funding Rounds', count: counts.funding });
    if (counts.layoff > 0) options.push({ id: 'layoff', label: 'Layoffs & Insolvencies', count: counts.layoff });
    if (counts.lessons > 0) options.push({ id: 'lessons', label: 'Lessons Learned', count: counts.lessons });
    if (counts.news > 0 && counts.funding === 0) options.push({ id: 'news', label: 'Wires', count: counts.news });

    return options;
  }, [allPosts]);

  // Filtered post list based on active pill
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return allPosts;
    return allPosts.filter((post) => post.type === activeFilter);
  }, [allPosts, activeFilter]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Header */}
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

      {/* Main Content Area */}
      <main className="w-full bg-background min-h-screen flex-1 transition-colors duration-200" style={{ paddingTop: 'var(--header-height, 11rem)' }}>
        {/* Category Header Hero Banner */}
        <div className="w-full border-b border-outline-variant/30 bg-surface-container-low py-10 lg:py-14">
          <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs font-label-sm text-secondary">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-secondary">{metadata.parentCategory}</span>
              <span>/</span>
              <span className="text-on-surface font-semibold">{metadata.title}</span>
            </nav>

            {/* Title & Pill Cluster */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded bg-surface-container-highest text-primary font-label-sm text-xs font-bold uppercase tracking-wider">
                {metadata.parentCategory}
              </span>
              <span className="text-xs text-secondary font-mono">
                {allPosts.length} indexed {allPosts.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            <h1 className="font-headline-lg text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight font-semibold leading-tight">
              {metadata.title}
            </h1>

            <p className="mt-3 text-base lg:text-lg text-on-surface-variant max-w-3xl leading-relaxed">
              {metadata.description}
            </p>

            {/* Filter Pills */}
            {filterOptions.length > 2 && (
              <div className="mt-8 pt-6 border-t border-outline-variant/20">
                <CategoryFilterPills
                  activeFilter={activeFilter}
                  options={filterOptions}
                  onSelectFilter={setActiveFilter}
                />
              </div>
            )}
          </div>
        </div>

        {/* Feed List Grid */}
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-10 lg:py-14">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">
                folder_open
              </span>
              <h3 className="font-headline-md text-lg font-semibold text-on-surface">
                No articles found in this section
              </h3>
              <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
                No articles currently match this taxonomy filter. Explore our other sectors or return to the homepage.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-95 transition-opacity"
              >
                Back to Homepage
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredPosts.map((post) => {
                if (post.type === 'failure') {
                  return <FailureCard key={post.id} item={post} />;
                }

                if (post.type === 'funding') {
                  return <FundingCard key={post.id} item={post} />;
                }

                // Default standard card representation for other items
                const isLesson = post.type === 'lessons';
                const postUrl = isLesson
                  ? `/lessons/${post.slug}`
                  : `/news/${post.slug}`;

                return (
                  <article
                    key={post.id}
                    className="group bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden border border-outline-variant/30 hover:border-outline hover:shadow-md transition-all p-6 justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-[11px] uppercase font-bold tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-xs text-secondary">{post.publishDate}</span>
                      </div>
                      <h3 className="font-headline-md text-xl text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors leading-snug">
                        <Link href={postUrl}>{post.title}</Link>
                      </h3>
                      <p className="mt-3 font-body-sm text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-secondary">
                      <span>{post.readTime}</span>
                      <Link
                        className="font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5"
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

export function CategoryView({ initialPosts, slug }: CategoryViewProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-secondary text-sm">
          Loading archive...
        </div>
      }
    >
      <CategoryContent initialPosts={initialPosts} slug={slug} />
    </Suspense>
  );
}
