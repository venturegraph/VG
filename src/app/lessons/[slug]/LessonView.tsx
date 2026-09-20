'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Header,
  MobileDrawer,
  Newsletter,
  Footer,
  TableOfContents,
  HubCaseStudyCard,
} from '@/components';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { BookmarkButton } from '@/components/BookmarkButton';
import { CommentSection } from '@/components/comments/CommentSection';
import {
  NAV_CATEGORIES,
  SECONDARY_NAV_ITEMS,
} from '@/lib/taxonomy';
import { HubArticle } from '@/types';
import DOMPurify from 'isomorphic-dompurify';

export interface ExtendedHubArticle extends HubArticle {
  htmlContent?: string;
}

interface LessonViewProps {
  initialArticle: ExtendedHubArticle;
  initialRelatedHubArticles: HubArticle[];
  slug: string;
}

export function LessonView({
  initialArticle,
  initialRelatedHubArticles,
  slug,
}: LessonViewProps) {
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

  const article = initialArticle;
  const relatedHubArticles = initialRelatedHubArticles;

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
      <main id="main-content" className="w-full bg-background min-h-screen flex-1 transition-colors duration-200" style={{ paddingTop: 'var(--header-height, 11rem)' }}>
        <article className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-secondary font-label-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-secondary">Lessons &amp; Insights</span>
            <span>/</span>
            <span className="text-on-surface truncate max-w-[280px] sm:max-w-md">
              {article.category}
            </span>
          </nav>

          {/* Hub Header */}
          <header className="mb-10 max-w-4xl border-b border-outline-variant/30 pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-2.5 py-0.5 rounded bg-on-secondary-fixed text-on-secondary font-label-sm text-[11px] uppercase font-bold tracking-wider">
                {article.category}
              </span>
              <span className="text-xs uppercase tracking-wider text-secondary font-label-sm">
                Curated Founder Hub
              </span>
              <span className="text-secondary">•</span>
              <span className="font-label-sm text-xs text-secondary">{article.publishDate}</span>
              <span className="text-secondary">•</span>
              <span className="font-label-sm text-xs text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {article.readTime}
              </span>
            </div>

            <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight leading-tight font-semibold">
              {article.title}
            </h1>

            <p className="mt-4 font-body-lead text-lg lg:text-xl text-on-surface-variant leading-relaxed">
              {article.subtitle}
            </p>

            {/* Author Bar */}
            {article.author && (
              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary border border-outline-variant/30">
                    {article.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">{article.author.name}</div>
                    <div className="text-secondary text-[11px]">{article.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="text-xs text-secondary font-label-sm uppercase tracking-wider hidden sm:inline mr-1">
                    Verified Archive
                  </div>
                  <CopyLinkButton />
                  <BookmarkButton postId={article.id} postTitle={article.title} slug={article.slug} />
                </div>
              </div>
            )}
          </header>

          {/* Mobile Collapsible Table of Contents */}
          {article.lessons && article.lessons.length > 0 && (
            <div className="lg:hidden">
              <TableOfContents lessons={article.lessons} />
            </div>
          )}

          {/* Main Grid: Content & Desktop Sticky TOC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Content */}
            <div className={article.lessons && article.lessons.length > 0 ? "lg:col-span-8 flex flex-col font-body-base text-base text-on-surface leading-relaxed" : "lg:col-span-10 lg:col-start-2 flex flex-col font-body-base text-base text-on-surface leading-relaxed"}>
              {/* Introduction Paragraphs */}
              {article.introduction?.map((para, idx) => (
                <p
                  key={idx}
                  className={`mb-6 text-on-surface-variant ${
                    idx === 0
                      ? 'text-lg lg:text-xl font-body-lead text-on-surface leading-relaxed'
                      : ''
                  }`}
                >
                  {para}
                </p>
              ))}

              {/* Real HTML Article Content from Supabase */}
              {article.htmlContent && article.htmlContent.includes('<') ? (
                <div
                  className="article-html-content prose dark:prose-invert font-body-base text-base text-on-surface leading-relaxed max-w-none my-4"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      article.htmlContent.replace(/<img\s+([^>]*?)>/gi, (_match, attrs) => {
                        let updated = attrs;
                        if (!/loading=/i.test(updated)) updated += ' loading="lazy"';
                        if (!/aspect-ratio/i.test(updated) && !/width=/i.test(updated)) {
                          updated += ' style="aspect-ratio: 16/9; width: 100%; height: auto;"';
                        }
                        return `<img ${updated}>`;
                      }),
                      {
                        ADD_TAGS: ['iframe'],
                        ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'frameborder', 'data-type', 'loading', 'style', 'width', 'height'],
                      }
                    ),
                  }}
                />
              ) : null}

              {/* Numbered Lessons List if structured */}
              {article.lessons && article.lessons.length > 0 && (
                <div className="space-y-12 mt-4">
                  {article.lessons.map((lesson) => (
                    <section
                      key={lesson.id}
                      id={lesson.id}
                      className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm transition-colors scroll-mt-36"
                    >
                      {/* Number Badge & Title */}
                      <div className="flex items-start gap-4 mb-4">
                        <span className="font-display-hero text-3xl sm:text-4xl font-bold text-primary-container leading-none shrink-0 w-10">
                          {lesson.number}
                        </span>
                        <div>
                          <h2 className="font-headline-md text-xl sm:text-2xl text-on-surface font-semibold tracking-tight leading-snug">
                            {lesson.title}
                          </h2>
                          {/* Thesis Statement */}
                          <p className="mt-2 text-sm sm:text-base font-body-lead text-primary font-medium italic leading-relaxed">
                            &ldquo;{lesson.thesis}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Analysis Paragraphs */}
                      <div className="space-y-3 mt-4 text-on-surface-variant text-sm sm:text-base leading-relaxed">
                        {lesson.paragraphs.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>

                      {/* Actionable Playbook Takeaway Box */}
                      {lesson.takeaway && (
                        <div className="mt-5 p-4 rounded-xl bg-surface-container border border-outline-variant/30">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-primary font-label-sm mb-1 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Founder Playbook Takeaway
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-on-surface leading-relaxed">
                            {lesson.takeaway}
                          </p>
                        </div>
                      )}

                      {/* Prominent Outbound Case Study Hub Card */}
                      {lesson.relatedCaseStudySlug && (
                        <div className="mt-6 pt-4 border-t border-outline-variant/20">
                          <HubCaseStudyCard caseStudySlug={lesson.relatedCaseStudySlug} />
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              )}

              {/* Conclusion Box */}
              {article.conclusion && (
                <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-sm sm:text-base leading-relaxed">
                  <h3 className="font-headline-md text-lg sm:text-xl font-semibold text-on-surface mb-2">
                    Synthesis &amp; Executive Summary
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">{article.conclusion}</p>
                </div>
              )}

              {/* Reader Comments */}
              <CommentSection postId={article.id} postTitle={article.title} />
            </div>

            {/* Right Column: Desktop Sticky Table of Contents */}
            {article.lessons && article.lessons.length > 0 && (
              <div className="hidden lg:block lg:col-span-4">
                <TableOfContents lessons={article.lessons} />
              </div>
            )}
          </div>
        </article>

        {/* RELATED LISTICLES & TOP LISTS */}
        {relatedHubArticles.length > 0 && (
          <section className="w-full bg-surface-container-low py-10 lg:py-14 border-t border-b border-outline-variant/30 transition-colors mt-12">
            <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                    <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                      More From Lessons &amp; Insights
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-2xl lg:text-3xl text-on-surface tracking-tight font-semibold">
                    Related Guides &amp; Autopsy Hubs
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedHubArticles.map((rel) => (
                  <article
                    key={rel.id}
                    className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-secondary mb-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container font-semibold uppercase text-[10px] text-on-surface">
                          {rel.category}
                        </span>
                        <span>{rel.readTime}</span>
                      </div>
                      <h3 className="font-headline-md text-xl font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/lessons/${rel.slug}`}>{rel.title}</Link>
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {rel.subtitle}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Explore Hub</span>
                      <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </article>
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
