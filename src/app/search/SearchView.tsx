'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileDrawer } from '@/components/MobileDrawer';
import { Footer } from '@/components/Footer';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';
import { createClient } from '@/lib/supabase/client';
import { BrandedLoader } from '@/components/BrandedLoader';

interface SearchPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_type: string | null;
  published_at: string | null;
  category: string | null;
  subcategory: string | null;
  total_raised: string | null;
}

function getPostPath(contentType: string | null, slug: string): string {
  if (contentType === 'case_study') return `/articles/${slug}`;
  if (contentType === 'lessons_hub' || contentType === 'lessons') return `/lessons/${slug}`;
  return `/news/${slug}`;
}

function getContentTypeLabel(contentType: string | null): string {
  switch (contentType) {
    case 'case_study':        return 'POST-MORTEM';
    case 'lessons_hub':       return 'LESSONS';
    case 'lessons':           return 'LESSONS';
    case 'news':              return 'NEWS DISPATCH';
    case 'founder_playbook':  return 'PLAYBOOK';
    case 'trend_analysis':    return 'ANALYSIS';
    default:                  return 'INTELLIGENCE';
  }
}

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'case_study' | 'news' | 'lessons'>('all');
  const [results, setResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Header & Drawer states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Run search whenever URL query changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    let isMounted = true;
    async function executeSearch() {
      setLoading(true);
      setHasSearched(true);
      try {
        const supabase = createClient();
        const cleanQuery = q.trim().replace(/[%_,]/g, '');
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, excerpt, content_type, published_at, category, subcategory, total_raised')
          .eq('status', 'published')
          .is('deleted_at', null)
          .or(`title.ilike.%${cleanQuery}%,excerpt.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%,subcategory.ilike.%${cleanQuery}%`)
          .order('published_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        if (isMounted) {
          setResults((data as SearchPost[]) || []);
        }
      } catch (err) {
        console.error('Search failed:', err);
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    executeSearch();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  // Filter results
  const filteredResults = results.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'case_study') return item.content_type === 'case_study';
    if (activeFilter === 'news') return item.content_type === 'news';
    if (activeFilter === 'lessons') {
      return item.content_type === 'lessons_hub' || item.content_type === 'lessons';
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={NAV_CATEGORIES}
        secondaryItems={SECONDARY_NAV_ITEMS}
      />

      {/* Main Search View */}
      <main
        id="main-content"
        className="w-full flex-1"
        style={{ paddingTop: 'var(--header-height, 11rem)' }}
      >
        {/* Search Header Banner */}
        <section className="w-full bg-surface-container-low border-b border-outline-variant/30 py-8 lg:py-12">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6">
            <span className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange block mb-2 font-label-sm">
              Archive Search
            </span>
            <h1 className="font-masthead text-3xl sm:text-4xl lg:text-5xl text-on-surface uppercase tracking-tight leading-tight mb-6">
              Search Venture Graph
            </h1>

            {/* Search Input Bar */}
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <label htmlFor="search-page-input" className="sr-only">
                  Search query
                </label>
                <input
                  id="search-page-input"
                  name="q"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by company name, round, or keyword..."
                  className="w-full px-4 py-3 pl-11 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange transition-all"
                  aria-label="Search query"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none">
                  search
                </span>
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                    aria-label="Clear search query"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-accent-orange hover:opacity-90 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange shrink-0"
              >
                Search
              </button>
            </form>

            {/* Filter Pills */}
            {hasSearched && (
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <span className="text-xs font-bold text-secondary mr-2">Filter:</span>
                {(
                  [
                    { id: 'all', label: 'All Results' },
                    { id: 'case_study', label: 'Post-Mortems' },
                    { id: 'news', label: 'News & Alerts' },
                    { id: 'lessons', label: 'Lessons' },
                  ] as const
                ).map((f) => {
                  const count =
                    f.id === 'all'
                      ? results.length
                      : results.filter((r) => {
                          if (f.id === 'case_study') return r.content_type === 'case_study';
                          if (f.id === 'news') return r.content_type === 'news';
                          if (f.id === 'lessons') {
                            return r.content_type === 'lessons_hub' || r.content_type === 'lessons';
                          }
                          return true;
                        }).length;

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange ${
                        activeFilter === f.id
                          ? 'bg-slate-dark text-white dark:bg-white dark:text-slate-dark'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {f.label} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Search Results List */}
        <section className="max-w-[1040px] mx-auto px-4 sm:px-6 py-10">
          {loading ? (
            <div className="py-16">
              <BrandedLoader size="md" label="Searching intelligence archive..." />
            </div>
          ) : !hasSearched ? (
            <div className="py-16 text-center border border-dashed border-outline-variant/40 rounded-xl p-8 max-w-xl mx-auto">
              <span className="material-symbols-outlined text-4xl text-secondary mb-3">
                travel_explore
              </span>
              <h2 className="text-lg font-bold text-on-surface mb-2">Explore the Archive</h2>
              <p className="text-sm text-secondary leading-relaxed mb-6">
                Search through our catalog of shutdown post-mortems, venture rounds, regulatory actions, and founder lessons.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {['Fast', 'Convoy', 'Seed funding', 'AI shutdown', 'Fintech'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1 bg-surface-container hover:bg-accent-orange hover:text-white rounded-full text-on-surface-variant transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <span className="material-symbols-outlined text-4xl text-secondary mb-3">
                search_off
              </span>
              <h2 className="text-lg font-bold text-on-surface mb-2">No results found</h2>
              <p className="text-sm text-secondary leading-relaxed">
                No matching stories or insights found for &ldquo;<span className="text-on-surface font-semibold">{searchParams.get('q')}</span>&rdquo; in this category.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-6 pb-2 border-b border-outline-variant/30">
                Found {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} for &ldquo;{searchParams.get('q')}&rdquo;
              </div>

              <div className="divide-y divide-outline-variant/30">
                {filteredResults.map((item) => (
                  <article key={item.id} className="py-6 first:pt-0 group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-accent-orange/10 text-accent-orange">
                        {getContentTypeLabel(item.content_type)}
                      </span>
                      {item.published_at && (
                        <span className="text-xs text-secondary font-mono">
                          {new Date(item.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {item.total_raised && (
                        <span className="text-xs text-secondary font-mono">
                          · Raised {item.total_raised}
                        </span>
                      )}
                    </div>

                    <h3 className="font-headline-sm text-xl lg:text-2xl font-bold text-on-surface group-hover:text-accent-orange transition-colors leading-tight mb-2">
                      <Link href={getPostPath(item.content_type, item.slug)}>
                        {item.title}
                      </Link>
                    </h3>

                    {item.excerpt && (
                      <p className="text-sm text-secondary leading-relaxed line-clamp-2 max-w-3xl">
                        {item.excerpt}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
