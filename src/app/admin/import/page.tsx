'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PARENT_TAXONOMY, STANDALONE_CATEGORIES } from '@/lib/taxonomy';
import type { ContentType } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface WpCategory {
  name: string;
  domain: string;
}

interface ParsedWpPost {
  wp_post_id: string;
  title: string;
  slug: string;
  pubDate: string;
  wp_status: string;
  categories: WpCategory[];
  tags: WpCategory[];
  hasFeaturedImage: boolean;
  featuredImageUrl: string | null;
  wordCount: number;
  contentEncoded: string;
}

interface ParseResult {
  totalItemsInFeed: number;
  totalPostsExtracted: number;
  skippedPostTypes: Record<string, number>;
  posts: ParsedWpPost[];
}

/** Per-row editable state + validation warnings */
interface ImportRow {
  post: ParsedWpPost;
  included: boolean;
  contentType: ContentType;
  category: string;
  subcategory: string;
  warnings: string[];
}

/** Mirrors CommitRowResult from the API route */
interface CommitRowResult {
  wp_post_id: string;
  slug: string;
  title: string;
  status: 'imported' | 'skipped' | 'failed';
  skipReason?: string;
  error?: string;
}

interface CommitResponse {
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  results: CommitRowResult[];
}

// ---------------------------------------------------------------------------
// Inference helpers
// ---------------------------------------------------------------------------

/** All taxonomy category names flat (parent + sub + standalone) */
const ALL_PARENTS = PARENT_TAXONOMY.map((p) => p.name);
const ALL_SUBCATS = PARENT_TAXONOMY.flatMap((p) => p.subcategories);
const ALL_CATS = [...ALL_PARENTS, ...ALL_SUBCATS, ...STANDALONE_CATEGORIES];
void ALL_CATS; // used below

const CONTENT_TYPES: ContentType[] = [
  'case_study',
  'news',
  'lessons_hub',
  'founder_playbook',
  'trend_analysis',
];

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  case_study: 'Case Study',
  news: 'News',
  lessons_hub: 'Lessons Hub',
  founder_playbook: 'Founder Playbook',
  trend_analysis: 'Trend Analysis',
};

/**
 * Infer content_type. Rules evaluated in order; first match wins.
 * 1. Title pattern → case_study
 * 2. WP cats/tags contain funding/news → news
 * 3. WP cats/tags contain lessons/top lists/failure patterns → lessons_hub
 * 4. Default → news
 */
function inferContentType(post: ParsedWpPost): ContentType {
  const title = post.title.toLowerCase();
  const taxNames = [
    ...post.categories.map((c) => c.name.toLowerCase()),
    ...post.tags.map((t) => t.name.toLowerCase()),
  ];

  // Rule 1 — case_study title patterns
  const caseStudyTitle =
    /\bfailure\b.*how.*\$[\d.]+[mb]?\b/i.test(post.title) ||
    /why\s+\S+\s+failed\b/i.test(post.title) ||
    /\$[\d.]+[mb]?.*collapse/i.test(post.title) ||
    /inside.*\bfailed\b/i.test(post.title) ||
    title.includes('post-mortem') ||
    title.includes('postmortem') ||
    title.includes('autopsy') ||
    title.includes('shut down') ||
    title.includes('shutdown') ||
    title.includes('collapse');

  if (caseStudyTitle) return 'case_study';

  // Rule 2 — news via taxonomy
  const newsKeywords = ['funding', 'news', 'alert', 'breaking', 'raises', 'raised', 'round', 'layoff', 'acquisition'];
  if (taxNames.some((n) => newsKeywords.some((k) => n.includes(k)))) return 'news';

  // Rule 3 — lessons_hub via taxonomy
  const lessonKeywords = ['lesson', 'top list', 'top 10', 'top 5', 'failure pattern', 'insight', 'playbook', 'takeaway'];
  if (taxNames.some((n) => lessonKeywords.some((k) => n.includes(k)))) return 'lessons_hub';

  return 'news';
}

/**
 * Infer site category from WP taxonomy names using keyword matching.
 * Returns { category, subcategory } or nulls if no confident match.
 */
