'use client';

import React, { useState, useEffect } from 'react';
import { HubLessonItem } from '@/types';

interface TableOfContentsProps {
  lessons: HubLessonItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ lessons }) => {
  const [activeId, setActiveId] = useState<string>(lessons[0]?.id || '');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = lessons.length - 1; i >= 0; i--) {
        const element = document.getElementById(lessons[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(lessons[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lessons]);

  const scrollToLesson = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120; // Account for sticky header & nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Collapsible TOC */}
      <div className="lg:hidden mb-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container transition-colors"
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              format_list_numbered
            </span>
            <span className="font-headline-md text-base font-semibold text-on-surface">
              Table of Contents ({lessons.length} Lessons)
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[20px] text-secondary transition-transform duration-200 ${
              isMobileOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {isMobileOpen && (
          <nav className="p-4 pt-0 border-t border-outline-variant/20 bg-surface-container-lowest max-h-80 overflow-y-auto no-scrollbar">
            <ul className="space-y-1 pt-2">
              {lessons.map((lesson) => {
                const isActive = activeId === lesson.id;
                return (
                  <li key={lesson.id}>
                    <button
                      className={`w-full text-left py-2 px-2.5 rounded-lg text-xs font-body-sm transition-colors flex items-start gap-2 ${
                        isActive
                          ? 'bg-surface-container font-semibold text-primary'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                      }`}
                      onClick={() => scrollToLesson(lesson.id)}
                    >
                      <span className="font-mono font-bold text-primary text-[11px] shrink-0">
                        {lesson.number}
                      </span>
                      <span className="line-clamp-1">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop Sticky Sidebar TOC */}
      <aside className="hidden lg:block w-full">
        <div className="sticky top-44 rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">
                format_list_numbered
              </span>
              <h3 className="font-headline-md text-sm font-semibold uppercase tracking-wider text-on-surface font-label-sm">
                Contents Index
              </h3>
            </div>
            <span className="text-[11px] font-mono text-secondary font-bold">
              {lessons.length} Parts
            </span>
          </div>

          <nav aria-label="Table of Contents">
            <ul className="space-y-1 text-xs">
              {lessons.map((lesson) => {
                const isActive = activeId === lesson.id;
                return (
                  <li key={lesson.id}>
                    <button
                      className={`w-full text-left py-2 px-2.5 rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-surface-container text-primary font-bold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                      }`}
                      onClick={() => scrollToLesson(lesson.id)}
                    >
                      <span
                        className={`font-mono text-[11px] shrink-0 font-bold ${
                          isActive ? 'text-primary' : 'text-secondary'
                        }`}
                      >
                        {lesson.number}
                      </span>
                      <span className="line-clamp-2 leading-snug">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Hub Metadata Box */}
          <div className="mt-5 pt-4 border-t border-outline-variant/20 bg-surface-container-low p-3.5 rounded-lg text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 font-label-sm">
              Editorial Notice
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              Curated from verified bankruptcy disclosures and founder retrospectives.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
