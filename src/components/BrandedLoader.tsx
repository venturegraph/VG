'use client';

import React from 'react';

interface BrandedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  variant?: 'inline' | 'block' | 'fullscreen';
  className?: string;
}

export const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  size = 'md',
  label,
  variant = 'block',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      mark: 'w-6 h-6 text-xs',
      bar: 'h-0.5 max-w-[80px]',
      text: 'text-[11px]',
    },
    md: {
      mark: 'w-10 h-10 text-base',
      bar: 'h-1 max-w-[140px]',
      text: 'text-xs',
    },
    lg: {
      mark: 'w-14 h-14 text-2xl',
      bar: 'h-1.5 max-w-[200px]',
      text: 'text-sm',
    },
  }[size];

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-2.5 select-none ${className}`}
    >
      {/* Pulsing "V" geometric emblem */}
      <div className="relative flex items-center justify-center">
        {/* Soft pulsing glow aura */}
        <div
          className={`absolute rounded-xl bg-accent-orange/20 animate-ping opacity-75 ${sizeClasses.mark}`}
          style={{ animationDuration: '2s' }}
        />

        {/* Core emblem container */}
        <div
          className={`relative rounded-xl bg-slate-dark dark:bg-white text-white dark:text-slate-dark font-masthead font-black tracking-tighter flex items-center justify-center shadow-lg border border-accent-orange/40 ${sizeClasses.mark}`}
        >
          <span className="text-accent-orange">V</span>
        </div>
      </div>

      {/* Thin brand accent animated progress line */}
      <div
        className={`w-full overflow-hidden bg-outline-variant/30 rounded-full ${sizeClasses.bar}`}
      >
        <div className="w-full h-full bg-accent-orange rounded-full animate-pulse" />
      </div>

      {/* Optional branded loading caption */}
      {label && (
        <span
          className={`font-semibold uppercase tracking-wider text-secondary font-label-sm animate-pulse ${sizeClasses.text}`}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span role="status" aria-live="polite" className={`inline-flex items-center gap-2 ${className}`}>
        <span className="w-3.5 h-3.5 rounded bg-accent-orange text-white font-masthead font-bold text-[9px] flex items-center justify-center animate-pulse">
          V
        </span>
        {label && <span className="text-xs text-secondary">{label}</span>}
      </span>
    );
  }

  return <div className="py-6 flex items-center justify-center">{content}</div>;
};
