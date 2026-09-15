import React from 'react';
import Link from 'next/link';
import { TrendingPost } from '@/types';

interface TrendingItemProps {
  item: TrendingPost;
}

export const TrendingItem: React.FC<TrendingItemProps> = ({ item }) => {
  const isCaseStudy =
    item.slug.includes('failure') ||
    item.slug.includes('failed') ||
    item.slug.includes('collapse') ||
    item.slug.includes('fast-') ||
    item.category.toLowerCase().includes('case study') ||
    item.category.toLowerCase().includes('failure');

  const isLesson =
    item.slug.includes('lesson') ||
    item.slug.includes('top-list') ||
    item.category.toLowerCase().includes('lesson');

  const href = isCaseStudy
    ? `/articles/${item.slug}`
    : isLesson
    ? `/lessons/${item.slug}`
    : `/news/${item.slug}`;

  return (
    <article className="flex items-start gap-4 group">
      <span className="font-display-hero text-2xl font-bold text-primary-container leading-none shrink-0 w-6">
        {item.rank}
      </span>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
          {item.category}
        </span>
        <h3 className="font-headline-sm text-base text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug">
          <Link href={href}>{item.title}</Link>
        </h3>
      </div>
    </article>
  );
};
