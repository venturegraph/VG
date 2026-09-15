'use client';

import React, { useState, KeyboardEvent } from 'react';

interface KeywordFieldsProps {
  focusKeyword: string;
  onFocusKeywordChange: (val: string) => void;
  secondaryKeywords: string[];
  onSecondaryKeywordsChange: (keywords: string[]) => void;
  disabled?: boolean;
}

export const KeywordFields: React.FC<KeywordFieldsProps> = ({
  focusKeyword,
  onFocusKeywordChange,
  secondaryKeywords,
  onSecondaryKeywordsChange,
  disabled = false,
}) => {
  const [tagInput, setTagInput] = useState('');

  const addTags = (raw: string) => {
    const split = raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !secondaryKeywords.includes(t));

    if (split.length > 0) {
      onSecondaryKeywordsChange([...secondaryKeywords, ...split]);
    }
    setTagInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && secondaryKeywords.length > 0) {
      // Remove last tag on backspace if input empty
      onSecondaryKeywordsChange(secondaryKeywords.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (tagInput.trim()) {
      addTags(tagInput);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onSecondaryKeywordsChange(secondaryKeywords.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Focus Keyword */}
      <div className="space-y-1.5">
        <label
          htmlFor="focus-keyword-input"
          className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">target</span>
          <span>Focus Keyword</span>
        </label>
        <div className="relative">
          <input
            id="focus-keyword-input"
            type="text"
            value={focusKeyword}
            onChange={(e) => onFocusKeywordChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. convoy shutdown, unit economics, seed round"
            className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
          />
        </div>
        <p className="text-[11px] text-secondary">
          Primary search target for live density tracking and SEO indexing.
        </p>
      </div>

      {/* Secondary Keywords (Tag Input) */}
      <div className="space-y-1.5">
        <label
          htmlFor="secondary-keywords-input"
          className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">sell</span>
            <span>Secondary Keywords</span>
          </span>
          <span className="text-[11px] font-mono text-secondary">
            {secondaryKeywords.length} tags
          </span>
        </label>

        <div className="min-h-11 p-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 focus-within:border-primary transition-colors flex flex-wrap items-center gap-1.5">
          {secondaryKeywords.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-xs text-on-surface font-medium border border-outline-variant/30 animate-fadeIn"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                disabled={disabled}
                className="text-secondary hover:text-error transition-colors cursor-pointer"
                aria-label={`Remove tag ${tag}`}
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          ))}

          <input
            id="secondary-keywords-input"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={
              secondaryKeywords.length === 0
                ? 'Type and press Enter or comma...'
                : 'Add more...'
            }
            className="flex-1 min-w-[140px] h-8 px-2 bg-transparent text-sm text-on-surface focus:outline-hidden placeholder:text-secondary/70"
          />
        </div>
        <p className="text-[11px] text-secondary">
          Comma-separated related terms (stored as Postgres array). No limit.
        </p>
      </div>
    </div>
  );
};
