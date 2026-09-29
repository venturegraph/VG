'use client';

import React, { useState } from 'react';
import { getCanonicalPostPath } from '@/lib/routes';

export interface ShareBarProps {
  title: string;
  slug: string;
  contentType?: string | null;
  className?: string;
}

export const ShareBar: React.FC<ShareBarProps> = ({
  title,
  slug,
  contentType,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me'
  ).replace(/\/$/, '');
  const canonicalPath = getCanonicalPostPath(contentType, slug);
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(canonicalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy canonical link:', err);
    }
  };

  const shareLinks = [
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      ariaLabel: 'Share on X (Twitter)',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      ariaLabel: 'Share on LinkedIn',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      ariaLabel: 'Share on Facebook',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      ariaLabel: 'Share via WhatsApp',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      name: 'Reddit',
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      ariaLabel: 'Share on Reddit',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.77 23.23 1.1 24 1.75 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0zm4.5 8c.828 0 1.5.672 1.5 1.5 0 .428-.18.813-.469 1.088.163.633.25 1.299.25 1.983 0 3.309-3.022 6-6.75 6s-6.75-2.691-6.75-6c0-.684.087-1.35.25-1.983A1.493 1.493 0 014 9.5C4 8.672 4.672 8 5.5 8c.535 0 1.004.281 1.272.703 1.213-.772 2.723-1.274 4.382-1.347l.884-4.164a.5.5 0 01.59-.387l3.05.61a1.5 1.5 0 11.238.971l-2.697-.54-.736 3.473c1.652.076 3.155.576 4.364 1.345.268-.42.735-.701 1.27-.701zm-7.75 4c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6.5 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm-6.236 4.417a.5.5 0 00-.707.707 5.006 5.006 0 006.386 0 .5.5 0 00-.707-.707 4.004 4.004 0 01-4.972 0z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
      ariaLabel: 'Share via Email',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
  ];

  const buttonClass =
    'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FA654D] bg-[#21242E]/5 hover:bg-[#21242E]/10 dark:bg-white/5 dark:hover:bg-white/10 border-outline-variant/40 hover:border-[#FA654D] text-[#21242E] dark:text-gray-200 hover:text-[#FA654D] dark:hover:text-[#FA654D]';

  return (
    <aside
      aria-label="Share article"
      className={`my-8 py-5 border-y border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FA654D]" />
        <span className="text-xs font-bold uppercase tracking-wider text-secondary font-label-sm">
          Share this article
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {shareLinks.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
            title={item.ariaLabel}
            className={buttonClass}
          >
            {item.icon}
            <span>{item.name}</span>
          </a>
        ))}

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Canonical link copied' : 'Copy link to clipboard'}
          title={copied ? 'Link copied!' : 'Copy link'}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FA654D] ${
            copied
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-[#21242E]/5 hover:bg-[#21242E]/10 dark:bg-white/5 dark:hover:bg-white/10 border-outline-variant/40 hover:border-[#FA654D] text-[#21242E] dark:text-gray-200 hover:text-[#FA654D] dark:hover:text-[#FA654D]'
          }`}
        >
          {copied ? (
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy link'}</span>
        </button>
      </div>
    </aside>
  );
};

export default ShareBar;
