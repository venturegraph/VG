'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface TickerPost {
  title: string;
  slug: string;
  content_type: string | null;
}

function getPostPath(contentType: string | null, slug: string): string {
  if (contentType === 'case_study') return `/articles/${slug}`;
  if (contentType === 'lessons_hub' || contentType === 'lessons') return `/lessons/${slug}`;
  return `/news/${slug}`;
}

function getTickerLabel(contentType: string | null): string {
  switch (contentType) {
    case 'case_study':        return '[SHUTDOWN]';
    case 'lessons_hub':       return '[INSIGHT]';
    case 'lessons':           return '[INSIGHT]';
    case 'news':              return '[NEWS]';
    case 'founder_playbook':  return '[PLAYBOOK]';
    case 'trend_analysis':    return '[TREND]';
    default:                  return '[LATEST]';
  }
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('Thursday, October 24, 2024');
  const [tickerPosts, setTickerPosts] = useState<TickerPost[]>([]);
  const [tickerLoading, setTickerLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Format dynamic date on client side
  useEffect(() => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    } catch {
      // fallback to approved date
    }
  }, []);

  // Publish real rendered header height as CSS variable so pages can offset correctly
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        document.documentElement.style.setProperty(
          '--header-height',
          `${entry.contentRect.height}px`
        );
      }
    });
    observer.observe(el);
    // Set initial value synchronously for the first paint
    document.documentElement.style.setProperty(
      '--header-height',
      `${el.getBoundingClientRect().height}px`
    );
    return () => observer.disconnect();
  }, []);

  // Fetch latest posts for ticker bar
  useEffect(() => {
    let isMounted = true;
    async function fetchTicker() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('posts')
          .select('title, slug, content_type')
          .eq('status', 'published')
          .is('deleted_at', null)
          .order('published_at', { ascending: false })
          .limit(5);
        if (isMounted && data && data.length > 0) {
          setTickerPosts(data as TickerPost[]);
        }
      } catch {
        // fail silently — ticker is decorative
      } finally {
        if (isMounted) setTickerLoading(false);
      }
    }
    fetchTicker();
    return () => { isMounted = false; };
  }, []);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // ESC key closes search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-slate-dark shadow-sm transition-colors"
    >
      {/* ── ROW 1: UTILITY BAR ─────────────────────────────────────────────── */}
      <div className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-dark">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 h-10 flex items-center justify-between">
          {/* Left: Date + tagline */}
          <div className="flex items-center gap-3 overflow-hidden">
            <span
              id="header-current-date"
              className="font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider text-[11px] whitespace-nowrap"
            >
              {currentDate}
            </span>
            <span className="text-gray-300 dark:text-gray-600 hidden md:inline select-none">/</span>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hidden md:inline-block font-semibold truncate">
              The Startup Mortality &amp; Capital Index
            </span>
          </div>

          {/* Right: Subscribe + icon cluster */}
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 shrink-0">
            <a
              href="#newsletter-signup"
              className="hidden sm:inline-flex items-center px-3 py-1 bg-accent-orange text-white text-[11px] font-extrabold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Subscribe
            </a>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline select-none">/</span>

            {/* Search trigger */}
            <button
              aria-label="Search stories"
              id="search-open-btn"
              type="button"
              className="p-1 hover:text-accent-orange transition-colors focus:outline-none"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Theme toggle */}
            <button
              aria-label="Toggle color mode"
              type="button"
              className="p-1 hover:text-accent-orange transition-colors focus:outline-none"
              onClick={onToggleDarkMode}
            >
              {isDarkMode ? (
                /* Sun — switch to light */
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                /* Moon — switch to dark */
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Account / Admin */}
            <Link
              href="/admin"
              aria-label="Account / Admin"
              className="p-1 hover:text-accent-orange transition-colors focus:outline-none"
              title="Admin panel"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── ROW 2: MASTHEAD WORDMARK ────────────────────────────────────────── */}
      <div className="relative w-full bg-white dark:bg-slate-dark border-b-2 border-slate-dark dark:border-gray-600 pt-4 pb-3 px-6 sm:px-10">
        <div className="max-w-[1440px] mx-auto flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            aria-label="Open mobile menu"
            id="mobile-menu-open-btn"
            type="button"
            className="lg:hidden p-1.5 text-slate-dark dark:text-gray-200 hover:text-accent-orange transition-colors shrink-0"
            onClick={onOpenMobileMenu}
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>

          {/* Wordmark — VENTURE GRAPH (two words with intentional space) */}
          <Link href="/" className="group inline-block">
            <span className="font-masthead text-[48px] sm:text-[68px] md:text-[88px] lg:text-[100px] text-slate-dark dark:text-white tracking-tight uppercase select-none leading-none transition-opacity group-hover:opacity-90 block">
              VENTURE{' '}GRAPH
            </span>
          </Link>
        </div>

        {/* Search overlay — covers the full masthead row when open */}
        <div
          id="header-search-bar"
          className={`absolute inset-0 bg-white dark:bg-slate-dark z-20 px-6 sm:px-10 flex items-center justify-between gap-3 transition-all duration-200 ${
            isSearchOpen ? 'flex' : 'hidden'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 max-w-4xl mx-auto">
            <svg className="w-5 h-5 stroke-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              id="header-search-input"
              type="text"
              autoComplete="off"
              className="w-full bg-transparent border-none text-slate-dark dark:text-white placeholder:text-gray-400 focus:ring-0 text-sm py-2 focus:outline-none"
              placeholder="Search by company name, round, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            aria-label="Close search"
            id="search-close-btn"
            type="button"
            className="p-1.5 text-gray-500 hover:text-slate-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-1 text-xs"
            onClick={handleCloseSearch}
          >
            <span className="hidden sm:inline text-gray-400 font-mono text-xs">ESC</span>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* ── ROW 3: CATEGORY NAV (with dropdowns — replaces PrimaryNav) ─────── */}
      <nav
        aria-label="Primary Navigation"
        className="relative z-30 w-full bg-white dark:bg-slate-dark border-b-2 border-slate-dark dark:border-gray-600"
      >
        {/* On desktop (lg+), no overflow is set on any ancestor so dropdowns render freely
            without clipping. On mobile (<lg), horizontal scroll is retained while dropdowns
            are inactive, preventing scroll/dropdown conflict. */}
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 max-lg:overflow-x-auto max-lg:no-scrollbar lg:overflow-visible">
          <div className="flex items-center py-3 gap-4 sm:gap-5 lg:gap-5 xl:gap-7 text-[11px] lg:text-[12px] font-black uppercase tracking-[0.065em] text-slate-dark dark:text-gray-100 max-lg:min-w-max">

            {/* Parent categories — each with a hover dropdown */}
            {NAV_CATEGORIES.map((category) => (
              <div key={category.title} className="relative group shrink-0">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded="false"
                  className="whitespace-nowrap hover:text-accent-orange transition-colors pb-0.5 border-b-2 border-transparent hover:border-accent-orange flex items-center gap-0.5 cursor-default"
                >
                  {category.title}
                  <span className="material-symbols-outlined text-[13px] opacity-50 group-hover:rotate-180 transition-transform duration-200 ml-0.5">
                    expand_more
                  </span>
                </button>

                {/* Dropdown panel — z-50 in z-30 nav row renders on top of ticker (z-10) and page content;
                    scoped to lg:group-hover so dropdowns only activate on non-scrolling desktop */}
                <div className="absolute left-0 top-full pt-1.5 hidden lg:group-hover:block lg:group-focus-within:block z-50">
                  <div
                    className={`${category.dropdownWidth || 'w-52'} bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5`}
                  >
                    {category.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-accent-orange transition-colors ${
                          item.description ? 'flex flex-col px-4 py-2.5' : 'px-4 py-2 text-xs font-semibold text-slate-dark dark:text-gray-200 normal-case tracking-normal'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-dark dark:text-gray-100 uppercase tracking-wide">{item.name}</span>
                        {item.description && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal normal-case tracking-normal mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Divider */}
            <span className="text-gray-300 dark:text-gray-600 shrink-0 hidden sm:inline select-none font-normal">|</span>

            {/* Standalone editorial sections — flat links */}
            {SECONDARY_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap hover:text-accent-orange transition-colors pb-0.5 border-b-2 border-transparent hover:border-accent-orange shrink-0"
              >
                {item.label}
              </Link>
            ))}

            {/* Updated hourly badge — far right, large screens only */}
            <span className="hidden xl:inline-block ml-auto text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider border border-gray-200 dark:border-gray-700 px-2.5 py-1 uppercase shrink-0 normal-case">
              Updated hourly
            </span>
          </div>
        </div>
      </nav>

      {/* ── ROW 4: TICKER BAR ───────────────────────────────────────────────── */}
      <aside className="relative z-10 w-full bg-slate-dark text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 h-11 flex items-center">
          {/* LATEST badge */}
          <div className="flex-shrink-0 flex items-center pr-4 border-r border-gray-700 mr-4">
            <span className="bg-accent-orange text-white text-[11px] font-extrabold uppercase px-2.5 py-1 tracking-widest leading-none">
              LATEST
            </span>
          </div>

          {/* Ticker content */}
          <div className="flex items-center text-xs font-medium text-white overflow-hidden gap-3 min-w-0">
            {tickerLoading ? (
              <span className="text-gray-500 animate-pulse">
                Loading latest intelligence...
              </span>
            ) : tickerPosts.length === 0 ? (
              <span className="text-gray-500">
                No recent posts available.
              </span>
            ) : (
              tickerPosts.map((post, idx) => (
                <React.Fragment key={post.slug}>
                  <Link
                    href={getPostPath(post.content_type, post.slug)}
                    className="hover:text-accent-orange transition-colors truncate shrink min-w-0"
                  >
                    <span className="font-bold text-accent-orange mr-1.5 shrink-0">
                      {getTickerLabel(post.content_type)}
                    </span>
                    {post.title}
                  </Link>
                  {idx < tickerPosts.length - 1 && (
                    <span className="text-gray-600 select-none font-bold shrink-0">|</span>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </aside>
    </header>
  );
};
