'use client';

import React, { useState } from 'react';
import { slugify } from '@/lib/seo';

interface SlugFieldProps {
  value: string;
  title: string;
  onChange: (slug: string) => void;
  isTaken?: boolean;
  isChecking?: boolean;
  disabled?: boolean;
  onBlurCheck?: (slug: string) => void;
}

export const SlugField: React.FC<SlugFieldProps> = ({
  value,
  title,
  onChange,
  isTaken = false,
  isChecking = false,
  disabled = false,
  onBlurCheck,
}) => {
  const [isLocked, setIsLocked] = useState(true);

  const handleRegenerate = () => {
    const generated = slugify(title);
    onChange(generated);
    if (onBlurCheck && generated) {
      onBlurCheck(generated);
    }
  };

  const handleBlur = () => {
    const cleaned = slugify(value);
    onChange(cleaned);
    if (onBlurCheck && cleaned) {
      onBlurCheck(cleaned);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="slug-input"
          className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">link</span>
          <span>URL Slug</span>
          <span className="text-error">*</span>
        </label>
        <div className="flex items-center gap-2">
          {title && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={disabled}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              <span>Sync with title</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className="text-[11px] font-medium text-secondary hover:text-on-surface flex items-center gap-0.5 cursor-pointer"
            title={isLocked ? 'Click to edit custom slug' : 'Click to lock'}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isLocked ? 'lock' : 'lock_open'}
            </span>
            <span>{isLocked ? 'Unlock' : 'Lock'}</span>
          </button>
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="h-11 px-3 rounded-l-xl bg-surface-container border border-r-0 border-outline-variant/40 flex items-center text-secondary text-xs font-mono select-none">
          /articles/
        </div>
        <input
          id="slug-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          readOnly={isLocked}
          disabled={disabled}
          placeholder="unique-post-permalink"
          className={`flex-1 h-11 px-3.5 rounded-r-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm font-mono focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60 ${
            isLocked ? 'bg-surface-container-low cursor-default' : ''
          } ${isTaken ? '!border-error !text-error' : ''}`}
        />
        {isChecking && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-secondary">
            <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Checking...</span>
          </div>
        )}
      </div>

      {isTaken && (
        <div className="flex items-center gap-1.5 text-xs text-error font-medium pt-0.5 animate-fadeIn">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>This slug is already taken by another post in Supabase. Please choose a unique permalink.</span>
        </div>
      )}
      {!isTaken && value && (
        <p className="text-[11px] text-secondary">
          Target URL: <span className="font-mono text-primary">https://venturegraph.me/articles/{value}</span>
        </p>
      )}
    </div>
  );
};
