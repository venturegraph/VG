'use client';

import React from 'react';
import { ContentType } from '@/types';

interface ContentTypeSelectProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
  disabled?: boolean;
}

const CONTENT_TYPES: {
  value: ContentType;
  label: string;
  description: string;
  badgeColor: string;
  icon: string;
}[] = [
  {
    value: 'case_study',
    label: 'Case Study',
    description: 'Deep forensic post-mortems with funding metrics and autopsy data',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: 'biotech',
  },
  {
    value: 'news',
    label: 'News',
    description: 'Funding alerts, market dispatches, and breaking venture intelligence',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: 'newspaper',
  },
  {
    value: 'lessons_hub',
    label: 'Lessons Hub',
    description: 'Curated retro lists, failure patterns, and founder retrospectives',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: 'lightbulb',
  },
  {
    value: 'founder_playbook',
    label: 'Founder Playbook',
    description: 'Actionable operational guides on runaway, governance, and survival',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: 'menu_book',
  },
  {
    value: 'trend_analysis',
    label: 'Trend Analysis',
    description: 'Macro ecosystem shifts, valuation contractions, and sector reports',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: 'trending_up',
  },
];

export const ContentTypeSelect: React.FC<ContentTypeSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const selected = CONTENT_TYPES.find((ct) => ct.value === value) || CONTENT_TYPES[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="content-type-select"
          className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">category</span>
          <span>Content Type</span>
          <span className="text-error">*</span>
        </label>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${selected.badgeColor}`}
        >
          {selected.label}
        </span>
      </div>

      <div className="relative">
        <select
          id="content-type-select"
          value={value}
          onChange={(e) => onChange(e.target.value as ContentType)}
          disabled={disabled}
          className="w-full h-11 px-3.5 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm font-medium focus:outline-hidden focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {CONTENT_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value} className="bg-surface-container text-on-surface py-2">
              {ct.label} — {ct.description}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-lg">
          unfold_more
        </span>
      </div>
      <p className="text-[11px] text-secondary">
        {selected.description}
      </p>
    </div>
  );
};
