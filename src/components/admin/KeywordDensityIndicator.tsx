'use client';

import React, { useState, useEffect } from 'react';
import { evaluateDensity, DensityEvaluation } from '@/lib/seo';

interface KeywordDensityIndicatorProps {
  content: string;
  focusKeyword: string;
}

export const KeywordDensityIndicator: React.FC<KeywordDensityIndicatorProps> = ({
  content,
  focusKeyword,
}) => {
  // Evaluation state
  const [evalResult, setEvalResult] = useState<DensityEvaluation>(() =>
    evaluateDensity(content, focusKeyword)
  );
  const [isDebouncing, setIsDebouncing] = useState(false);

  // 400ms debounce as specified
  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setEvalResult(evaluateDensity(content, focusKeyword));
      setIsDebouncing(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [content, focusKeyword]);

  const { density, matches, words, color, label, message } = evalResult;

  // Visual styling mapped to exact rules:
  // Green: 0.5%–2%
  // Yellow: 2%–3% or under 0.5% but keyword present at least once
  // Red: over 3%, or 0 occurrences with content over ~100 words
  const colorStyles = {
    green: {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-500',
      cardBorder: 'border-emerald-500/30 bg-emerald-500/5',
      icon: 'check_circle',
    },
    yellow: {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      cardBorder: 'border-amber-500/30 bg-amber-500/5',
      icon: 'warning',
    },
    red: {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
      bar: 'bg-rose-500',
      cardBorder: 'border-rose-500/30 bg-rose-500/5',
      icon: 'error',
    },
    gray: {
      badge: 'bg-surface-container text-secondary border-outline-variant/30',
      dot: 'bg-secondary',
      bar: 'bg-secondary',
      cardBorder: 'border-outline-variant/30 bg-surface-container-low/40',
      icon: 'info',
    },
  }[color];

  // Visual meter progress (capped at 4% scale)
  const meterPercentage = Math.min(100, Math.round((density / 4.0) * 100));

  return (
    <div className={`p-4 rounded-xl border transition-all ${colorStyles.cardBorder}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${colorStyles.dot} ${isDebouncing ? 'animate-ping' : ''}`} />
          <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">
            Keyword Density Engine
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border flex items-center gap-1 ${colorStyles.badge}`}
          >
            <span className="material-symbols-outlined text-[13px]">{colorStyles.icon}</span>
            <span>{label}</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-secondary">
          <div>
            Density:{' '}
            <span className="font-bold text-on-surface text-sm">
              {density.toFixed(2)}%
            </span>
          </div>
          <div>
            Mentions:{' '}
            <span className="font-semibold text-on-surface">{matches}</span>
          </div>
          <div>
            Total Words:{' '}
            <span className="font-semibold text-on-surface">{words}</span>
          </div>
        </div>
      </div>

      {/* Visual meter bar with target zone overlay */}
      <div className="space-y-1 mb-2">
        <div className="relative w-full h-2 rounded-full bg-surface-container overflow-hidden">
          {/* Optimal target range indicator (0.5% to 2.0% -> 12.5% to 50% width on 4% scale) */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
            style={{ left: '12.5%', width: '37.5%' }}
            title="Optimal target zone: 0.5% - 2.0%"
          />
          {/* Actual density fill */}
          <div
            className={`h-full transition-all duration-300 ${colorStyles.bar}`}
            style={{ width: `${meterPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-secondary font-mono">
          <span>0%</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            0.5% – 2.0% (Target)
          </span>
          <span>3.0%</span>
          <span>4%+</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-secondary">
        <span className="flex items-center gap-1">
          {isDebouncing && (
            <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
          )}
          <span>{message}</span>
        </span>
        {focusKeyword && (
          <span className="font-mono text-[10px] text-secondary truncate max-w-[200px]">
            Target: &quot;{focusKeyword}&quot;
          </span>
        )}
      </div>
    </div>
  );
};
