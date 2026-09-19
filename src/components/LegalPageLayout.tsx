'use client';

import React, { useState, useEffect } from 'react';
import { Header, MobileDrawer, Newsletter, Footer } from '@/components';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';

interface LegalPageLayoutProps {
  title: string;
  badge?: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  badge = 'Compliance & Legal Notice',
  lastUpdated,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans transition-colors duration-200">
      {/* HEADER */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* MOBILE DRAWER */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={NAV_CATEGORIES}
        secondaryItems={SECONDARY_NAV_ITEMS}
      />

      {/* MAIN CONTENT */}
      <main
        className="w-full flex-1"
        style={{ paddingTop: 'var(--header-height, 11rem)' }}
      >
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Header Block */}
          <div className="border-b border-outline-variant/30 pb-8 mb-10">
            <span className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange block mb-2">
              {badge}
            </span>
            <h1 className="font-masthead text-4xl sm:text-5xl lg:text-6xl text-on-surface uppercase tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-4">
              Last updated: {lastUpdated} · Venture Graph Editorial & Compliance
            </p>
          </div>

          {/* Editorial / Review Notice Banner */}
          <div className="p-4 mb-10 bg-surface-container-low border-l-4 border-accent-orange rounded-r-md text-xs text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface font-semibold block mb-1">
              Editorial Notice & Review Status:
            </strong>
            This legal document establishes the governing policies for Venture Graph. Our terms and privacy disclosures are regularly reviewed and updated to comply with applicable data protection regulations (including GDPR, CCPA/CPRA, and CAN-SPAM).
          </div>

          {/* Document Content */}
          <div className="legal-prose space-y-8 text-on-surface leading-relaxed text-sm sm:text-base">
            {children}
          </div>
        </div>

        {/* NEWSLETTER */}
        <Newsletter />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};
