'use client';

import React from 'react';

export interface GlossaryItemProps {
  term: string;
  definition: string;
}

interface ArticleGlossaryProps {
  title?: string;
  id?: string;
  items: GlossaryItemProps[];
}

export const ArticleGlossary: React.FC<ArticleGlossaryProps> = ({
  title = 'Business Glossary',
  id,
  items,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div id={id} className="my-10 not-prose scroll-mt-36">
      <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
        <span
          className="material-symbols-outlined text-brand-red text-2xl shrink-0"
          aria-hidden="true"
        >
          menu_book
        </span>
        <h2 className="text-xl sm:text-2xl font-bold font-headline-lg text-slate-900 dark:text-white uppercase tracking-tight m-0">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => {
          const cleanTerm = item.term.replace(/[:\-–—]+$/, '').trim();
          const cleanDef = item.definition.replace(/^[:\-–—\s]+/, '').trim();

          return (
            <div
              key={index}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md inline-block mb-2">
                {cleanTerm}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                {cleanDef}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
