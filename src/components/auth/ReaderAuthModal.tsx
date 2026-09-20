'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ReaderAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const ReaderAuthModal: React.FC<ReaderAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialMode);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();

      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.href : undefined,
          },
        });
        if (error) throw error;
        setSuccessMessage('Magic link dispatched! Check your email inbox to sign in instantly.');
        return;
      }

      if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || splitEmail(email),
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          setSuccessMessage('Reader account created successfully!');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        } else {
          setSuccessMessage(
            'Confirmation email sent! Please verify your email to finish activating your account.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        setSuccessMessage('Signed in successfully!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const splitEmail = (em: string) => em.split('@')[0] || 'Reader';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 text-on-surface">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 p-1 text-secondary hover:text-on-surface rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <span className="text-[11px] font-black uppercase tracking-[0.1em] text-accent-orange font-label-sm block mb-1">
            Venture Graph Reader Access
          </span>
          <h2 id="reader-auth-title" className="font-masthead text-2xl uppercase tracking-tight text-on-surface">
            {tab === 'signin' ? 'Sign In to Your Account' : 'Create Reader Account'}
          </h2>
          <p className="text-xs text-secondary mt-1 max-w-xs mx-auto">
            Save startup post-mortems to read later, track funding rounds, and join the verified editorial discussion.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-outline-variant/30 mb-5">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
              tab === 'signin'
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${
              tab === 'signup'
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback banners */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-medium text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && !useMagicLink && (
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="auth-name">
                Full Name or Alias
              </label>
              <input
                id="auth-name"
                name="fullName"
                autoComplete="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="auth-email">
              Email Address *
            </label>
            <input
              id="auth-email"
              name="email"
              autoComplete="email"
              ref={emailInputRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@venture.com"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            />
          </div>

          {!useMagicLink && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-on-surface" htmlFor="auth-password">
                  Password *
                </label>
              </div>
              <input
                id="auth-password"
                name="password"
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(!useMagicLink);
                setErrorMessage(null);
              }}
              className="text-[11px] text-accent-orange hover:underline font-semibold"
            >
              {useMagicLink ? '← Use Password Instead' : '⚡ Use Passwordless Magic Link'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-accent-orange hover:opacity-90 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg transition-opacity flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {useMagicLink
                  ? 'Send Magic Link'
                  : tab === 'signin'
                  ? 'Sign In'
                  : 'Create Free Account'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
