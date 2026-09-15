import React from 'react';
import Link from 'next/link';
import { ArticleCallout } from '@/types';

interface LessonsCalloutProps {
  callout: ArticleCallout;
}

export const LessonsCallout: React.FC<LessonsCalloutProps> = ({ callout }) => {
  return (
    <aside className="my-8 rounded-xl bg-surface-container-low border-l-4 border-l-primary border border-outline-variant/30 p-5 lg:p-6 transition-all hover:border-outline">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[20px] text-primary">
          lightbulb
        </span>
        <span className="font-label-sm text-[11px] uppercase tracking-widest text-primary font-bold">
          {callout.category || 'Lessons & Insights'}
        </span>
      </div>
      <h4 className="font-headline-md text-lg sm:text-xl text-on-surface font-semibold leading-snug">
        <Link href={callout.href} className="hover:text-primary transition-colors">
          {callout.title}
        </Link>
      </h4>
      <p className="mt-2 font-body-sm text-sm text-on-surface-variant leading-relaxed">
        {callout.description}
      </p>
      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
        <span className="text-xs text-secondary">Founder Playbook Deep Dive</span>
        <Link
          href={callout.href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase font-label-md tracking-wider hover:underline"
        >
          Read Lesson <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>
    </aside>
  );
};
