'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't made a choice yet
    const consent = localStorage.getItem('vg_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('vg_cookie_consent', 'accepted');
    window.dispatchEvent(new Event('vg_cookie_consent_updated'));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('vg_cookie_consent', 'essential');
    window.dispatchEvent(new Event('vg_cookie_consent_updated'));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie Consent Banner"
      className="fixed bottom-0 inset-x-0 z-50 bg-slate-dark text-white border-t-2 border-accent-orange shadow-2xl p-4 md:p-6 transition-all duration-300"
    >
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-orange shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-accent-orange">
              Privacy & Cookie Notice
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Venture Graph uses essential cookies and aggregated analytics to maintain site performance,
            remember user preferences (such as theme choice), and deliver startup intelligence. Review our{' '}
            <Link
              href="/cookie-policy"
              className="text-accent-orange underline hover:opacity-80 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded-sm"
            >
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy-policy"
              className="text-accent-orange underline hover:opacity-80 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded-sm"
            >
              Privacy Policy
            </Link>{' '}
            to learn more.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleAcceptNecessary}
            className="px-4 py-2 border border-white/20 hover:border-white text-gray-300 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-5 py-2 bg-accent-orange hover:opacity-90 text-white text-[11px] font-extrabold uppercase tracking-wider transition-opacity cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
};
