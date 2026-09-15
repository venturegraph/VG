import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';

interface LatestPostItemProps {
  item: Post;
  isFirst?: boolean;
  isLast?: boolean;
}

export const LatestPostItem: React.FC<LatestPostItemProps> = ({
  item,
  isFirst = false,
  isLast = false,
}) => {
  // Determine badge text color based on type/category
  const getBadgeColor = () => {
    switch (item.type) {
      case 'failure':
        return 'text-primary';
      case 'funding':
        return 'text-tertiary';
      default:
        return 'text-on-surface';
    }
  };

  const articleHref = item.type === 'failure' ? `/articles/${item.slug}` : `/news/${item.slug}`;

  return (
    <article className={`py-5 ${isFirst ? 'pt-0' : ''} ${isLast ? 'pb-0' : ''} group`}>
      <div className="flex items-center gap-3 text-xs text-secondary mb-1.5">
        <span
          className={`px-2 py-0.5 rounded bg-surface-container font-label-sm font-semibold uppercase ${getBadgeColor()}`}
        >
          {item.category}
        </span>
        <span>•</span>
        <span>{item.publishDate}</span>
      </div>
      <h3 className="font-headline-md text-xl text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug">
        <Link href={articleHref}>{item.title}</Link>
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{item.excerpt}</p>
    </article>
  );
};
