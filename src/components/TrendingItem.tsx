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
    item.slug.includes('collapsed') ||
    item.category.includes('Failure');

  const href = isCaseStudy
    ? `/articles/${item.slug}`
    : item.slug.includes('anthropic')
    ? `/news/${item.slug}`
    : `/#${item.slug}`;

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
