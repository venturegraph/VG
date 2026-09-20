'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { MobileDrawer } from '@/components/MobileDrawer';
import { Footer } from '@/components/Footer';
import { FAQAccordion, FAQItem } from '@/components/FAQAccordion';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';

interface FAQViewProps {
  faqItems: FAQItem[];
}

export function FAQView({ faqItems }: FAQViewProps) {
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
        {/* Masthead Banner */}
        <section className="w-full bg-surface-container-low border-b border-outline-variant/30 py-10 lg:py-16">
          <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange block mb-2 font-label-sm">
              Editorial &amp; Intelligence Reference
            </span>
            <h1 className="font-masthead text-4xl sm:text-5xl lg:text-6xl text-on-surface uppercase tracking-tight leading-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-2xl">
              Everything you need to know about our shutdown investigations, capital mortality index, editorial verification, and contributor playbooks.
            </p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="mb-8">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-widest font-label-sm">
              General Inquiries &amp; Methodology
            </h2>
          </div>

          <FAQAccordion items={faqItems} allowMultiple={true} />

          {/* Contact Support Card */}
          <div className="mt-16 p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1 max-w-md">
              <h3 className="font-headline-sm text-xl font-bold text-on-surface">
                Still have an unanswered question?
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Contact our editorial team directly with tips, corrections, or confidential shutdown briefings.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-accent-orange hover:opacity-90 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg transition-opacity shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            >
              Contact Editorial
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
