'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';
import { BrandedLoader } from '@/components/BrandedLoader';

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

interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_type: string | null;
  published_at: string | null;
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
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentDate, setCurrentDate] = useState('Thursday, October 24, 2024');
  const [tickerPosts, setTickerPosts] = useState<TickerPost[]>([]);
  const [tickerLoading, setTickerLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchOpenBtnRef = useRef<HTMLButtonElement>(null);
  const searchCloseBtnRef = useRef<HTMLButtonElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
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

  const handleOpenSearch = () => {
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current.focus();
    } else {
      searchOpenBtnRef.current?.focus();
    }
  };

  // ESC key closes search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        handleCloseSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Debounced search query
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const cleanQuery = trimmed.replace(/[%_,]/g, '');
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, excerpt, content_type, published_at')
          .eq('status', 'published')
          .is('deleted_at', null)
          .or(`title.ilike.%${cleanQuery}%,excerpt.ilike.%${cleanQuery}%`)
          .order('published_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setSearchResults((data as SearchResultItem[]) || []);
      } catch (err) {
        console.error('Header search query error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      const q = searchQuery.trim();
      handleCloseSearch();
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  // Focus trap inside search overlay
  const handleSearchTrapKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const overlay = searchOverlayRef.current;
      if (!overlay) return;
      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>('input, button, a[href]')
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

      if (focusable.length < 2) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
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
              className="hidden sm:inline-flex items-center px-3 py-1 bg-accent-orange text-white text-[11px] font-extrabold uppercase tracking-widest hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2"
            >
              Subscribe
            </a>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline select-none">/</span>

            {/* Search trigger */}
            <button
              ref={searchOpenBtnRef}
              aria-label="Search stories"
              id="search-open-btn"
              type="button"
              className="p-1 hover:text-accent-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded"
              onClick={handleOpenSearch}
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
              className="p-1 hover:text-accent-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded"
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
              className="p-1 hover:text-accent-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded"
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
            className="lg:hidden p-1.5 text-slate-dark dark:text-gray-200 hover:text-accent-orange transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded"
            onClick={onOpenMobileMenu}
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>

          {/* Wordmark — VENTURE GRAPH (two words with intentional space) */}
          <Link href="/" className="group inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded">
            <span className="font-masthead text-[48px] sm:text-[68px] md:text-[88px] lg:text-[100px] text-slate-dark dark:text-white tracking-tight uppercase select-none leading-none transition-opacity group-hover:opacity-90 block">
              VENTURE{' '}GRAPH
            </span>
          </Link>
        </div>

        {/* Search overlay — covers the full masthead row when open */}
        <div
          ref={searchOverlayRef}
          id="header-search-bar"
          role="dialog"
          aria-modal="true"
          aria-label="Site Search"
          onKeyDown={handleSearchTrapKeyDown}
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
              className="w-full bg-transparent border-none text-slate-dark dark:text-white placeholder:text-gray-400 text-sm py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded px-2"
              placeholder="Search company name, round, or keyword (Press Enter for all results)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <button
            ref={searchCloseBtnRef}
            aria-label="Close search"
            id="search-close-btn"
            type="button"
            className="p-1.5 text-gray-500 hover:text-slate-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            onClick={handleCloseSearch}
          >
            <span className="hidden sm:inline text-gray-400 font-mono text-xs">ESC</span>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Live Search Results Dropdown */}
          {searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 max-w-4xl mx-auto mt-1 bg-white dark:bg-slate-dark border border-gray-200 dark:border-gray-700 shadow-2xl rounded-b-lg overflow-hidden z-50">
              {isSearching ? (
                <BrandedLoader size="sm" label="Searching intelligence..." />
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800/60 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>Top Matches ({searchResults.length})</span>
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={handleCloseSearch}
                      className="text-accent-orange hover:underline normal-case text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded"
                    >
                      View all results &rarr;
                    </Link>
                  </div>
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={getPostPath(item.content_type, item.slug)}
                      onClick={handleCloseSearch}
                      className="block p-3.5 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-inset"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-accent-orange/10 text-accent-orange uppercase tracking-wider">
                          {getTickerLabel(item.content_type)}
                        </span>
                        {item.published_at && (
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-dark dark:text-gray-100 leading-snug">
                        {item.title}
                      </div>
                      {item.excerpt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1 font-normal">
                          {item.excerpt}
                        </p>
                      )}
                    </Link>
                  ))}
                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={handleCloseSearch}
                      className="text-xs font-bold text-accent-orange hover:underline uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded"
                    >
                      View all results on search page &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                  No matching stories or insights found for <span className="font-semibold text-slate-dark dark:text-white">&ldquo;{searchQuery}&rdquo;</span>.
                  <div className="mt-2 text-[11px]">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-[10px] font-mono">Enter</kbd> to search the full archive.
                  </div>
                </div>
              )}
            </div>
          )}
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
            {NAV_CATEGORIES.map((category) => {
              const isOpen = openDropdown === category.title;
              return (
                <div
                  key={category.title}
                  className="relative group shrink-0"
                  onMouseEnter={() => setOpenDropdown(category.title)}
                  onMouseLeave={() => setOpenDropdown(null)}
                  onFocus={() => setOpenDropdown(category.title)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setOpenDropdown(null);
                    }
                  }}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen ? 'true' : 'false'}
                    className="whitespace-nowrap hover:text-accent-orange transition-colors pb-0.5 border-b-2 border-transparent hover:border-accent-orange flex items-center gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded-sm"
                    onClick={() => setOpenDropdown((prev) => (prev === category.title ? null : category.title))}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setOpenDropdown(null);
                        (e.currentTarget as HTMLElement).focus();
                      }
                    }}
                  >
                    {category.title}
                    <span
                      className={`material-symbols-outlined text-[13px] opacity-50 transition-transform duration-200 ml-0.5 ${
                        isOpen ? 'rotate-180' : 'group-hover:rotate-180'
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Dropdown panel — z-50 in z-30 nav row renders on top of ticker (z-10) and page content;
                      scoped to lg:group-hover so dropdowns only activate on non-scrolling desktop */}
                  <div
                    className={`absolute left-0 top-full pt-1.5 z-50 ${
                      isOpen ? 'block' : 'hidden lg:group-hover:block lg:group-focus-within:block'
                    }`}
                  >
                    <div
                      className={`${category.dropdownWidth || 'w-52'} bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5`}
                    >
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`block hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-accent-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-inset ${
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
              );
            })}

            {/* Divider */}
            <span className="text-gray-300 dark:text-gray-600 shrink-0 hidden sm:inline select-none font-normal">|</span>

            {/* Standalone editorial sections — flat links */}
            {SECONDARY_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap hover:text-accent-orange transition-colors pb-0.5 border-b-2 border-transparent hover:border-accent-orange shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded-sm"
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
                    className="hover:text-accent-orange transition-colors truncate shrink min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded-sm"
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
