import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';

interface FailureCardProps {
  item: Post;
}

export const FailureCard: React.FC<FailureCardProps> = ({ item }) => {
  return (
    <article className="group bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden border border-outline-variant/30 hover:border-outline hover:shadow-md transition-all">
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded bg-on-secondary-fixed text-on-secondary font-label-sm text-[11px] uppercase font-bold tracking-wider">
              {item.category}
            </span>
            <span className="text-xs text-secondary">{item.publishDate}</span>
          </div>
          <h3 className="font-headline-md text-xl text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors leading-snug">
            <Link href={`/articles/${item.slug}`}>{item.title}</Link>
          </h3>
          <p className="mt-3 font-body-sm text-sm text-on-surface-variant leading-relaxed">
            {item.excerpt}
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-secondary">
          <span>{item.readTime}</span>
          <Link
            href={`/articles/${item.slug}`}
            className="font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5"
          >
            Read Case Study <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
