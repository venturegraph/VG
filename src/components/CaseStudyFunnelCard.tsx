import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export interface CaseStudySummary {
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  readTime?: string;
}

interface CaseStudyFunnelCardProps {
  caseStudySlug?: string;
  caseStudy?: CaseStudySummary | null;
}

export const CaseStudyFunnelCard: React.FC<CaseStudyFunnelCardProps> = ({
  caseStudySlug,
  caseStudy: initialCaseStudy,
}) => {
  const [caseStudy, setCaseStudy] = useState<CaseStudySummary | null>(initialCaseStudy || null);

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
    <div className="my-8 p-5 sm:p-6 rounded-xl bg-surface-container-low border-2 border-primary/30 hover:border-primary/60 transition-all shadow-sm group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-label-sm text-[11px] uppercase tracking-widest text-primary font-bold">
            Full Post-Mortem Archive Available
          </span>
        </div>
        <span className="text-xs text-secondary font-label-sm">
          {caseStudy.readTime || '6 min read'}
        </span>
      </div>

      <div className="mt-4">
        <h4 className="font-headline-md text-lg sm:text-xl font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
          <Link href={`/articles/${caseStudy.slug}`}>
            {caseStudy.title}
          </Link>
        </h4>
        <p className="mt-2 font-body-sm text-sm text-on-surface-variant leading-relaxed">
          {caseStudy.excerpt}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-secondary">
          Category: <span className="font-semibold text-on-surface">{caseStudy.category || 'Case Study'}</span>
        </div>

        <Link
          href={`/articles/${caseStudy.slug}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm shrink-0"
        >
          Read the Full Case Study
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};
