'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Header,
  MobileDrawer,
  FailureCard,
  Newsletter,
  Footer,
  AtAGlanceStats,
  LessonsCallout,
  ArticleTableOfContents,
} from '@/components';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import {
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/lib/taxonomy';
import { CaseStudyArticle, Post } from '@/types';
import DOMPurify from 'isomorphic-dompurify';

interface ArticleViewProps {
  initialArticle: CaseStudyArticle;
  initialRelatedCaseStudies: Post[];
  slug: string;
}

export function ArticleView({
  initialArticle,
  initialRelatedCaseStudies,
  slug,
}: ArticleViewProps) {
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
  const relatedCaseStudies = initialRelatedCaseStudies;

  // Process headings and inject anchor IDs for table of contents jump-links
  const { processedHtml, headings } = useMemo(() => {
    const list: { id: string; text: string; level: number }[] = [];

    if (article?.htmlContent) {
      let html = article.htmlContent;
      const headingRegex = /<(h[23])(\s+[^>]*)?>(.*?)<\/\1>/gi;

      html = html.replace(headingRegex, (match, tag, attrs = '', innerText) => {
        const cleanText = innerText.replace(/<[^>]*>/g, '').split(/\r?\n/)[0].trim();
        const slugId = cleanText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');

        const level = tag.toLowerCase() === 'h2' ? 2 : 3;
        list.push({ id: slugId, text: cleanText, level });

        const hasId = /id=["'][^"']+["']/i.test(attrs);
        const newAttrs = hasId
          ? attrs.replace(/id=["'][^"']+["']/i, `id="${slugId}"`)
          : `${attrs} id="${slugId}"`;

        const hasClass = /class=["'][^"']+["']/i.test(newAttrs);
        const finalAttrs = hasClass
          ? newAttrs.replace(/class=["']([^"']*)["']/i, 'class="$1 scroll-mt-36"')
          : `${newAttrs} class="scroll-mt-36"`;

        return `<${tag}${finalAttrs}>${innerText}</${tag}>`;
      });

      return { processedHtml: html, headings: list };
    }

    if (article?.content?.sections) {
      article.content.sections.forEach((section) => {
        const h2Id = section.heading
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        list.push({ id: h2Id, text: section.heading, level: 2 });

        if (section.subheading) {
          const h3Id = section.subheading
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
          list.push({ id: h3Id, text: section.subheading, level: 3 });
        }
      });
      return { processedHtml: '', headings: list };
    }

    return { processedHtml: '', headings: [] };
  }, [article]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Top Header & Brand Bar */}
      <Header
        isDarkMode={isDarkMode}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Mobile Off-Canvas Drawer */}
      <MobileDrawer
        categories={NAV_CATEGORIES}
        isOpen={isMobileMenuOpen}
        secondaryItems={SECONDARY_NAV_ITEMS}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Article Main Content Container */}
      <main id="main-content" className="w-full bg-background min-h-screen flex-1 transition-colors duration-200" style={{ paddingTop: 'var(--header-height, 11rem)' }}>
        <article className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-secondary font-label-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/#recent-failures" className="hover:text-primary transition-colors">
              Case Studies
            </Link>
            <span>/</span>
            <span className="text-on-surface truncate max-w-[280px] sm:max-w-md">
              {article.category}
            </span>
          </nav>

          {/* Article Header: Meta Bar, Headline, Hook Subtitle */}
          <header className="mb-10 max-w-4xl">
            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-2.5 py-0.5 rounded bg-on-secondary-fixed text-on-secondary font-label-sm text-[11px] uppercase font-bold tracking-wider">
                {article.tag || article.category}
              </span>
              <span className="font-label-sm text-xs uppercase tracking-wider text-secondary">
                {article.category}
              </span>
              <span className="text-secondary">•</span>
              <span className="font-label-sm text-xs text-secondary">{article.publishDate}</span>
              <span className="text-secondary">•</span>
              <span className="font-label-sm text-xs text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {article.readTime}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight leading-tight font-semibold">
              {article.title}
            </h1>

            {/* Hook Subtitle */}
            <p className="mt-4 font-body-lead text-lg lg:text-xl text-on-surface-variant leading-relaxed">
              {article.subtitle || article.excerpt}
            </p>

            {/* Author & Editorial Trust Bar */}
            {article.author && (
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary border border-outline-variant/30">
                    {article.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">{article.author.name}</div>
                    <div className="text-secondary text-[11px]">{article.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-secondary">
                  <CopyLinkButton />
                  <button
                    aria-label="Bookmark story"
                    className="p-1.5 rounded hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.image && !imageError && (
            <div className="mb-10 w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
              <Image
                alt={article.title}
                className="w-full h-auto max-h-[480px] object-cover object-center"
                src={article.image}
                width={1280}
                height={480}
                sizes="(max-width: 1280px) 100vw, 1280px"
                onError={() => setImageError(true)}
              />
              <div className="p-3 bg-surface-container-low border-t border-outline-variant/20 text-xs text-secondary italic">
                Deconstructed startup wreckage: The structural autopsy of {article.title.split(':')[0]}.
              </div>
            </div>
          )}

          {/* Mobile Collapsible "At a glance" stat box */}
          {article.stats && (
            <div className="lg:hidden">
              <AtAGlanceStats stats={article.stats} />
            </div>
          )}

          {/* Main 2-Column Grid: Long-form article (8 cols) & Desktop Sticky Sidebar (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left/Main Column: Long-Form Editorial Body */}
            <div className="lg:col-span-8 flex flex-col font-body-base text-base text-on-surface leading-relaxed">
              {/* Table of Contents Component */}
              {headings.length > 0 && <ArticleTableOfContents headings={headings} />}

              {/* WordPress / Rich Text Content or Structured Sections */}
              {processedHtml ? (
                <div
                  className="article-rich-content prose dark:prose-invert max-w-none text-on-surface leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(processedHtml, {
                      ADD_ATTR: ['target', 'rel', 'id', 'class'],
                    }),
                  }}
                />
              ) : (
                <>
                  {article.content?.introduction?.map((para, idx) => (
                    <p
                      key={idx}
                      className={`mb-6 text-on-surface-variant ${
                        idx === 0 ? 'text-lg lg:text-xl font-body-lead text-on-surface leading-relaxed' : ''
                      }`}
                    >
                      {para}
                    </p>
                  ))}

                  {/* Sections with H2/H3 hierarchy */}
                  {article.content?.sections?.map((section, sIdx) => {
                    const sectionId = section.heading
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    const subId = section.subheading
                      ? section.subheading
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, '')
                          .trim()
                          .replace(/\s+/g, '-')
                      : '';
                    return (
                      <section key={sIdx} id={sectionId} className="mb-10 scroll-mt-36">
                        <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-semibold tracking-tight leading-snug mb-3">
                          {section.heading}
                        </h2>

                        {section.subheading && (
                          <h3
                            id={subId}
                            className="font-headline-sm text-lg text-secondary font-medium mb-4 italic scroll-mt-36"
                          >
                            {section.subheading}
                          </h3>
                        )}

                        {section.paragraphs.map((p, pIdx) => (
                          <p key={pIdx} className="mb-4 text-on-surface-variant leading-relaxed">
                            {p}
                          </p>
                        ))}

                        {/* Internal Link Callout to Lessons & Insights */}
                        {section.callout && <LessonsCallout callout={section.callout} />}

                        {/* Key Takeaway Callout Box */}
                        {section.keyTakeaway && (
                          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 my-6">
                            <div className="text-xs font-bold uppercase tracking-wider text-primary font-label-sm mb-1">
                              Executive Takeaway
                            </div>
                            <p className="text-sm font-semibold text-on-surface">{section.keyTakeaway}</p>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </>
              )}

              {/* Editorial Disclaimer */}
              <div className="mt-8 pt-6 border-t border-outline-variant/20 text-xs text-secondary leading-relaxed bg-surface-container-low p-4 rounded-xl">
                <span className="font-bold text-on-surface">Editorial Note:</span> This post-mortem is compiled from public SEC regulatory filings, Delaware bankruptcy proceedings, verified investor disclosures, and former executive interviews. Figures reflect all available capital tranches at time of liquidation.
              </div>
            </div>

            {/* Right Column: Desktop Sticky "At a glance" Stat Box */}
            <div className="hidden lg:block lg:col-span-4">
              {article.stats && <AtAGlanceStats stats={article.stats} />}
            </div>
          </div>
        </article>

        {/* SECTION: RELATED CASE STUDIES */}
        {relatedCaseStudies.length > 0 && (
          <section className="w-full bg-surface-container-low py-12 lg:py-16 border-t border-b border-outline-variant/30 transition-colors mt-12">
            <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                    <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                      Related Post-Mortems
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-2xl lg:text-3xl text-on-surface tracking-tight font-semibold">
                    Related Case Studies
                  </h2>
                </div>
                <Link
                  href="/#recent-failures"
                  className="font-body-sm text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all shutdowns <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedCaseStudies.map((item) => (
                  <FailureCard key={item.id} item={item} />
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
