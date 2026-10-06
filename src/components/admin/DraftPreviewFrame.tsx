'use client';

import React, { useState, useRef } from 'react';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface DraftPreviewFrameProps {
  slug: string;
  previewToken?: string | null;
  isSaved?: boolean;
  onQuickSave?: () => void;
  isSubmitting?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

export const DraftPreviewFrame: React.FC<DraftPreviewFrameProps> = ({
  slug,
  previewToken,
  isSaved = true,
  onQuickSave,
  isSubmitting = false,
  isFullscreen = false,
  onToggleFullscreen,
  onClose,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [keyIndex, setKeyIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const cleanSlug = slug.trim();
  const previewPath = cleanSlug
    ? `/articles/${encodeURIComponent(cleanSlug)}?preview=true${
        previewToken ? `&preview_token=${encodeURIComponent(previewToken)}` : ''
      }`
    : '';

  const handleRefresh = () => {
    setIsLoading(true);
    setKeyIndex((prev) => prev + 1);
  };

  const viewportWidthClass = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  }[viewport];

  return (
    <div
      className={`flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-lg transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl border-2 border-primary/30 shadow-2xl' : 'h-full min-h-[640px]'
      }`}
    >
      {/* 1. Top Browser-Style Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/30 text-xs">
        {/* Left: Window Dots & Device Viewport Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* Viewport Selectors */}
          <div className="flex items-center p-0.5 rounded-xl bg-surface-container border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-secondary hover:text-on-surface'
              }`}
              title="Desktop View (100% width)"
            >
              <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
              <span className="hidden md:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-secondary hover:text-on-surface'
              }`}
              title="Tablet View (768px width)"
            >
              <span className="material-symbols-outlined text-[15px]">tablet_mac</span>
              <span className="hidden md:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-secondary hover:text-on-surface'
              }`}
              title="Mobile View (375px width)"
            >
              <span className="material-symbols-outlined text-[15px]">phone_iphone</span>
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Center: Fake Address Bar Pill */}
        <div className="hidden lg:flex items-center gap-1.5 flex-1 max-w-md px-3 py-1 rounded-xl bg-surface-container border border-outline-variant/30 text-secondary font-mono text-[11px] truncate">
          <span className="material-symbols-outlined text-[14px] text-emerald-500">lock</span>
          <span className="truncate">
            venturegraph.me/articles/{cleanSlug || 'untitled-draft'}?preview=true
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Reload Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Reload Preview Frame"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          {/* Open In New Tab */}
          {cleanSlug && (
            <a
              href={previewPath}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors flex items-center"
              title="Open Preview in New Window"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          )}

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          )}

          {/* Close Button (if in overlay) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-surface-container transition-colors cursor-pointer"
              title="Close Preview"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Unsaved notice banner if edits are pending */}
      {!isSaved && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[15px] shrink-0">info</span>
            <span className="truncate">Unsaved changes: Save draft to sync latest content into preview.</span>
          </div>
          {onQuickSave && (
            <button
              type="button"
              onClick={onQuickSave}
              disabled={isSubmitting}
              className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-white font-medium text-[11px] hover:bg-amber-600 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Quick Save'}
            </button>
          )}
        </div>
      )}

      {/* 3. iFrame Viewing Canvas */}
      <div className="flex-1 bg-surface-container-high/40 p-3 sm:p-6 flex items-start justify-center overflow-auto">
        {!cleanSlug ? (
          <div className="my-auto text-center p-8 max-w-sm text-secondary space-y-2">
            <span className="material-symbols-outlined text-4xl text-primary/60">visibility_off</span>
            <p className="text-sm font-semibold text-on-surface">No slug defined yet</p>
            <p className="text-xs">
              Enter a title and slug in the form to generate the live draft preview.
            </p>
          </div>
        ) : (
          <div
            className={`transition-all duration-300 mx-auto shadow-2xl rounded-xl overflow-hidden border border-outline-variant/40 bg-background ${viewportWidthClass}`}
            style={{ minHeight: isFullscreen ? 'calc(100vh - 160px)' : '600px', height: '100%' }}
          >
            <iframe
              key={keyIndex}
              ref={iframeRef}
              src={previewPath}
              title={`Live Draft Preview: ${cleanSlug}`}
              onLoad={() => setIsLoading(false)}
              className="w-full h-full min-h-[600px] border-0"
              style={{ minHeight: isFullscreen ? 'calc(100vh - 160px)' : '600px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
