'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && consent) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section
      className="w-full bg-slate-dark text-white border-t border-white/10"
      id="newsletter-signup"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-14 lg:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 border border-white/10 p-8 lg:p-12">

          {/* Left: Heading block */}
          <div className="max-w-xl">
            <span className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange">
              Editorial Dispatch
            </span>
            <h2 className="font-masthead text-3xl lg:text-4xl text-white mt-2 uppercase tracking-tight leading-none">
              Get Venture Graph in Your Inbox
            </h2>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed max-w-md">
              A weekly dispatch covering startup funding rounds, shutdown case studies, and founder lessons.
            </p>
          </div>

          {/* Right: Form or success state */}
          {isSubscribed ? (
            <div className="w-full md:w-auto flex items-center gap-3 px-6 py-4 border border-accent-orange/40 bg-accent-orange/10 text-sm font-semibold text-white shrink-0">
              <svg className="w-5 h-5 text-accent-orange fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Subscribed to the Venture Graph weekly dispatch!</span>
            </div>
          ) : (
            <form
              className="w-full md:w-auto flex flex-col shrink-0 max-w-md"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  aria-label="Email address"
                  className="px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-accent-orange transition-colors min-w-[260px] flex-1"
                  placeholder="Enter your email address"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  className="px-6 py-3 bg-accent-orange hover:opacity-90 disabled:opacity-50 text-white text-[11px] font-extrabold uppercase tracking-widest transition-opacity shrink-0 cursor-pointer"
                  disabled={!consent}
                  type="submit"
                >
                  Subscribe
                </button>
              </div>

              {/* GDPR / CAN-SPAM Consent Checkbox */}
              <label className="flex items-start gap-2.5 mt-3 cursor-pointer text-xs text-gray-400 select-none">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border border-white/30 bg-white/5 text-accent-orange accent-[#FA654D] cursor-pointer"
                />
                <span className="leading-snug">
                  I agree to receive the weekly email dispatch and accept the{' '}
                  <Link
                    href="/privacy-policy"
                    className="text-accent-orange underline hover:opacity-80 transition-opacity font-medium"
                  >
                    Privacy Policy
                  </Link>
                  . Unsubscribe anytime.
                </span>
              </label>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
