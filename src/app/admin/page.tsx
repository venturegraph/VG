'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/admin/posts';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync theme
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

  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-venture-graph');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If placeholder credentials, provide a friendly hint
        if (!isSupabaseConfigured) {
          setErrorMessage(
            `${error.message}. (Supabase credentials in .env.local are currently placeholders. Please replace NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY with your live project keys).`
          );
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign-in.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between selection:bg-primary-container selection:text-on-primary">
      {/* Minimal Top Bar */}
      <header className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center">
            <svg
              className="w-7 h-7 text-primary transition-transform group-hover:scale-105"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 3v18h18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 9l4 4 3-3 6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="20"
                cy="16"
                r="1.5"
                className="fill-primary-container stroke-primary-container"
              />
            </svg>
            <div className="ml-2 flex flex-col">
              <span className="font-headline-lg font-bold tracking-tight text-on-surface text-lg leading-none">
                VENTURE<span className="text-primary-container">GRAPH</span>
              </span>
              <span className="text-[9px] font-label-sm tracking-widest text-secondary uppercase mt-0.5">
                Admin Portal
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <Link
            href="/"
            className="text-xs font-label-sm font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Site
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="w-full max-w-md mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container mb-4 text-primary">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight">
              Editorial Login
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-on-surface-variant max-w-xs mx-auto">
              Sign in with your Supabase credentials to access posts and content intelligence.
            </p>
          </div>

          {/* Environment Banner Notice if placeholder */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-3.5 rounded-xl bg-surface-container-low border border-primary/20 text-xs text-on-surface-variant flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <div className="leading-relaxed">
                <strong className="text-on-surface font-semibold block mb-0.5">
                  Supabase Setup Ready
                </strong>
                Configure your project credentials in <code className="px-1 py-0.5 rounded bg-surface-container text-primary font-mono text-[11px]">.env.local</code> to authenticate against your live database.
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-label-md font-semibold text-on-surface mb-1.5 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                  mail
                </span>
                <input
                  id="admin-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@venturegraph.me"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-label-md font-semibold text-on-surface uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                  key
                </span>
                <input
                  id="admin-password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-primary-container text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security / System Footer Note */}
        <p className="mt-8 text-center text-xs text-secondary font-label-sm">
          Protected by Supabase Auth & JWT session encryption.
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-6 text-center text-xs text-secondary border-t border-outline-variant/20">
        © 2024 Venture Graph Editorial Systems. All rights reserved.
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-secondary text-sm">
          Loading admin portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
