'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PostForm } from '@/components/admin/PostForm';

export default function AdminNewPostPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync theme with localStorage
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

  // Fetch current user from Supabase client
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        } else {
          setUserEmail('editorial-admin@venturegraph.me');
        }
      } catch {
        setUserEmail('editorial-admin@venturegraph.me');
      }
    };
    fetchUser();
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="w-full max-w-[1520px] mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <svg
                className="w-6 h-6 text-primary transition-transform group-hover:scale-105"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 9l4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
                <circle
                  cx="20"
                  cy="16"
                  r="1.5"
                  className="fill-primary-container stroke-primary-container"
                />
              </svg>
              <div className="flex items-center gap-2">
                <span className="font-headline-lg font-bold tracking-tight text-on-surface text-base leading-none">
                  VENTURE<span className="text-primary-container">GRAPH</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase">
                  CMS
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 border-l border-outline-variant/30 pl-6">
              <Link
                href="/admin/posts"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                Posts & Intelligence
              </Link>
              <Link
                href="/admin/new"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-semibold bg-surface-container text-primary"
              >
                + New Post
              </Link>
              <Link
                href="/"
                target="_blank"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
              >
                <span>Live Site</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-secondary truncate max-w-[180px]">
                {userEmail || 'admin'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-secondary hover:text-error text-xs font-label-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="w-full max-w-[1520px] mx-auto px-4 lg:px-8 py-8 flex-1">
        <PostForm isDarkMode={isDarkMode} />
      </main>
    </div>
  );
}
