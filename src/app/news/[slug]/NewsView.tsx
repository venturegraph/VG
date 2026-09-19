'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Header,
  MobileDrawer,
  FundingCard,
  Newsletter,
  Footer,
  FundingMetricsBar,
  CaseStudyFunnelCard,
} from '@/components';
import {
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/lib/taxonomy';
import { NewsArticle, Post } from '@/types';
import DOMPurify from 'isomorphic-dompurify';

export interface ExtendedNewsArticle extends NewsArticle {
  htmlContent?: string;
}

interface NewsViewProps {
  initialArticle: ExtendedNewsArticle;
  initialRelatedNews: Post[];
  slug: string;
}

export function NewsView({
  initialArticle,
  initialRelatedNews,
  slug,
}: NewsViewProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const article = initialArticle;
  const relatedNews = initialRelatedNews;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        categories={NAV_CATEGORIES}
        isOpen={isMobileMenuOpen}
        secondaryItems={SECONDARY_NAV_ITEMS}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="w-full bg-background min-h-screen flex-1 transition-colors duration-200" style={{ paddingTop: 'var(--header-height, 11rem)' }}>
        <article className="w-full max-w-[1040px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
          {/* Breadcrumb & Live Dispatch Pill */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs font-label-sm">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-secondary">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/#new-fundings" className="hover:text-primary transition-colors">
                Funding News
              </Link>
              <span>/</span>
              <span className="text-on-surface truncate max-w-[200px] sm:max-w-xs">
                {article.category}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-label-sm font-semibold uppercase text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                Verified Dispatch
              </span>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-6">
            {/* Tag / Category Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-[11px] font-semibold uppercase">
                {article.category}
              </span>
              {article.metrics?.capitalType && (
                <span className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider">
                  • {article.metrics.capitalType}
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-on-surface tracking-tight leading-snug font-semibold">
              {article.title}
            </h1>

            {/* Timestamps & Author Row */}
            <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs text-secondary">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="font-medium text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">schedule</span>
                  {article.timestamp}
                </span>
                {article.updatedTime && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-semibold">{article.updatedTime}</span>
                  </>
                )}
                <span>•</span>
                <span>{article.readTime}</span>
              </div>

              {article.author && (
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant font-medium">By {article.author.name}</span>
                  <span className="text-[11px] text-secondary">({article.author.role})</span>
                </div>
              )}
            </div>
          </header>

          {/* Funding Metrics Bar */}
          {article.metrics && <FundingMetricsBar metrics={article.metrics} />}

          {/* Compact Hero Image */}
          {article.image && !imageError && (
            <div className="mb-6 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={article.title}
                className="w-full h-auto max-h-[320px] object-cover object-center"
                src={article.image}
                onError={() => setImageError(true)}
              />
              <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant/20 text-[11px] text-secondary flex items-center justify-between">
                <span>Infrastructure &amp; Capital movement intelligence</span>
                <span>Venture Graph Wire</span>
              </div>
            </div>
          )}

          {/* Case Study Funnel Module */}
          {article.relatedCaseStudySlug && (
            <CaseStudyFunnelCard caseStudySlug={article.relatedCaseStudySlug} />
          )}

          {/* Article News Body */}
          <div className="font-body-base text-base text-on-surface leading-relaxed max-w-3xl space-y-4">
            {article.content.summary && (
              <p className="font-body-lead text-lg text-on-surface font-normal leading-relaxed border-l-2 border-tertiary pl-4 py-1 italic bg-surface-container-low/50 rounded-r">
                {article.content.summary}
              </p>
            )}

            {article.htmlContent && article.htmlContent.includes('<') ? (
              <div
                className="article-html-content font-body-base text-base text-on-surface-variant leading-relaxed max-w-3xl space-y-4"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(article.htmlContent, {
                    ADD_TAGS: ['iframe'],
                    ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'frameborder', 'data-type'],
                  }),
                }}
              />
            ) : (
              article.content.body.map((para, idx) => (
                <p key={idx} className="text-on-surface-variant leading-relaxed">
                  {para}
                </p>
              ))
            )}

            {/* Key Terms Box */}
            {article.content.keyTerms && article.content.keyTerms.length > 0 && (
              <div className="my-6 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface uppercase tracking-wider mb-3 font-label-sm">
                  Key Round Disclosures &amp; Terms
                </h3>
                <div className="divide-y divide-outline-variant/20 text-xs">
                  {article.content.keyTerms.map((term) => (
                    <div key={term.label} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-medium text-secondary">{term.label}</span>
                      <span className="font-semibold text-on-surface">{term.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Quote */}
            {article.content.quote && (
              <blockquote className="my-6 p-5 rounded-xl bg-surface-container border-l-4 border-l-tertiary text-on-surface">
                <p className="font-display-hero text-lg italic leading-snug">
                  &ldquo;{article.content.quote.text}&rdquo;
                </p>
                {article.content.quote.author && (
                  <footer className="mt-2 text-xs font-semibold text-secondary">
                    — {article.content.quote.author}
                    {article.content.quote.role && `, ${article.content.quote.role}`}
                  </footer>
                )}
              </blockquote>
            )}

            {/* Verification Disclaimer */}
            <div className="pt-4 border-t border-outline-variant/20 text-xs text-secondary leading-relaxed">
              <span className="font-semibold text-on-surface">Verification:</span> Figures reported reflect audited filings, direct stakeholder confirmations, or company disclosures published on the date indicated above.
            </div>
          </div>
        </article>

        {/* SECTION: RELATED FUNDING ALERTS */}
        {relatedNews.length > 0 && (
          <section className="w-full bg-surface-container-low py-10 lg:py-14 border-t border-b border-outline-variant/30 transition-colors mt-8">
            <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 bg-tertiary rounded-full" />
                    <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                      Capital Movement
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-2xl lg:text-3xl text-on-surface tracking-tight font-semibold">
                    Related Funding Alerts
                  </h2>
                </div>
                <Link
                  href="/#new-fundings"
                  className="font-body-sm text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all fundings <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedNews.map((item) => (
                  <FundingCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
