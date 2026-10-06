'use client';

import React, { useState, useEffect } from 'react';
import { PostStatus } from '@/types';
import { formatStatus } from '@/lib/formatStatus';

interface StatusActionsProps {
  status: PostStatus;
  onStatusChange: (status: PostStatus) => void;
  onSubmit: (targetStatus: PostStatus, scheduledAt?: string | null) => void;
  isSubmitting: boolean;
  disabled?: boolean;
  publishedAt?: string | null;
  onPublishedAtChange?: (val: string | null) => void;
}

/** Converts an ISO UTC date string to the local YYYY-MM-DDTHH:mm format for datetime-local input */
function toLocalInputString(isoDateStr?: string | null): string {
  const date = isoDateStr ? new Date(isoDateStr) : new Date(Date.now() + 60 * 60 * 1000);
  if (isNaN(date.getTime())) {
    const fallback = new Date(Date.now() + 60 * 60 * 1000);
    const offsetMs = fallback.getTimezoneOffset() * 60 * 1000;
    return new Date(fallback.getTime() - offsetMs).toISOString().slice(0, 16);
  }
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(date.getTime() - offsetMs);
  return localTime.toISOString().slice(0, 16);
}

/** Formats a local date-time string into human-friendly representation with UTC equivalent */
function formatScheduledPreview(localInputVal: string): { local: string; utc: string; isFuture: boolean } {
  if (!localInputVal) {
    return { local: 'Not scheduled', utc: '', isFuture: false };
  }
  const date = new Date(localInputVal);
  if (isNaN(date.getTime())) {
    return { local: 'Invalid date', utc: '', isFuture: false };
  }
  const isFuture = date.getTime() > Date.now();
  const local = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const utc = date.toUTCString().replace(':00 GMT', ' UTC');
  return { local, utc, isFuture };
}

export const StatusActions: React.FC<StatusActionsProps> = ({
  status,
  onStatusChange,
  onSubmit,
  isSubmitting,
  disabled = false,
  publishedAt,
  onPublishedAtChange,
}) => {
  const [localDateTime, setLocalDateTime] = useState<string>(() => toLocalInputString(publishedAt));
  const [isSchedulePickerOpen, setIsSchedulePickerOpen] = useState<boolean>(status === 'scheduled');

  // Keep localDateTime in sync if publishedAt changes externally
  useEffect(() => {
    if (publishedAt) {
      setLocalDateTime(toLocalInputString(publishedAt));
    }
  }, [publishedAt]);

  const scheduleInfo = formatScheduledPreview(localDateTime);

  const handleDateTimeChange = (val: string) => {
    setLocalDateTime(val);
    if (!val) {
      if (onPublishedAtChange) onPublishedAtChange(null);
      return;
    }
    const isoString = new Date(val).toISOString();
    if (onPublishedAtChange) onPublishedAtChange(isoString);
  };

  const handleScheduleSubmit = () => {
    const isoString = localDateTime ? new Date(localDateTime).toISOString() : new Date().toISOString();
    onStatusChange('scheduled');
    onSubmit('scheduled', isoString);
  };

  const handlePublishNow = () => {
    const nowIso = new Date().toISOString();
    onStatusChange('published');
    if (onPublishedAtChange) onPublishedAtChange(nowIso);
    onSubmit('published', nowIso);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Status Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">published_with_changes</span>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Publication Status
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
              status === 'published'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : status === 'scheduled'
                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                : status === 'pending_review'
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                : 'bg-surface-container-high text-secondary'
            }`}
          >
            {formatStatus(status)}
          </span>
        </div>

        {/* Status Selection Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
          <button
            type="button"
            onClick={() => {
              onStatusChange('draft');
              setIsSchedulePickerOpen(false);
            }}
            disabled={disabled || isSubmitting}
            className={`px-2 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
              status === 'draft'
                ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            {formatStatus('draft')}
          </button>

          <button
            type="button"
            onClick={() => {
              onStatusChange('pending_review');
              setIsSchedulePickerOpen(false);
            }}
            disabled={disabled || isSubmitting}
            className={`px-2 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
              status === 'pending_review'
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            {formatStatus('pending_review')}
          </button>

          <button
            type="button"
            onClick={() => {
              onStatusChange('scheduled');
              setIsSchedulePickerOpen(true);
            }}
            disabled={disabled || isSubmitting}
            className={`px-2 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
              status === 'scheduled'
                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            {formatStatus('scheduled')}
          </button>

          <button
            type="button"
            onClick={() => {
              onStatusChange('published');
              setIsSchedulePickerOpen(false);
            }}
            disabled={disabled || isSubmitting}
            className={`px-2 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
              status === 'published'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            {formatStatus('published')}
          </button>
        </div>
      </div>

      {/* 2. Post Scheduling DateTime Picker Card */}
      {(isSchedulePickerOpen || status === 'scheduled') && (
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-sky-500/25 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Schedule Future Publication</span>
            </span>
            <span className="text-[10px] text-secondary font-mono">Local / UTC</span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="scheduled-datetime-input" className="block text-[11px] text-secondary font-medium">
              Publish Date &amp; Time (Local)
            </label>
            <input
              id="scheduled-datetime-input"
              type="datetime-local"
              value={localDateTime}
              onChange={(e) => handleDateTimeChange(e.target.value)}
              disabled={disabled || isSubmitting}
              className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs focus:outline-hidden focus:border-primary transition-colors font-mono"
            />
          </div>

          {/* Time interpretation readout */}
          {localDateTime && (
            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-on-surface">
                <span className="text-secondary">Local Target:</span>
                <span className="font-semibold">{scheduleInfo.local}</span>
              </div>
              <div className="flex items-center justify-between text-secondary">
                <span>UTC Target:</span>
                <span className="font-mono text-[10px]">{scheduleInfo.utc}</span>
              </div>
              <div className="pt-1 border-t border-outline-variant/20 flex items-center gap-1">
                {scheduleInfo.isFuture ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    Valid future dispatch time
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">warning</span>
                    Selected time is in the past (will publish immediately on next cron cycle)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Primary Action Buttons */}
      <div className="pt-1 flex flex-col gap-2">
        {status === 'scheduled' || isSchedulePickerOpen ? (
          <button
            type="button"
            onClick={handleScheduleSubmit}
            disabled={disabled || isSubmitting || !localDateTime}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">schedule_send</span>
            )}
            <span>Schedule Dispatch</span>
          </button>
        ) : status === 'published' ? (
          <button
            type="button"
            onClick={handlePublishNow}
            disabled={disabled || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">publish</span>
            )}
            <span>Publish Dispatch Now</span>
          </button>
        ) : status === 'pending_review' ? (
          <button
            type="button"
            onClick={() => onSubmit('pending_review')}
            disabled={disabled || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary hover:opacity-95 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">send</span>
            )}
            <span>Submit for Review</span>
          </button>
        ) : null}

        {/* Secondary Save Draft Button (always accessible) */}
        <button
          type="button"
          onClick={() => onSubmit('draft')}
          disabled={disabled || isSubmitting}
          className="w-full py-2 px-3 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-secondary hover:text-on-surface text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting && status === 'draft' ? (
            <div className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[15px]">save</span>
          )}
          <span>Save as Draft</span>
        </button>
      </div>
    </div>
  );
};
