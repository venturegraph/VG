import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';

interface FundingCardProps {
  item: Post;
}

export const FundingCard: React.FC<FundingCardProps> = ({ item }) => {
  return (
    <article className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:border-outline hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-[11px] font-semibold uppercase">
            {item.category}
          </span>
          <span className="text-xs text-secondary">{item.publishDate}</span>
        </div>
        <div className="mb-2">
          <span className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider">
            {item.capitalType || 'Strategic Capital'}
          </span>
          <div className="text-xl font-bold font-stat-lg text-on-surface">{item.amount}</div>
        </div>
        <h3 className="font-headline-md text-lg text-on-surface font-semibold leading-snug hover:text-primary transition-colors">
          <Link href={`/news/${item.slug}`}>{item.title}</Link>
        </h3>
        <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">{item.excerpt}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-secondary">
        <span>{item.round || 'Strategic'}</span>
        <Link
          className="text-primary font-semibold hover:underline flex items-center gap-0.5"
          href={`/news/${item.slug}`}
        >
          Details <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </Link>
      </div>
    </article>
  );
};
