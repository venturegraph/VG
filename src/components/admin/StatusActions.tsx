'use client';

import React from 'react';
import { PostStatus } from '@/types';
import { formatStatus } from '@/lib/formatStatus';

interface StatusActionsProps {
  status: PostStatus;
  onStatusChange: (status: PostStatus) => void;
  onSubmit: (targetStatus: PostStatus) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export const StatusActions: React.FC<StatusActionsProps> = ({
  status,
  onStatusChange,
  onSubmit,
  isSubmitting,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
      {/* Current publication status indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            published_with_changes
          </span>
          <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">
            Status:
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs">
          <button
            type="button"
            onClick={() => onStatusChange('draft')}
            disabled={disabled || isSubmitting}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              status === 'draft'
                ? 'bg-secondary/15 text-on-surface font-semibold shadow-2xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            {formatStatus('draft')}
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('pending_review')}
            disabled={disabled || isSubmitting}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              status === 'pending_review'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            {formatStatus('pending_review')}
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('published')}
            disabled={disabled || isSubmitting}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              status === 'published'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            {formatStatus('published')}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSubmit('draft')}
          disabled={disabled || isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container text-on-surface text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting && status === 'draft' ? (
            <div className="w-3.5 h-3.5 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[16px]">save</span>
          )}
          <span>Save Draft</span>
        </button>

        <button
          type="button"
          onClick={() => onSubmit('pending_review')}
          disabled={disabled || isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-95 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting && status === 'pending_review' ? (
            <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[16px]">send</span>
          )}
          <span>Submit for Review</span>
        </button>
      </div>
    </div>
  );
};
