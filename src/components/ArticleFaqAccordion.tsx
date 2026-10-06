'use client';

import React, { useState } from 'react';

export interface FaqItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

interface ArticleFaqAccordionProps {
  title?: string;
  id?: string;
  items: FaqItemProps[];
}

export const ArticleFaqAccordion: React.FC<ArticleFaqAccordionProps> = ({
  title = 'FAQ — PEOPLE ALSO ASK',
  id,
  items,
}) => {
  if (!items || items.length === 0) return null;

  // Default state: Expand the first 2 questions and collapse the rest
  const [openStates, setOpenStates] = useState<boolean[]>(() =>
    items.map((it, idx) => (it.defaultOpen !== undefined ? it.defaultOpen : idx < 2))
  );

  const toggleFaq = (index: number) => {
    setOpenStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div
      id={id}
      className="my-10 rounded-2xl bg-surface-container-low/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-l-4 border-l-brand-red p-6 sm:p-8 not-prose shadow-xs scroll-mt-36"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <span className="px-2.5 py-1 rounded bg-brand-red/10 text-brand-red text-xs font-bold uppercase tracking-wider font-label-sm">
          FAQ / Quick Answers
        </span>
        <h2 className="text-xl sm:text-2xl font-bold font-headline-lg text-slate-900 dark:text-white m-0 tracking-tight">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((faq, index) => {
          const isOpen = openStates[index];
          const cleanQ = faq.question.replace(/^Q\d*[.:]\s*/i, '').trim();
          const cleanA = faq.answer.replace(/^A\d*[.:]\s*/i, '').trim();

          return (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 mb-3"
            >
              {/* Accordion Trigger / Question Bar */}
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                className="w-full text-left p-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="flex items-start gap-2">
                  <span className="text-brand-red font-bold">Q:</span>
                  <span>{cleanQ}</span>
                </span>
                <span
                  className={`material-symbols-outlined text-slate-400 transform transition-transform duration-200 shrink-0 text-xl ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </button>

              {/* Accordion Content / Answer Body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 text-base">
                  <p className="m-0">
                    <strong className="text-slate-800 dark:text-slate-200">A:</strong> {cleanA}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
