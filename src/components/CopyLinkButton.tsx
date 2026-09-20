'use client';

import React, { useState } from 'react';

interface CopyLinkButtonProps {
  className?: string;
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({ className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy link to clipboard:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Link copied to clipboard' : 'Copy link to clipboard'}
      title={copied ? 'Link copied!' : 'Copy link'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange ${
        copied
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
      } ${className}`}
    >
      <span className="material-symbols-outlined text-[15px]">
        {copied ? 'check' : 'link'}
      </span>
      <span>{copied ? 'Copied!' : 'Copy link'}</span>
    </button>
  );
};
