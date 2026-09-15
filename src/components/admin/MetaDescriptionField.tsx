'use client';

import React from 'react';

interface MetaDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const MetaDescriptionField: React.FC<MetaDescriptionFieldProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const length = (value || '').length;

  // Determine state & color coding at 140 / 160 chars
  let status: 'empty' | 'under' | 'optimal' | 'over' = 'empty';
  let badgeColor = 'text-secondary bg-surface-container border-outline-variant/30';
  let progressColor = 'bg-secondary';
  let message = 'Recommended length: 140–160 characters for high SERP CTR.';

  if (length > 0 && length < 140) {
    status = 'under';
    badgeColor = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
    progressColor = 'bg-amber-500';
    message = `Too short (${length}/140-160 chars). Add ${140 - length} more chars for optimal SERP display.`;
  } else if (length >= 140 && length <= 160) {
    status = 'optimal';
    badgeColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    progressColor = 'bg-emerald-500';
    message = `Ideal length (${length}/160 chars). Perfect for search snippets.`;
  } else if (length > 160) {
    status = 'over';
    badgeColor = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
    progressColor = 'bg-rose-500';
    message = `Over limit (${length}/160 chars). Search engines will truncate trailing words.`;
  }

  const progressPercent = Math.min(100, Math.round((length / 160) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="meta-description-input"
          className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">search</span>
          <span>Meta Description</span>
        </label>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${badgeColor}`}
          >
            {length} / 160
          </span>
        </div>
      </div>

      <div className="relative">
        <textarea
          id="meta-description-input"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="A succinct, unvarnished summary for Google search results and social share cards..."
          className="w-full p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors resize-y min-h-[84px] disabled:opacity-60"
        />

        {/* Small live progress bar at bottom of textarea container */}
        <div className="w-full h-1 bg-surface-container overflow-hidden rounded-b-xl -mt-1.5">
          <div
            className={`h-full transition-all duration-200 ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span
          className={
            status === 'optimal'
              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
              : status === 'over'
              ? 'text-rose-600 dark:text-rose-400 font-medium'
              : status === 'under'
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-secondary'
          }
        >
          {message}
        </span>
        <span className="text-secondary font-mono text-[10px]">SERP Preview</span>
      </div>
    </div>
  );
};
