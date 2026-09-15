import React from 'react';
import Link from 'next/link';
import { getCaseStudyBySlug } from '@/data/mockData';

interface HubCaseStudyCardProps {
  caseStudySlug: string;
}

export const HubCaseStudyCard: React.FC<HubCaseStudyCardProps> = ({ caseStudySlug }) => {
  const caseStudy = getCaseStudyBySlug(caseStudySlug);

  if (!caseStudy) return null;

  return (
    <aside className="my-6 p-5 sm:p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-all shadow-sm group">
      {/* Top Tag & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-outline-variant/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-on-secondary-fixed text-on-secondary font-label-sm text-[11px] uppercase font-bold tracking-wider">
            {caseStudy.category}
          </span>
          <span className="font-label-sm uppercase tracking-wider text-primary font-bold text-[11px]">
            Primary Case Study
          </span>
        </div>
        <span className="text-secondary font-label-sm">{caseStudy.readTime}</span>
      </div>

      {/* Case Study Title */}
      <h4 className="font-headline-md text-lg sm:text-xl font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
        <Link href={`/articles/${caseStudy.slug}`}>
          {caseStudy.title}
        </Link>
      </h4>

      {/* Case Study Excerpt */}
      <p className="mt-2 font-body-sm text-sm text-on-surface-variant leading-relaxed">
        {caseStudy.excerpt}
      </p>

      {/* Stats row & Prominent CTA */}
      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {caseStudy.stats && (
          <div className="text-xs text-secondary">
            Capital Lost:{' '}
            <span className="font-stat-lg font-bold text-error text-sm">
              {caseStudy.stats.totalRaised}
            </span>
          </div>
        )}

        <Link
          href={`/articles/${caseStudy.slug}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm shrink-0"
        >
          Read Full Case Study
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>
    </aside>
  );
};
