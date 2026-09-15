'use client';

import React, { useState, useEffect } from 'react';

export interface ArticleHeading {
  id: string;
  text: string;
  level: number; // 2 or 3
}

interface ArticleTableOfContentsProps {
  headings: ArticleHeading[];
}

export const ArticleTableOfContents: React.FC<ArticleTableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id || '');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!headings.length) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (!headings || headings.length < 2) {
    return null;
  }

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130; // Clean offset for sticky header & primary nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      // Update hash in URL without jumping
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <nav
      aria-label="Article Table of Contents"
      className="not-prose my-8 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 p-5 shadow-xs transition-colors"
    >
      {/* Header bar with toggle */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            format_list_bulleted
          </span>
          <h3 className="font-headline-md text-sm font-bold uppercase tracking-wider text-on-surface">
            Table of Contents
          </h3>
          <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[11px] font-mono font-semibold">
            {headings.length} Sections
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1 text-xs cursor-pointer"
          aria-expanded={!isCollapsed}
        >
          <span className="text-[11px] font-medium hidden sm:inline">
            {isCollapsed ? 'Show' : 'Hide'}
          </span>
          <span
            className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          >
            expand_less
          </span>
        </button>
      </div>

      {/* Jump-link index */}
      {!isCollapsed && (
        <ol className="mt-3.5 space-y-1.5 text-xs sm:text-sm">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            return (
              <li
                key={`${heading.id}-${index}`}
                className={heading.level === 3 ? 'pl-5 sm:pl-6 list-none' : 'list-none'}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => scrollToHeading(heading.id, e)}
                  className={`group flex items-start gap-2 py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] shrink-0 mt-0.5 ${
                      isActive ? 'text-primary font-bold' : 'text-secondary/70'
                    }`}
                  >
                    {heading.level === 2 ? `${index + 1}.` : '↳'}
                  </span>
                  <span className="leading-snug line-clamp-2">
                    {heading.text}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
};
