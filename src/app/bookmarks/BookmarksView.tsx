'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { MobileDrawer } from '@/components/MobileDrawer';
import { Footer } from '@/components/Footer';
import { BrandedLoader } from '@/components/BrandedLoader';
import { ReaderAuthModal } from '@/components/auth/ReaderAuthModal';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';
import { getCanonicalPostPath } from '@/lib/routes';
import { createClient } from '@/lib/supabase/client';

interface SavedPostItem {
  bookmarkId: string;
  savedAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    content_type: string;
    category?: string;
    meta_description?: string;
    featured_image_url?: string;
    published_at?: string;
  };
}

export function BookmarksView() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [bookmarks, setBookmarks] = useState<SavedPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const fetchBookmarks = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setUser(null);
        setBookmarks([]);
        setIsLoading(false);
        return;
      }

      setUser({ id: userData.user.id, email: userData.user.email });

      // Fetch from Supabase bookmarks table
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          created_at,
          posts (
            id,
            title,
            slug,
            content_type,
            category,
            meta_description,
            featured_image_url,
            published_at
          )
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback: check localStorage for offline/unmigrated table
        const localIds = JSON.parse(localStorage.getItem(`vg_bm_${userData.user.id}`) || '[]');
        if (localIds.length > 0) {
          const { data: fallbackPosts } = await supabase
            .from('posts')
            .select('id, title, slug, content_type, category, meta_description, featured_image_url, published_at')
            .in('id', localIds);

          if (fallbackPosts) {
            setBookmarks(
              fallbackPosts.map((p) => ({
                bookmarkId: p.id,
                savedAt: new Date().toISOString(),
                post: p,
              }))
            );
          }
        } else {
          setBookmarks([]);
        }
      } else if (data) {
        const valid = data
          .filter((item: any) => item.posts)
          .map((item: any) => ({
            bookmarkId: item.id,
            savedAt: item.created_at,
            post: item.posts,
          }));
        setBookmarks(valid);
      }
    } catch {
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchBookmarks();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRemoveBookmark = async (postId: string, bookmarkId: string) => {
    if (!user) return;

    // Optimistic UI update
    setBookmarks((prev) => prev.filter((b) => b.post.id !== postId));

    try {
      const supabase = createClient();
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId);

      // Clean local fallback storage
      const local = JSON.parse(localStorage.getItem(`vg_bm_${user.id}`) || '[]');
      const filtered = local.filter((id: string) => id !== postId);
      localStorage.setItem(`vg_bm_${user.id}`, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  };

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

      <main
        id="main-content"
        className="w-full flex-1"
        style={{ paddingTop: 'var(--header-height, 11rem)' }}
      >
        {/* Masthead Header */}
        <section className="w-full bg-surface-container-low border-b border-outline-variant/30 py-10 lg:py-14">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange block mb-2 font-label-sm">
              Personal Reading Archive
            </span>
            <h1 className="font-masthead text-4xl sm:text-5xl text-on-surface uppercase tracking-tight leading-tight">
              My Bookmarks
            </h1>
            <p className="text-sm sm:text-base text-secondary mt-2 max-w-xl">
              Saved post-mortems, funding alerts, and founder lesson breakdowns saved for study.
            </p>
          </div>
        </section>

        {/* Content Area */}
        <section className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <BrandedLoader label="Retrieving your reading list..." />
            </div>
          ) : !user ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent-orange/10 text-accent-orange mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <h2 className="font-headline-sm text-2xl font-bold text-on-surface">
                Sign In to View Saved Stories
              </h2>
              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                Your bookmarks are synchronized across devices with your reader account. Sign in or register to access your personal reading list.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-accent-orange text-white text-xs font-extrabold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="p-10 sm:p-14 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-surface-container text-secondary mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">bookmark_border</span>
              </div>
              <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                No Bookmarks Saved Yet
              </h2>
              <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                Click the bookmark icon on any startup post-mortem, funding intelligence report, or founder lesson to save it here for later.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-block px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
                >
                  Explore Venture Graph Index
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-secondary pb-2 border-b border-outline-variant/30">
                <span>{bookmarks.length} Saved {bookmarks.length === 1 ? 'Story' : 'Stories'}</span>
              </div>

              <div className="divide-y divide-outline-variant/20">
                {bookmarks.map(({ bookmarkId, savedAt, post }) => {
                  const href = getCanonicalPostPath(post.content_type, post.slug);
                  return (
                    <article
                      key={post.id}
                      className="py-5 flex flex-col sm:flex-row items-start justify-between gap-4 group"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-semibold">
                          <span className="text-accent-orange uppercase font-label-sm tracking-wider">
                            {post.content_type === 'case_study'
                              ? 'Post-Mortem'
                              : post.content_type === 'funding_round'
                              ? 'Funding Round'
                              : 'Founder Lesson'}
                          </span>
                          {post.category && (
                            <>
                              <span className="text-secondary">•</span>
                              <span className="text-secondary">{post.category}</span>
                            </>
                          )}
                        </div>

                        <h3 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface group-hover:text-accent-orange transition-colors">
                          <Link href={href}>{post.title}</Link>
                        </h3>

                        {post.meta_description && (
                          <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                            {post.meta_description}
                          </p>
                        )}

                        <div className="text-[11px] text-secondary">
                          Saved on {new Date(savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 sm:self-center">
                        <Link
                          href={href}
                          className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface rounded-lg transition-colors"
                        >
                          Read Story
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemoveBookmark(post.id, bookmarkId)}
                          aria-label="Remove bookmark"
                          className="p-1.5 text-secondary hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Remove bookmark"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <ReaderAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          fetchBookmarks();
        }}
      />
    </div>
  );
}
