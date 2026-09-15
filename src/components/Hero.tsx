import React from 'react';
import Link from 'next/link';
import { Post } from '@/types';

interface HeroProps {
  story: Post;
}

export const Hero: React.FC<HeroProps> = ({ story }) => {
  return (
    <section className="relative w-full overflow-hidden bg-inverse-surface text-on-primary" id="hero-case">
      <div className="relative w-full min-h-[540px] lg:min-h-[620px] flex items-end">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          {story.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={story.title}
              className="w-full h-full object-cover object-center opacity-45"
              src={story.image}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-inverse-surface/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 lg:px-6 pt-16 pb-12 lg:pb-16 flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-label-sm text-xs uppercase tracking-widest font-bold">
              {story.tag || 'Failure Case Study'}
            </span>
            <span className="font-label-sm text-xs uppercase tracking-wider text-secondary-fixed">
              {story.category}
            </span>
            <span className="text-secondary-fixed">•</span>
            <span className="font-label-sm text-xs text-secondary-fixed">{story.publishDate}</span>
            <span className="text-secondary-fixed">•</span>
            <span className="font-label-sm text-xs text-secondary-fixed flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {story.readTime}
            </span>
          </div>

          <div className="max-w-4xl">
            <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl text-surface-container-lowest tracking-tight text-balance leading-tight font-semibold">
              {story.title}
            </h1>
            <p className="mt-4 font-body-lead text-lg lg:text-xl text-secondary-fixed text-balance max-w-3xl leading-relaxed">
              {story.excerpt}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm uppercase tracking-wider font-semibold transition-all shadow-sm hover:shadow"
                href={`/articles/${story.slug}`}
              >
                Read Story
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
