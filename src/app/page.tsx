'use client';

import React, { useState, useEffect } from 'react';
import {
  Header,
  MobileDrawer,
  PrimaryNav,
  Hero,
  FundingCard,
  FailureCard,
  LatestPostItem,
  TrendingItem,
  Newsletter,
  Footer,
} from '@/components';
import {
  HERO_STORY,
  NEW_FUNDINGS,
  RECENT_FAILURES,
  LATEST_POSTS,
  TRENDING_POSTS,
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/data/mockData';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode preference
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

      {/* Two-Row Category / Filter Bar (Sticky below header) */}
      <PrimaryNav
        categories={NAV_CATEGORIES}
        secondaryItems={SECONDARY_NAV_ITEMS}
      />

      {/* Main Content Area */}
      <main className="w-full pt-44 bg-background min-h-screen flex-1 transition-colors duration-200">
        {/* SECTION 1: HERO — SINGLE MOST RECENT CASE STUDY */}
        <Hero story={HERO_STORY} />

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEW_FUNDINGS.map((item) => (
              <FundingCard key={item.id} item={item} />
            ))}
          </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {RECENT_FAILURES.map((item) => (
                <FailureCard key={item.id} item={item} />
              ))}
            </div>
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

              <div className="divide-y divide-outline-variant/20 flex flex-col">
                {LATEST_POSTS.map((post, idx) => (
                  <LatestPostItem
                    key={post.id}
                    isFirst={idx === 0}
                    isLast={idx === LATEST_POSTS.length - 1}
                    item={post}
                  />
                ))}
              </div>
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

              <div className="flex flex-col gap-5">
                {TRENDING_POSTS.map((item) => (
                  <TrendingItem key={item.rank} item={item} />
                ))}
              </div>
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
