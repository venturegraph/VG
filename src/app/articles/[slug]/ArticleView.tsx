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
  ShareBar,
  ArticleFaqAccordion,
  ArticleGlossary,
} from '@/components';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { BookmarkButton } from '@/components/BookmarkButton';
import { CommentSection } from '@/components/comments/CommentSection';
import {
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/lib/taxonomy';
import { CaseStudyArticle, Post } from '@/types';
import { stripEmbeddedTableOfContents } from '@/lib/sanitize';
import { enhanceArticleHtml } from '@/lib/editorialEnhancements';

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
  const articleBodyRef = React.useRef<HTMLDivElement>(null);

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
      let html = stripEmbeddedTableOfContents(article.htmlContent);
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

      // Ensure all body images have explicit aspect-ratio and lazy loading to prevent CLS
      html = html.replace(/<img\s+([^>]*?)>/gi, (_match, attrs) => {
        let updated = attrs;
        if (!/loading=/i.test(updated)) {
          updated += ' loading="lazy"';
        }
        if (!/aspect-ratio/i.test(updated) && !/width=/i.test(updated)) {
          updated += ' style="aspect-ratio: 16/9; width: 100%; height: auto;"';
        }
        return `<img ${updated}>`;
      });

      // Apply editorial enhancements: FAQ Accordions & Business Glossary cards
      html = enhanceArticleHtml(html);

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
      <ReadingProgressBar targetRef={articleBodyRef} />
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
      <main id="main-content" className="w-full bg-background min-h-screen flex-1 transition-colors duration-200">
        <article className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 pt-6 pb-12 lg:pt-8 lg:pb-16">
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
          <header className="mb-10 max-w-2xl lg:max-w-[700px]">
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
              {article.updatedDate && (
                <>
                  <span className="text-secondary">•</span>
                  <span className="font-label-sm text-xs text-secondary">Updated {article.updatedDate}</span>
                </>
              )}
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
                  <BookmarkButton postId={article.id} postTitle={article.title} slug={article.slug} />
                </div>
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.image && !imageError && (
            <div className="mb-10 w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
              <div className="relative w-full max-h-[480px] overflow-hidden">
                <Image
                  alt={article.title}
                  className="w-full h-auto object-cover object-center"
                  src={article.image}
                  width={1280}
                  height={480}
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  style={{ height: 'auto', aspectRatio: '8 / 3' }}
                  onError={() => setImageError(true)}
                />
              </div>
              <div className="p-3 bg-surface-container-low border-t border-outline-variant/20 text-xs text-secondary italic">
                Deconstructed startup wreckage: The structural autopsy of {article.title.split(':')[0]}.
              </div>
            </div>
          )}

          {/* Mobile Collapsible "At a glance" stat box */}
          {article.stats && (
            <div className="lg:hidden">
              <AtAGlanceStats stats={article.stats} variant="mobile" />
            </div>
          )}

          {/* Main 2-Column Grid: Long-form article (8 cols) & Desktop Sticky Sidebar (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left/Main Column: Long-Form Editorial Body */}
            <div className="lg:col-span-8 max-w-2xl lg:max-w-[700px] lg:pl-6 lg:pr-8 flex flex-col font-body-base text-[18px] text-on-surface leading-[1.8]">
              {/* Table of Contents Component */}
              {headings.length > 0 && <ArticleTableOfContents headings={headings} />}

              {/* WordPress / Rich Text Content or Structured Sections */}
              {processedHtml ? (
                <div
                  ref={articleBodyRef}
                  className="article-rich-content prose prose-lg dark:prose-invert max-w-none text-on-surface text-[18px] leading-[1.8]"
                  dangerouslySetInnerHTML={{
                    __html: processedHtml,
                  }}
                />
              ) : (
                <div ref={articleBodyRef}>
                  {article.content?.introduction?.map((para, idx) => (
                    <p
                      key={idx}
                      className={`mb-6 text-on-surface-variant text-[18px] leading-[1.8] ${
                        idx === 0 ? 'text-xl font-body-lead text-on-surface leading-relaxed' : ''
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

                    const headingLower = section.heading.toLowerCase();
                    const isFaqSection =
                      headingLower.includes('faq') ||
                      headingLower.includes('frequently asked') ||
                      headingLower.includes('questions & answers') ||
                      headingLower.includes('common questions');
                    const isGlossarySection =
                      headingLower.includes('glossary') ||
                      headingLower.includes('key terms') ||
                      headingLower.includes('key terminology');

                    // Interactive FAQ Accordion renderer for structured sections
                    if (isFaqSection) {
                      const faqItems: { question: string; answer: string }[] = [];
                      for (let i = 0; i < section.paragraphs.length; i++) {
                        const p = section.paragraphs[i];
                        // Match Q: ... A: ... in single paragraph
                        const qaMatch = p.match(/(?:Q\d*[:.]|\*\*Q\d*[:.]\*\*)\s*([\s\S]*?)(?:A\d*[:.]|\*\*A\d*[:.]\*\*)\s*([\s\S]*)$/i);
                        if (qaMatch) {
                          faqItems.push({
                            question: qaMatch[1].trim(),
                            answer: qaMatch[2].trim(),
                          });
                        } else if (/^Q\d*[.:]/i.test(p) || p.startsWith('Question:')) {
                          const nextP = section.paragraphs[i + 1] || '';
                          faqItems.push({
                            question: p.replace(/^Q\d*[.:]\s*/i, '').trim(),
                            answer: nextP.replace(/^A\d*[.:]\s*/i, '').trim(),
                          });
                          i++;
                        } else if (p.includes('?') && i + 1 < section.paragraphs.length) {
                          faqItems.push({
                            question: p.trim(),
                            answer: section.paragraphs[i + 1].trim(),
                          });
                          i++;
                        }
                      }

                      if (faqItems.length > 0) {
                        return (
                          <ArticleFaqAccordion
                            key={sIdx}
                            id={sectionId}
                            title={section.heading}
                            items={faqItems}
                          />
                        );
                      }
                    }

                    // 2-Column Business Glossary cards renderer for structured sections
                    if (isGlossarySection) {
                      const glossaryItems: { term: string; definition: string }[] = [];
                      section.paragraphs.forEach((p) => {
                        const colonIdx = p.indexOf(':');
                        if (colonIdx > 0 && colonIdx < 50) {
                          glossaryItems.push({
                            term: p.slice(0, colonIdx).trim(),
                            definition: p.slice(colonIdx + 1).trim(),
                          });
                        }
                      });

                      if (glossaryItems.length > 0) {
                        return (
                          <ArticleGlossary
                            key={sIdx}
                            id={sectionId}
                            title={section.heading}
                            items={glossaryItems}
                          />
                        );
                      }
                    }

                    return (
                      <section key={sIdx} id={sectionId} className="mb-10 scroll-mt-36">
                        <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-semibold tracking-tight leading-snug mt-10 mb-4">
                          {section.heading}
                        </h2>

                        {section.subheading && (
                          <h3
                            id={subId}
                            className="font-headline-sm text-lg sm:text-xl text-secondary font-medium mt-8 mb-3 italic scroll-mt-36"
                          >
                            {section.subheading}
                          </h3>
                        )}

                        {section.paragraphs.map((p, pIdx) => (
                          <p key={pIdx} className="mb-6 text-on-surface-variant text-[18px] leading-[1.8]">
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
                </div>
              )}

              {/* Share Bar */}
              <ShareBar
                title={article.title}
                slug={article.slug}
                contentType="case_study"
              />

              {/* Editorial Disclaimer */}
              <div className="mt-8 pt-6 border-t border-outline-variant/20 text-xs text-secondary leading-relaxed bg-surface-container-low p-4 rounded-xl">
                <span className="font-bold text-on-surface">Editorial Note:</span> This case study is compiled from public reporting and company disclosures. Sources are cited in the text, and figures reported differently by different sources are flagged. See our{' '}
                <Link href="/editorial-standards" className="underline font-medium hover:text-on-surface transition-colors">
                  Editorial Standards
                </Link>
                , or report an error via{' '}
                <Link href="/corrections" className="underline font-medium hover:text-on-surface transition-colors">
                  Corrections
                </Link>
                .
              </div>

              {/* Reader Comments */}
              <CommentSection postId={article.id} postTitle={article.title} />
            </div>

            {/* Right Column: Sticky Sidebar Stack (4 cols) */}
            <aside className="hidden lg:block lg:col-span-4 w-full" aria-label="Article Sidebar">
              <div className="sticky top-6 space-y-12 lg:space-y-16">
                {/* Widget 1: "At a Glance" Card */}
                {article.stats && (
                  <AtAGlanceStats stats={article.stats} variant="desktop-card" />
                )}

                {/* Widget 2: "Trending Case Studies / Top 5" Block */}
                {relatedCaseStudies.length > 0 && (
                  <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 px-6 py-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/30">
                      <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                      <h3 className="font-headline-md text-lg text-on-surface font-semibold">
                        Trending Case Studies
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {relatedCaseStudies.slice(0, 5).map((item, index) => (
                        <Link
                          key={item.id || item.slug}
                          href={`/articles/${item.slug}`}
                          className="group flex items-start gap-3.5 pb-4 border-b border-outline-variant/15 last:border-b-0 last:pb-0 transition-colors"
                        >
                          <span className="font-mono text-base font-bold text-primary/70 group-hover:text-primary transition-colors shrink-0 pt-0.5">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-secondary font-label-sm">
                              <span className="uppercase tracking-wider">{item.category}</span>
                              <span>•</span>
                              <span>{item.readTime}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Widget 3: "Worth Exploring" / Categories List */}
                <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 px-6 py-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-[20px]">explore</span>
                    <h3 className="font-headline-md text-lg text-on-surface font-semibold">
                      Worth Exploring
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'AI', href: '/category/ai' },
                      { name: 'FinTech', href: '/category/fintech' },
                      { name: 'SaaS', href: '/category/saas' },
                      { name: 'E-commerce', href: '/category/ecommerce' },
                      { name: 'VC-Backed', href: '/category/vc-backed' },
                      { name: 'Bootstrapped', href: '/category/bootstrapped' },
                      { name: 'Shutdowns', href: '/category/shutdowns-collapses' },
                      { name: 'Lessons Hub', href: '/lessons' },
                    ].map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-200"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Widget 4: Newsletter / Subscribe Mini-Card */}
                <div className="rounded-xl bg-gradient-to-br from-surface-container to-surface-container-low border border-outline-variant/40 px-6 py-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-label-sm">
                      Weekly Post-Mortem
                    </span>
                  </div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface mb-2 leading-snug">
                    Get Venture Graph in Your Inbox
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Unfiltered startup autopsies, funding breakdowns, and failure analyses delivered every Sunday.
                  </p>
                  <a
                    href="#newsletter-signup"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs"
                  >
                    <span>Subscribe Free</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </a>
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-secondary">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500">verified</span>
                    <span>Free dispatch • No spam</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* SECTION: RELATED CASE STUDIES */}
        {relatedCaseStudies.length > 0 && (
          <section className="w-full bg-surface-container-low py-12 lg:py-16 border-t border-b border-outline-variant/30 transition-colors mt-12">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
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
                {relatedCaseStudies.slice(0, 4).map((item) => (
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