function inferCategory(post: ParsedWpPost): { category: string; subcategory: string } {
  const names = [
    ...post.categories.map((c) => c.name.toLowerCase()),
    ...post.tags.map((t) => t.name.toLowerCase()),
    post.title.toLowerCase(),
  ];
  const joined = names.join(' ');

  // ---- Tech subcategories (check sub before parent) ----------------------
  if (/\bai\b|artificial intelligence|machine learning|llm|gpt|chatgpt/.test(joined))
    return { category: 'Tech', subcategory: 'AI' };
  if (/e-?commerce|ecommerce|checkout|shopify|retail/.test(joined))
    return { category: 'Tech', subcategory: 'E-commerce' };
  if (/\bsaas\b|software.as.a.service|subscription software/.test(joined))
    return { category: 'Tech', subcategory: 'SaaS' };
  if (/fintech|financial tech|neobank|payments|crypto|defi|blockchain/.test(joined))
    return { category: 'Tech', subcategory: 'FinTech' };

  // ---- Funding Raised ----------------------------------------------------
  if (/\$100m|\$1b|\$500m|unicorn|billion/.test(joined))
    return { category: 'Funding Raised', subcategory: '$100M+ Unicorn' };
  if (/\$50m|\$60m|\$70m|\$80m|\$90m/.test(joined))
    return { category: 'Funding Raised', subcategory: '$50M–$100M' };
  if (/\$10m|\$15m|\$20m|\$25m|\$30m|\$40m/.test(joined))
    return { category: 'Funding Raised', subcategory: '$10M–$50M' };
  if (/funding raised|funding round|series [abc]|seed round/.test(joined))
    return { category: 'Funding Raised', subcategory: '' };

  // ---- Funding Type ------------------------------------------------------
  if (/crowdfund|kickstarter|indiegogo/.test(joined))
    return { category: 'Funding Type', subcategory: 'Crowdfunded' };
  if (/vc.backed|venture capital|venture-backed|a16z|sequoia|softbank/.test(joined))
    return { category: 'Funding Type', subcategory: 'VC-Backed' };
  if (/bootstrap|self.funded|profitable from day/.test(joined))
    return { category: 'Funding Type', subcategory: 'Bootstrapped' };

  // ---- Lessons & Insights -----------------------------------------------
  if (/top \d|top list|best \d|worst \d/.test(joined))
    return { category: 'Lessons & Insights', subcategory: 'Top Lists' };
  if (/failure pattern|pattern of failure|why startups fail/.test(joined))
    return { category: 'Lessons & Insights', subcategory: 'Failure Patterns' };
  if (/lesson|takeaway|what we learned|retrospective/.test(joined))
    return { category: 'Lessons & Insights', subcategory: 'Lessons Learned' };

  // ---- Standalone -------------------------------------------------------
  if (/\bnews\b|breaking/.test(joined))
    return { category: 'News', subcategory: '' };
  if (/shutdown|collapse|bankrupt|closed down/.test(joined))
    return { category: 'Shutdowns & Collapses', subcategory: '' };
  if (/funding alert|raised \$|series [abc] alert/.test(joined))
    return { category: 'Funding Alerts', subcategory: '' };
  if (/layoff|laid off|job cut|workforce reduction/.test(joined))
    return { category: 'Layoffs', subcategory: '' };

  return { category: '', subcategory: '' };
}

/** Numeric-only or auto-generated WordPress fallback slug detection */
function isAutoSlug(slug: string): boolean {
  if (!slug) return true;
  // Pure numeric slug e.g. "12345"
  if (/^\d+$/.test(slug)) return true;
  // Very short slug (≤ 3 chars)
  if (slug.length <= 3) return true;
  // WordPress sometimes generates "p=12345" style or just "page-2"
  if (/^p=\d+$/.test(slug)) return true;
  return false;
}

function buildWarnings(post: ParsedWpPost): string[] {
  const warnings: string[] = [];
  if (!post.contentEncoded || post.contentEncoded.trim().length === 0) {
    warnings.push('Empty content body');
  } else if (post.wordCount < 50) {
    warnings.push(`Very short content (${post.wordCount} words)`);
  }
  if (isAutoSlug(post.slug)) {
    warnings.push('Slug looks auto-generated or meaningless');
  }
  return warnings;
}

/** Build the full ImportRow list from raw parse results */
function buildImportRows(posts: ParsedWpPost[]): ImportRow[] {
  return posts.map((post) => {
    const contentType = inferContentType(post);
    const { category, subcategory } = inferCategory(post);
    return {
      post,
      included: true,
      contentType,
      category,
      subcategory,
      warnings: buildWarnings(post),
    };
  });
}

// ---------------------------------------------------------------------------
// Utility renderers
// ---------------------------------------------------------------------------
function formatPubDate(raw: string): string {
  if (!raw) return '—';
  try {
    return new Date(raw).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return raw;
  }
}

function WpStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'publish':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Published
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/25 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Draft
        </span>
      );
    case 'private':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-500 border border-purple-500/25 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
          Private
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-secondary border border-outline-variant/40 whitespace-nowrap">
          {status || 'Unknown'}
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// Admin header (same pattern as /admin/new)
// ---------------------------------------------------------------------------
function AdminHeader() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
    }
  }, []);

  const handleToggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try { await createClient().auth.signOut(); } catch { /* ignore */ }
    router.push('/admin');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="w-full max-w-[1520px] mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-6 h-6 text-primary transition-transform group-hover:scale-105" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 9l4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="16" r="1.5" className="fill-primary-container stroke-primary-container" />
            </svg>
            <div className="flex items-center gap-2">
              <span className="font-headline-lg font-bold tracking-tight text-on-surface text-base leading-none">
                VENTURE<span className="text-primary-container">GRAPH</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase">CMS</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 border-l border-outline-variant/30 pl-6">
            <Link href="/admin/posts" className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors">
              Posts &amp; Intelligence
            </Link>
            <Link href="/admin/new" className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors">
              + New Post
            </Link>
            <Link href="/admin/import" className="px-3 py-1.5 rounded-lg text-xs font-label-md font-semibold bg-surface-container text-primary">
              WP Import
            </Link>
            <Link href="/admin/import/images" className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">image_search</span>
              Image Review
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={handleToggle} aria-label="Toggle theme" className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-secondary hover:text-error text-xs font-label-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Drop zone
// ---------------------------------------------------------------------------
function DropZone({ onFile, disabled }: { onFile: (f: File) => void; disabled: boolean }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile, disabled]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 cursor-pointer transition-all select-none',
        isDragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-low/50',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ].join(' ')}
    >
      <input ref={inputRef} id="wxr-file-input" type="file" accept=".xml,text/xml,application/xml" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} disabled={disabled} />
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant/30 text-primary">
        <span className="material-symbols-outlined text-4xl">upload_file</span>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-on-surface">Drop your WordPress WXR export here</p>
        <p className="text-sm text-secondary mt-1">
          or click to browse — accepts <code className="font-mono text-xs bg-surface-container px-1 py-0.5 rounded">.xml</code> files from WordPress › Tools › Export
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-secondary">
        <span className="material-symbols-outlined text-[14px]">info</span>
        File is parsed server-side. Nothing is written to the database at this stage.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary bar — now includes selection counter
