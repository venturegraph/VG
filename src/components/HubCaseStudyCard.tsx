'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export interface HubCaseStudySummary {
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  readTime?: string;
  stats?: {
    totalRaised?: string;
  };
}

interface HubCaseStudyCardProps {
  caseStudySlug?: string;
  caseStudy?: HubCaseStudySummary | null;
}

export const HubCaseStudyCard: React.FC<HubCaseStudyCardProps> = ({
  caseStudySlug,
  caseStudy: initialCaseStudy,
}) => {
  const [caseStudy, setCaseStudy] = useState<HubCaseStudySummary | null>(initialCaseStudy || null);

  useEffect(() => {
    if (initialCaseStudy) {
      setCaseStudy(initialCaseStudy);
      return;
    }
    if (!caseStudySlug) {
      setCaseStudy(null);
      return;
    }

    const fetchCaseStudy = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('posts')
          .select('title, slug, category, meta_description')
          .eq('slug', caseStudySlug)
          .is('deleted_at', null)
          .maybeSingle();

        if (data) {
          setCaseStudy({
            title: data.title,
            slug: data.slug,
            category: data.category || 'Case Study',
            excerpt: data.meta_description || data.title,
            readTime: '6 min read',
          });
        }
      } catch {
        setCaseStudy(null);
      }
    };

    fetchCaseStudy();
  }, [caseStudySlug, initialCaseStudy]);

  if (!caseStudy) return null;

  return (
    <aside className="my-6 p-5 sm:p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 transition-all shadow-sm group">
      {/* Top Tag & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-outline-variant/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-on-secondary-fixed text-on-secondary font-label-sm text-[11px] uppercase font-bold tracking-wider">
            {caseStudy.category || 'Case Study'}
          </span>
          <span className="font-label-sm uppercase tracking-wider text-primary font-bold text-[11px]">
            Primary Case Study
          </span>
        </div>
        <span className="text-secondary font-label-sm">{caseStudy.readTime || '6 min read'}</span>
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
        {caseStudy.stats?.totalRaised && (
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

