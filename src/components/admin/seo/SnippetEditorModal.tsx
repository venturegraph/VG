'use client';

import React, { useState, useMemo } from 'react';

interface SnippetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  slug: string;
  onSlugChange: (val: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (val: string) => void;
}

export const SnippetEditorModal: React.FC<SnippetEditorModalProps> = ({
  isOpen,
  onClose,
  title,
  seoTitle,
  onSeoTitleChange,
  slug,
  onSlugChange,
  metaDescription,
  onMetaDescriptionChange,
}) => {
  // Evaluated SEO Title resolving template tags
  const evaluatedTitle = useMemo(() => {
    const raw = seoTitle.trim() || '%title% %sep% %sitename%';
    return raw
      .replace(/%title%/gi, title || 'Sample Headline')
      .replace(/%sep%/gi, '-')
      .replace(/%sitename%/gi, 'Venture Graph');
  }, [seoTitle, title]);

  // Title character & pixel simulation (~580px soft limit, ~9.6px per avg char)
  const titleLength = evaluatedTitle.length;
  const titlePixelWidth = Math.round(titleLength * 9.6);
  const titlePixelPercent = Math.min(100, Math.round((titlePixelWidth / 580) * 100));

  const titleStatus: 'optimal' | 'warning' | 'error' =
    titleLength >= 40 && titleLength <= 60
      ? 'optimal'
      : (titleLength >= 30 && titleLength < 40) || (titleLength > 60 && titleLength <= 70)
      ? 'warning'
      : 'error';

  // Description character & pixel simulation (~920px soft limit, ~5.8px per avg char)
  const descLength = (metaDescription || '').length;
  const descPixelWidth = Math.round(descLength * 5.8);
  const descPixelPercent = Math.min(100, Math.round((descPixelWidth / 920) * 100));

  const descStatus: 'optimal' | 'warning' | 'error' =
    descLength >= 120 && descLength <= 160
      ? 'optimal'
      : (descLength >= 80 && descLength < 120) || (descLength > 160 && descLength <= 180)
      ? 'warning'
      : 'error';

  if (!isOpen) return null;

  const insertVariable = (variable: string) => {
    const current = seoTitle || '%title% %sep% %sitename%';
    onSeoTitleChange(`${current} ${variable}`.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xl space-y-6 my-8 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">preview</span>
            <div>
              <h3 className="text-base font-bold text-on-surface">
                Google Search Snippet Editor
              </h3>
              <p className="text-xs text-secondary">
                Customize how your post appears across Google SERPs and social previews.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Live Google Search Result Simulation */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1 font-sans">
          <div className="text-[11px] text-secondary font-mono flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
              VG
            </span>
            <span className="text-on-surface font-medium">venturegraph.me</span>
            <span className="text-secondary/60">›</span>
            <span>articles</span>
            <span className="text-secondary/60">›</span>
            <span className="truncate max-w-[200px]">{slug || 'article-slug'}</span>
          </div>

          <div className="text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-snug break-words">
            {evaluatedTitle}
          </div>

          <div className="text-xs text-secondary leading-relaxed break-words line-clamp-2">
            {metaDescription ||
              'Provide a compelling meta description snippet to give searchers a preview of this investigative autopsy...'}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          {/* 1. SEO Title Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                SEO Title
              </label>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={
                    titleStatus === 'optimal'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : titleStatus === 'warning'
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-rose-600 dark:text-rose-400 font-bold'
                  }
                >
                  {titleLength} / 60 chars
                </span>
                <span className="text-secondary">•</span>
                <span className="text-secondary">{titlePixelWidth} / 580px</span>
              </div>
            </div>

            {/* Template Variables Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-secondary text-[10px] uppercase font-semibold mr-1">Insert:</span>
              <button
                type="button"
                onClick={() => insertVariable('%title%')}
                className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-mono text-secondary hover:text-on-surface transition-colors cursor-pointer"
              >
                %title%
              </button>
              <button
                type="button"
                onClick={() => insertVariable('%sep%')}
                className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-mono text-secondary hover:text-on-surface transition-colors cursor-pointer"
              >
                %sep%
              </button>
              <button
                type="button"
                onClick={() => insertVariable('%sitename%')}
                className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 font-mono text-secondary hover:text-on-surface transition-colors cursor-pointer"
              >
                %sitename%
              </button>
            </div>

            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder="%title% %sep% %sitename%"
              className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors"
            />

            {/* Pixel Width Bar Simulation */}
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  titleStatus === 'optimal'
                    ? 'bg-emerald-500'
                    : titleStatus === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${titlePixelPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-secondary">
              Evaluated Title: <span className="font-semibold text-on-surface">&quot;{evaluatedTitle}&quot;</span>
            </p>
          </div>

          {/* 2. Permalink / Slug Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
              Permalink (URL Slug)
            </label>
            <div className="flex items-center rounded-xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden focus-within:border-primary">
              <span className="px-3 py-2 text-xs font-mono text-secondary bg-surface-container-low border-r border-outline-variant/40">
                venturegraph.me/articles/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="article-slug"
                className="w-full h-11 px-3 bg-transparent text-on-surface text-sm font-mono focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3. Meta Description Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                Meta Description
              </label>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={
                    descStatus === 'optimal'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : descStatus === 'warning'
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-rose-600 dark:text-rose-400 font-bold'
                  }
                >
                  {descLength} / 160 chars
                </span>
                <span className="text-secondary">•</span>
                <span className="text-secondary">{descPixelWidth} / 920px</span>
              </div>
            </div>

            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder="Enter a compelling 140–160 character meta description summarizing the post-mortem analysis..."
              className="w-full p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors resize-none"
            />

            {/* Pixel Width Bar Simulation */}
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  descStatus === 'optimal'
                    ? 'bg-emerald-500'
                    : descStatus === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${descPixelPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-secondary">
              Recommended range: 120–160 characters. Search engines truncate snippets over ~920px.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-outline-variant/30 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer shadow-xs"
          >
            Done &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