// ---------------------------------------------------------------------------
function SummaryBar({
  result, filename, rows, onSelectAll, onDeselectAll,
}: {
  result: ParseResult;
  filename: string;
  rows: ImportRow[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  const selected = rows.filter((r) => r.included).length;
  const withImage = rows.filter((r) => r.post.hasFeaturedImage).length;
  const withWarnings = rows.filter((r) => r.warnings.length > 0).length;
  const skipped = Object.entries(result.skippedPostTypes);

  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 space-y-4">
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex-1 min-w-[180px]">
          <p className="text-xs font-label-md text-secondary uppercase tracking-wider mb-0.5">File</p>
          <p className="text-sm font-semibold text-on-surface truncate">{filename}</p>
        </div>
        {/* Selected count — prominent */}
        <div className="text-center min-w-[110px] bg-primary/8 border border-primary/20 rounded-xl px-3 py-2">
          <p className="text-2xl font-bold text-primary">{selected} <span className="text-base font-medium text-secondary">/ {rows.length}</span></p>
          <p className="text-[11px] text-secondary font-medium">Selected for import</p>
        </div>
        <div className="text-center min-w-[80px]">
          <p className="text-2xl font-bold text-on-surface">{result.totalItemsInFeed}</p>
          <p className="text-xs text-secondary">Total items</p>
        </div>
        <div className="text-center min-w-[80px]">
          <p className="text-2xl font-bold text-emerald-500">{withImage}</p>
          <p className="text-xs text-secondary">With image</p>
        </div>
        {withWarnings > 0 && (
          <div className="text-center min-w-[80px]">
            <p className="text-2xl font-bold text-amber-500">{withWarnings}</p>
            <p className="text-xs text-secondary">With warnings</p>
          </div>
        )}
        <div className="flex flex-col gap-1.5 justify-center">
          <button onClick={onSelectAll} className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-secondary hover:text-on-surface transition-colors">
            Select all
          </button>
          <button onClick={onDeselectAll} className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-secondary hover:text-on-surface transition-colors">
            Deselect all
          </button>
        </div>
      </div>
      {skipped.length > 0 && (
        <div className="pt-3 border-t border-outline-variant/30">
          <p className="text-xs text-secondary mb-2 font-medium">Skipped post types:</p>
          <div className="flex flex-wrap gap-2">
            {skipped.map(([type, count]) => (
              <span key={type} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-xs text-secondary border border-outline-variant/30">
                <span className="font-mono">{type}</span>
                <span className="text-on-surface-variant font-semibold">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline select helpers
// ---------------------------------------------------------------------------
const SELECT_CLS =
  'h-7 px-2 pr-6 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-medium focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer w-full';

function ContentTypeSelect({ value, onChange }: { value: ContentType; onChange: (v: ContentType) => void }) {
  return (
    <div className="relative min-w-[130px]">
      <select value={value} onChange={(e) => onChange(e.target.value as ContentType)}
        className={SELECT_CLS} onClick={(e) => e.stopPropagation()}>
        {CONTENT_TYPES.map((ct) => (
          <option key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct]}</option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[14px]">unfold_more</span>
    </div>
  );
}

/** All categories flat: parents + standalones, labelled */
const ALL_CATEGORY_OPTIONS: { value: string; label: string; group: string }[] = [
  { value: '', label: '— Unmapped —', group: '' },
  ...PARENT_TAXONOMY.flatMap((p) => [
    { value: p.name, label: p.name, group: 'Parent Categories' },
    ...p.subcategories.map((s) => ({ value: `${p.name}::${s}`, label: `  └ ${s}`, group: p.name })),
  ]),
  ...STANDALONE_CATEGORIES.map((s) => ({ value: s, label: s, group: 'Standalone' })),
];

/** Encode "category::subcategory" → value, decode back */
function encodeCatSub(cat: string, sub: string): string {
  if (!cat) return '';
  return sub ? `${cat}::${sub}` : cat;
}
function decodeCatSub(val: string): { category: string; subcategory: string } {
  if (!val) return { category: '', subcategory: '' };
  const idx = val.indexOf('::');
  if (idx === -1) return { category: val, subcategory: '' };
  return { category: val.slice(0, idx), subcategory: val.slice(idx + 2) };
}

function CategorySelect({ category, subcategory, onChange }: {
  category: string; subcategory: string; onChange: (cat: string, sub: string) => void;
}) {
  const value = encodeCatSub(category, subcategory);
  return (
    <div className="relative min-w-[160px]">
      <select value={value}
        onChange={(e) => { const { category: c, subcategory: s } = decodeCatSub(e.target.value); onChange(c, s); }}
        className={SELECT_CLS} onClick={(e) => e.stopPropagation()}>
        {ALL_CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value || '__empty'} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[14px]">unfold_more</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Warning pill
// ---------------------------------------------------------------------------
function WarningPills({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {warnings.map((w, i) => (
        <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-medium">
          <span className="material-symbols-outlined text-[11px]">warning</span>
          {w}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview table with editable rows
// ---------------------------------------------------------------------------
function PreviewTable({
  rows,
  onToggleRow,
  onChangeContentType,
  onChangeCategory,
}: {
  rows: ImportRow[];
  onToggleRow: (id: string) => void;
  onChangeContentType: (id: string, ct: ContentType) => void;
  onChangeCategory: (id: string, cat: string, sub: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'publish' | 'draft' | 'warnings'>('all');

  const filtered = rows.filter((r) => {
    if (filter === 'warnings') return r.warnings.length > 0;
    if (filter === 'all') return true;
    return r.post.wp_status === filter;
  });

  const publishCount = rows.filter((r) => r.post.wp_status === 'publish').length;
  const draftCount = rows.filter((r) => r.post.wp_status === 'draft').length;
  const warnCount = rows.filter((r) => r.warnings.length > 0).length;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {([
          ['all', `All (${rows.length})`],
          ['publish', `Published (${publishCount})`],
          ['draft', `Draft (${draftCount})`],
          ['warnings', `⚠ Warnings (${warnCount})`],
        ] as [string, string][]).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f as typeof filter)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              filter === f ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container text-secondary hover:text-on-surface',
              f === 'warnings' && filter !== 'warnings' && warnCount > 0 ? 'border border-amber-500/30' : '',
            ].join(' ')}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-secondary">Showing {filtered.length} of {rows.length}</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30">
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-center w-10">
                  <span className="sr-only">Include</span>✓
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left">#</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left min-w-[200px]">Title</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left">Original Slug</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left whitespace-nowrap">WP Status</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left min-w-[140px]">Content Type</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left min-w-[170px]">Category</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left">WP Tags</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-center whitespace-nowrap">Image</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right whitespace-nowrap">Words</th>
                <th className="px-3 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-left whitespace-nowrap">Published</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => {
                const { post } = row;
                const isExpanded = expandedId === post.wp_post_id;
                const hasWarn = row.warnings.length > 0;

                return (
                  <React.Fragment key={post.wp_post_id}>
                    <tr
                      className={[
                        'border-b border-outline-variant/20 transition-colors',
                        !row.included ? 'opacity-40' : '',
                        isExpanded ? 'bg-surface-container-low' : 'hover:bg-surface-container-low/40',
                        hasWarn && row.included ? 'border-l-2 border-l-amber-500/60' : '',
                      ].join(' ')}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          id={`include-${post.wp_post_id}`}
                          checked={row.included}
                          onChange={() => onToggleRow(post.wp_post_id)}
                          className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="px-3 py-2.5 text-xs text-secondary font-mono">{idx + 1}</td>

                      {/* Title */}
                      <td className="px-3 py-2.5 max-w-[220px] cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : post.wp_post_id)}>
                        <div className="font-medium text-on-surface truncate text-sm" title={post.title}>
                          {hasWarn && (
                            <span className="material-symbols-outlined text-[14px] text-amber-500 mr-1 align-middle" title={row.warnings.join(' · ')}>
                              warning
                            </span>
                          )}
                          {post.title || <span className="text-secondary italic">(no title)</span>}
                        </div>
                        <div className="text-[10px] font-mono text-secondary mt-0.5 truncate">
                          wp:post_id {post.wp_post_id}
                        </div>
                        <WarningPills warnings={row.warnings} />
                      </td>

                      {/* Slug */}
                      <td className="px-3 py-2.5 font-mono text-xs text-secondary max-w-[160px]">
                        <div className={['truncate', isAutoSlug(post.slug) ? 'text-amber-500' : ''].join(' ')} title={post.slug}>
                          {post.slug || <span className="italic">—</span>}
                        </div>
                      </td>

                      {/* WP Status */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <WpStatusBadge status={post.wp_status} />
                      </td>

                      {/* Content Type — editable */}
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <ContentTypeSelect
                          value={row.contentType}
                          onChange={(ct) => onChangeContentType(post.wp_post_id, ct)}
                        />
                      </td>

                      {/* Category — editable */}
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <CategorySelect
                          category={row.category}
                          subcategory={row.subcategory}
                          onChange={(cat, sub) => onChangeCategory(post.wp_post_id, cat, sub)}
                        />
                      </td>

                      {/* WP Tags */}
                      <td className="px-3 py-2.5 max-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {post.categories.slice(0, 2).map((c, i) => (
                            <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">
                              {c.name}
                            </span>
                          ))}
                          {post.tags.slice(0, 1).map((t, i) => (
                            <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-surface-container text-secondary border border-outline-variant/40">
                              #{t.name}
                            </span>
                          ))}
                          {post.categories.length + post.tags.length > 3 && (
                            <span className="text-[10px] text-secondary">+{post.categories.length + post.tags.length - 3}</span>
                          )}
                          {post.categories.length === 0 && post.tags.length === 0 && (
                            <span className="text-[10px] text-secondary italic">none</span>
                          )}
                        </div>
                      </td>

                      {/* Featured image */}
                      <td className="px-3 py-2.5 text-center">
                        {post.hasFeaturedImage ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold">
                            <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[15px] text-secondary/50">cancel</span>
                        )}
                      </td>

                      {/* Word count */}
                      <td className={['px-3 py-2.5 text-right font-mono text-xs', post.wordCount < 50 ? 'text-amber-500 font-semibold' : 'text-on-surface'].join(' ')}>
                        {post.wordCount.toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2.5 text-xs text-secondary whitespace-nowrap cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : post.wp_post_id)}>
                        {formatPubDate(post.pubDate)}
                        <span className="material-symbols-outlined text-[12px] ml-1 text-secondary/50 align-middle">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="bg-surface-container-low/80 border-b border-outline-variant/20">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-secondary uppercase tracking-wider mb-1">Featured Image URL</p>
                              {post.featuredImageUrl ? (
                                <a href={post.featuredImageUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-primary hover:underline font-mono break-all" onClick={(e) => e.stopPropagation()}>
                                  {post.featuredImageUrl}
                                </a>
                              ) : (
                                <span className="text-secondary italic">No featured image (_thumbnail_id not found or unresolved)</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-secondary uppercase tracking-wider mb-1">All WP Categories &amp; Tags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {post.categories.map((c, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
                                    {c.name} <span className="opacity-50">({c.domain})</span>
                                  </span>
                                ))}
                                {post.tags.map((t, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[10px] border border-outline-variant/40">
                                    #{t.name}
                                  </span>
                                ))}
                                {post.categories.length === 0 && post.tags.length === 0 && (
                                  <span className="text-secondary italic">None</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-secondary uppercase tracking-wider mb-1">Validation</p>
                              {row.warnings.length === 0 ? (
                                <span className="text-emerald-500 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span> No issues
                                </span>
                              ) : (
                                <ul className="space-y-1">
                                  {row.warnings.map((w, i) => (
                                    <li key={i} className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                                      <span className="material-symbols-outlined text-[13px] mt-0.5 shrink-0">warning</span> {w}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="md:col-span-3">
                              <p className="font-semibold text-secondary uppercase tracking-wider mb-1">Content Preview (first 400 chars of raw HTML)</p>
                              <pre className="font-mono text-[10px] text-on-surface-variant bg-surface-container rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all border border-outline-variant/20 max-h-28">
                                {post.contentEncoded.slice(0, 400)}{post.contentEncoded.length > 400 && '…'}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-secondary text-sm">No posts match this filter.</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Commit confirmation panel
// ---------------------------------------------------------------------------
function CommitPanel({
  selectedCount,
  isCommitting,
  onCommit,
}: {
  selectedCount: number;
  isCommitting: boolean;
  onCommit: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-[220px]">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <span className="material-symbols-outlined text-xl">cloud_upload</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">
            Ready to import {selectedCount} post{selectedCount !== 1 ? 's' : ''} into Supabase
          </p>
          <p className="text-xs text-secondary mt-0.5">
            All posts will be saved as <strong>draft</strong>. Duplicate slugs will be skipped safely.
          </p>
        </div>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-on-surface">
        <input
          type="checkbox"
          id="commit-confirm-checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
        />
        I&apos;ve reviewed the mappings and am ready to commit
      </label>

      <button
        id="commit-import-button"
        onClick={onCommit}
        disabled={!confirmed || isCommitting}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-bold shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
      >
        {isCommitting ? (
          <>
            <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            Importing…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Commit {selectedCount} posts to Supabase
          </>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Next-steps panel — queries Supabase for image count, shown after commit
// ---------------------------------------------------------------------------
function NextStepsPanel({ importedCount }: { importedCount: number }) {
  const [needsImageCount, setNeedsImageCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchImageCount = async () => {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('import_source', 'wordpress_migration')
          .eq('image_migrated', false)
          .is('deleted_at', null);
        setNeedsImageCount(count ?? 0);
      } catch {
        setNeedsImageCount(null);
      }
    };
    fetchImageCount();
  }, []);

  return (
    <div className="px-6 py-5 border-b border-outline-variant/20 bg-emerald-500/5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[18px] text-emerald-500">task_alt</span>
        <p className="text-sm font-bold text-on-surface">
          {importedCount} post{importedCount !== 1 ? 's' : ''} imported successfully — next steps
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Step 1: Review imports */}
        <a
          href="/admin/posts?source=migration&status=draft"
          className="group flex items-start gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0 group-hover:bg-violet-500/20 transition-colors">
            <span className="material-symbols-outlined text-[20px]">manage_search</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors flex items-center gap-1">
              Review imported drafts
              <span className="material-symbols-outlined text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
            </p>
            <p className="text-xs text-secondary mt-0.5">
              Opens Posts dashboard filtered to WP-migrated drafts only
            </p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-mono font-semibold">
              /admin/posts?source=migration&amp;status=draft
            </div>
          </div>
        </a>

        {/* Step 2: Image Review tool */}
        <a
          href="/admin/import/images"
          className="group flex items-start gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 group-hover:bg-amber-500/20 transition-colors">
            <span className="material-symbols-outlined text-[20px]">image_search</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors flex items-center gap-1">
              Image Review tool
              <span className="material-symbols-outlined text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
            </p>
            <p className="text-xs text-secondary mt-0.5">
              {needsImageCount === null
                ? 'Checking image count…'
                : needsImageCount === 0
                  ? 'All migrated posts already have images reviewed'
                  : (
                    <>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">{needsImageCount} post{needsImageCount !== 1 ? 's' : ''}</span>
                      {' '}still need{needsImageCount === 1 ? 's' : ''} featured image migration
                    </>
                  )
              }
            </p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-semibold">
              {needsImageCount !== null && needsImageCount > 0
                ? `${needsImageCount} image${needsImageCount !== 1 ? 's' : ''} pending`
                : 'image_migrated = false'}
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Commit results summary
// ---------------------------------------------------------------------------
function CommitResults({ response }: { response: CommitResponse }) {
  const skipped = response.results.filter((r) => r.status === 'skipped');
  const failed = response.results.filter((r) => r.status === 'failed');
  const imported = response.results.filter((r) => r.status === 'imported');

  return (
    <div className="rounded-2xl border border-outline-variant/30 overflow-hidden">
      {/* Header */}
      <div className="bg-surface-container-low border-b border-outline-variant/30 px-6 py-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-on-surface">summarize</span>
          <h2 className="text-base font-bold text-on-surface">Import Results</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {response.importedCount} imported
          </span>
          {response.skippedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
              <span className="material-symbols-outlined text-[14px]">skip_next</span>
              {response.skippedCount} skipped
            </span>
          )}
          {response.failedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-error/15 text-error border border-error/25">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {response.failedCount} failed
            </span>
          )}
        </div>
      </div>

      {/* Next-steps panel — only shown when at least one post was imported */}
      {imported.length > 0 && (
        <NextStepsPanel importedCount={imported.length} />
      )}

      {/* Skipped */}
      {skipped.length > 0 && (
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Skipped — Duplicate slug</p>
          <div className="space-y-1.5">
            {skipped.map((r) => (
              <div key={r.wp_post_id} className="flex items-start gap-2 text-xs">
                <span className="material-symbols-outlined text-[14px] text-amber-500 shrink-0 mt-0.5">skip_next</span>
                <span className="font-medium text-on-surface truncate max-w-[320px]" title={r.title}>{r.title}</span>
                <span className="font-mono text-secondary shrink-0">/{r.slug}</span>
                <span className="text-secondary ml-auto shrink-0">{r.skipReason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed */}
      {failed.length > 0 && (
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Failed — Database errors</p>
          <div className="space-y-2">
            {failed.map((r) => (
              <div key={r.wp_post_id} className="flex items-start gap-2 text-xs">
                <span className="material-symbols-outlined text-[14px] text-error shrink-0 mt-0.5">error</span>
                <div>
                  <span className="font-medium text-on-surface">{r.title}</span>
                  <p className="font-mono text-error mt-0.5 break-all">{r.error}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imported list (collapsed after 8) */}
      {imported.length > 0 && (
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Successfully Imported</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
            {imported.map((r) => (
              <div key={r.wp_post_id} className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-[14px] text-emerald-500 shrink-0">check_circle</span>
                <span className="font-medium text-on-surface truncate max-w-[320px]" title={r.title}>{r.title}</span>
                <span className="font-mono text-secondary shrink-0">/{r.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminImportPage() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [filename, setFilename] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setParseResult(null);
    setRows([]);
    setCommitResult(null);
    setCommitError(null);
    setFilename(file.name);
    setIsParsing(true);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/import/parse', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? `Parse failed (HTTP ${res.status})`); return; }
      const result = json as ParseResult;
      setParseResult(result);
      setRows(buildImportRows(result.posts));
    } catch (err) {
      setError(`Network or parse error: ${(err as Error).message}`);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleToggleRow = useCallback((id: string) => {
    setRows((prev) => prev.map((r) => r.post.wp_post_id === id ? { ...r, included: !r.included } : r));
  }, []);

  const handleChangeContentType = useCallback((id: string, ct: ContentType) => {
    setRows((prev) => prev.map((r) => r.post.wp_post_id === id ? { ...r, contentType: ct } : r));
  }, []);

  const handleChangeCategory = useCallback((id: string, cat: string, sub: string) => {
    setRows((prev) => prev.map((r) => r.post.wp_post_id === id ? { ...r, category: cat, subcategory: sub } : r));
  }, []);

  const handleSelectAll = useCallback(() => setRows((prev) => prev.map((r) => ({ ...r, included: true }))), []);
  const handleDeselectAll = useCallback(() => setRows((prev) => prev.map((r) => ({ ...r, included: false }))), []);

  const handleCommit = useCallback(async () => {
    const selected = rows.filter((r) => r.included);
    if (selected.length === 0) return;

    setIsCommitting(true);
    setCommitError(null);
    setCommitResult(null);

    try {
      const payload = selected.map((r) => ({
        wp_post_id: r.post.wp_post_id,
        title: r.post.title,
        slug: r.post.slug,
        contentType: r.contentType,
        category: r.category,
        subcategory: r.subcategory,
        contentEncoded: r.post.contentEncoded,
        pubDate: r.post.pubDate,
        featuredImageUrl: r.post.featuredImageUrl,
        original_wp_slug: r.post.slug,
      }));

      const res = await fetch('/api/admin/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: payload }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // Response was not JSON
      }

      if (res.status === 401 || res.status === 403) {
        setCommitError(json?.error ?? 'Authentication required. Please refresh and log in again.');
        return;
      }

      // If the response contains a results array, render the breakdown
      // regardless of HTTP status code
      if (json && Array.isArray(json.results)) {
        setCommitResult(json as CommitResponse);
        if (json.failedCount > 0 && json.importedCount === 0) {
          setCommitError('All selected posts failed to import. See details below.');
        } else if (json.failedCount > 0) {
          setCommitError(`Import completed with warnings: ${json.importedCount} imported, ${json.failedCount} failed.`);
        }
        setTimeout(() => {
          document.getElementById('commit-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      }

      if (!res.ok) {
        setCommitError(json?.error ?? `Commit failed (HTTP ${res.status})`);
        return;
      }

      if (json) {
        setCommitResult(json as CommitResponse);
        setTimeout(() => {
          document.getElementById('commit-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      setCommitError(`Network error: ${(err as Error).message}`);
    } finally {
      setIsCommitting(false);
    }
  }, [rows]);

  const selectedCount = rows.filter((r) => r.included).length;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      <AdminHeader />

      <main className="w-full max-w-[1520px] mx-auto px-4 lg:px-8 py-8 flex-1">
        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-xl">move_to_inbox</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface tracking-tight">WordPress Bulk Import</h1>
              <p className="text-xs text-secondary">Stage 1 of 3 — Parse, Infer &amp; Review</p>
            </div>
          </div>
          {/* Stage indicators */}
          <div className="flex items-center gap-2 mt-4">
            {[
              { label: 'Upload & Parse', active: true },
              { label: 'Map & Review', active: false },
              { label: 'Import to DB', active: false },
            ].map((stage, i) => (
              <React.Fragment key={stage.label}>
                <div className={['flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold', stage.active ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-secondary'].join(' ')}>
                  <span className={['w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold', stage.active ? 'bg-white/20' : 'bg-outline-variant/30'].join(' ')}>
                    {i + 1}
                  </span>
                  {stage.label}
                </div>
                {i < 2 && <span className="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        {!parseResult && <div className="max-w-2xl"><DropZone onFile={handleFile} disabled={isParsing} /></div>}

        {/* Spinner */}
        {isParsing && (
          <div className="flex items-center gap-3 mt-8 text-secondary">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm">Parsing WXR file server-side…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 max-w-2xl p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div>
              <p className="font-semibold mb-0.5">Parse Error</p>
              <p className="text-xs font-mono">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {parseResult && !isParsing && (
          <div className="space-y-6">
            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setParseResult(null); setFilename(''); setError(null); setRows([]); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Upload a different file
              </button>
              <span className="text-xs text-secondary">
                Zero writes to Supabase — read-only parse &amp; review.
              </span>
              {selectedCount > 0 && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/20 text-primary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                  {selectedCount} of {rows.length} posts selected for import
                </div>
              )}
            </div>

            {/* Summary */}
            <SummaryBar
              result={parseResult}
              filename={filename}
              rows={rows}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            {/* Table or empty state */}
            {rows.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-on-surface">Parsed Posts — Review &amp; Edit</h2>
                  <p className="text-xs text-secondary">
                    Edit Content Type &amp; Category inline. Click row to expand details.
                  </p>
                </div>
                <PreviewTable
                  rows={rows}
                  onToggleRow={handleToggleRow}
                  onChangeContentType={handleChangeContentType}
                  onChangeCategory={handleChangeCategory}
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-secondary mb-3 block">inbox</span>
                <p className="text-on-surface font-semibold">No posts found</p>
                <p className="text-sm text-secondary mt-1">
                  The file contained {parseResult.totalItemsInFeed} items but none had{' '}
                  <code className="font-mono text-xs bg-surface-container px-1 rounded">wp:post_type = post</code>.
                </p>
              </div>
            )}

            {/* Commit panel — always visible once rows are loaded */}
            {rows.length > 0 && !commitResult && (
              <CommitPanel
                selectedCount={selectedCount}
                isCommitting={isCommitting}
                onCommit={handleCommit}
              />
            )}

            {/* Commit error */}
            {commitError && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
                <div>
                  <p className="font-semibold mb-0.5">Commit Failed</p>
                  <p className="text-xs font-mono">{commitError}</p>
                </div>
              </div>
            )}

            {/* Commit results summary */}
            {commitResult && (
              <div id="commit-results">
                <CommitResults response={commitResult} />
                <button
                  onClick={() => { setCommitResult(null); setCommitError(null); }}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface text-xs font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  Run another commit (adjust selections above)
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
