'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ImageReviewPost {
  id: string;
  title: string;
  slug: string;
  original_wp_slug: string | null;
  featured_image_url: string | null;
  image_migrated: boolean;
  status: string;
  content_type: string;
}

type RowPhase =
  | { phase: 'pending' }
  | { phase: 'done'; newUrl: string };

interface ReviewRow {
  post: ImageReviewPost;
  rowState: RowPhase;
}

// ---------------------------------------------------------------------------
// Admin Header
// ---------------------------------------------------------------------------
function AdminHeader() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
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
            <Link href="/admin/posts" className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors">
              Posts &amp; Intelligence
            </Link>
            <Link href="/admin/new" className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors">
              + New Post
            </Link>
            <Link href="/admin/import" className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors">
              WP Import
            </Link>
            <Link href="/admin/import/images" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container text-amber-600 dark:text-amber-400">
              Image Review
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={handleToggle} aria-label="Toggle theme" className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-secondary hover:text-error text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Compact inline uploader — same bucket/logic as ImageUpload.tsx, no drag UI
// ---------------------------------------------------------------------------
function RowUploader({
  postId,
  currentUrl,
  onSuccess,
}: {
  postId: string;
  currentUrl: string | null;
  onSuccess: (newUrl: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Not a valid image file.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Exceeds 8 MB limit.'); return; }

    setIsUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
      const filePath = `posts/${Date.now()}-${cleanName}.${fileExt}`;

      const { error: upErr } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (upErr) {
        throw upErr.message.toLowerCase().includes('bucket')
          ? new Error('"post-images" storage bucket not found in your Supabase project.')
          : upErr;
      }

      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filePath);
      if (!urlData?.publicUrl) throw new Error('Could not retrieve public URL.');

      const newUrl = urlData.publicUrl;

      const { error: dbErr } = await supabase
        .from('posts')
        .update({
          featured_image_url: newUrl,
          image_migrated: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (dbErr) throw dbErr;
      onSuccess(newUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }, [postId, onSuccess]);

  return (
    <div className="flex flex-col gap-1.5 min-w-[120px]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        disabled={isUploading}
      />
      <button
        type="button"
        id={`upload-btn-${postId}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
      >
        {isUploading ? (
          <>
            <span className="w-3 h-3 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin shrink-0" />
            Uploading…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[15px]">upload</span>
            {currentUrl ? 'Replace' : 'Upload image'}
          </>
        )}
      </button>
      {error && (
        <p className="text-[10px] text-error flex items-start gap-0.5 font-medium">
          <span className="material-symbols-outlined text-[11px] shrink-0 mt-0.5">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small thumbnail — handles broken old WP URLs gracefully with standard img
// ---------------------------------------------------------------------------
function Thumb({ url }: { url: string | null }) {
  const [broken, setBroken] = useState(false);

  if (!url) {
    return (
      <div className="w-[56px] h-[40px] rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[16px] text-secondary">hide_image</span>
      </div>
    );
  }
  if (broken) {
    return (
      <div className="w-[56px] h-[40px] rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0" title={`Failed to load: ${url}`}>
        <span className="material-symbols-outlined text-[15px] text-amber-500">broken_image</span>
      </div>
    );
  }
  return (
    <div className="relative w-[56px] h-[40px] rounded-lg overflow-hidden border border-outline-variant/30 shrink-0 bg-surface-container-low">
      {/* Use standard img so arbitrary WordPress domains never trigger Next.js image domain config errors */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pending row
// ---------------------------------------------------------------------------
function PendingRow({
  post,
  index,
  onDone,
}: {
  post: ImageReviewPost;
  index: number;
  onDone: (id: string, url: string) => void;
}) {
  const cleanSlug = post.original_wp_slug?.replace(/^\/+|\/+$/g, '') || post.slug?.replace(/^\/+|\/+$/g, '');
  const originalUrl = cleanSlug ? `https://venturegraph.me/${cleanSlug}/` : null;

  return (
    <tr className="border-b border-outline-variant/20 hover:bg-surface-container-low/40 transition-colors align-top group">
      {/* # */}
      <td className="px-3 py-3 text-xs text-secondary font-mono w-8">{index}</td>

      {/* Title + slug */}
      <td className="px-3 py-3 max-w-[240px]">
        <p className="font-medium text-on-surface text-sm truncate" title={post.title}>{post.title}</p>
        <p className="font-mono text-[10px] text-secondary mt-0.5 truncate">/{post.slug}</p>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/25 font-bold uppercase">WP</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-surface-container text-secondary border border-outline-variant/30">{post.status}</span>
        </div>
      </td>

      {/* View original link */}
      <td className="px-3 py-3 whitespace-nowrap">
        {originalUrl ? (
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            id={`view-original-${post.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface text-xs font-semibold transition-colors"
            title={`Open https://venturegraph.me/${cleanSlug}/ in new tab`}
          >
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            View Original Post
          </a>
        ) : (
          <span className="text-xs text-secondary italic">No WP slug</span>
        )}
      </td>

      {/* Current image */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Thumb url={post.featured_image_url} />
          <div className="min-w-0">
            {post.featured_image_url ? (
              <p className="font-mono text-[10px] text-secondary truncate max-w-[180px]" title={post.featured_image_url}>
                {post.featured_image_url}
              </p>
            ) : (
              <span className="text-[11px] text-secondary italic flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">hide_image</span>
                No image
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Upload */}
      <td className="px-3 py-3">
        <RowUploader postId={post.id} currentUrl={post.featured_image_url} onSuccess={(url) => onDone(post.id, url)} />
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Done row
// ---------------------------------------------------------------------------
function DoneRow({ post, newUrl, index }: { post: ImageReviewPost; newUrl: string; index: number }) {
  return (
    <tr className="border-b border-outline-variant/15 opacity-60 align-middle">
      <td className="px-3 py-2.5 text-xs text-secondary font-mono w-8">{index}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0">check_circle</span>
          <span className="font-medium text-on-surface text-sm truncate max-w-[200px]" title={post.title}>{post.title}</span>
        </div>
        <p className="font-mono text-[10px] text-secondary mt-0.5 ml-5">/{post.slug}</p>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        {post.original_wp_slug ? (
          <a href={`https://venturegraph.me/${post.original_wp_slug}/`} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:text-primary transition-colors font-mono">
            …/{post.original_wp_slug}/
          </a>
        ) : <span className="text-xs text-secondary">—</span>}
      </td>
      <td className="px-3 py-2.5" colSpan={2}>
        <div className="flex items-center gap-2">
          <Thumb url={newUrl} />
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 truncate max-w-[240px]" title={newUrl}>{newUrl}</span>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ImageReviewPage() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, original_wp_slug, featured_image_url, image_migrated, status, content_type')
        .or('import_source.eq.wordpress_migration,original_wp_slug.not.is.null')
        .is('deleted_at', null)
        .order('title', { ascending: true });

      if (error) throw error;

      setRows(
        (data ?? []).map((post) => ({
          post: post as ImageReviewPost,
          rowState: (post as ImageReviewPost).image_migrated
            ? { phase: 'done', newUrl: (post as ImageReviewPost).featured_image_url ?? '' }
            : { phase: 'pending' },
        }))
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load posts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDone = useCallback((postId: string, newUrl: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.post.id === postId
          ? { ...r, rowState: { phase: 'done', newUrl }, post: { ...r.post, featured_image_url: newUrl, image_migrated: true } }
          : r
      )
    );
  }, []);

  const pendingRows = rows.filter((r) => r.rowState.phase === 'pending');
  const doneRows   = rows.filter((r) => r.rowState.phase === 'done');
  const totalRows  = rows.length;

  const filteredPending = pendingRows.filter((r) =>
    !searchQuery ||
    r.post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.post.slug ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.post.original_wp_slug ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      <AdminHeader />

      <main className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-8 flex-1">

        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <span className="material-symbols-outlined text-xl">image_search</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface tracking-tight">Image Review</h1>
              <p className="text-xs text-secondary">WordPress migration — upload a replacement featured image for each post</p>
            </div>
          </div>

          {/* Stage breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {[
              { label: 'Upload & Parse', done: true },
              { label: 'Map & Review', done: true },
              { label: 'Import to DB', done: true },
              { label: 'Image Review', active: true },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                  s.active
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : s.done
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'bg-surface-container text-secondary',
                ].join(' ')}>
                  {s.done && !s.active
                    ? <span className="material-symbols-outlined text-[13px]">check</span>
                    : <span className={['w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold', s.active ? 'bg-amber-500/30' : 'bg-outline-variant/30'].join(' ')}>{i + 1}</span>
                  }
                  {s.label}
                </div>
                {i < arr.length - 1 && <span className="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 text-secondary py-16">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm">Loading migrated posts…</span>
          </div>
        )}

        {/* Load error */}
        {loadError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm flex items-start gap-3 max-w-2xl">
            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
            <div>
              <p className="font-semibold mb-1">Failed to load posts</p>
              <p className="text-xs font-mono">{loadError}</p>
              <button onClick={fetchPosts} className="mt-2 text-xs underline hover:no-underline cursor-pointer font-semibold">Retry</button>
            </div>
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="space-y-6">

            {/* Counter + toolbar */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Live counter */}
              <div id="image-review-counter" className={[
                'flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm',
                pendingRows.length > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
              ].join(' ')}>
                <span className="material-symbols-outlined text-[18px]">
                  {pendingRows.length > 0 ? 'pending' : 'task_alt'}
                </span>
                {pendingRows.length > 0 ? (
                  <>
                    <span className="text-xl font-extrabold">{pendingRows.length}</span>
                    <span className="font-normal text-secondary">of</span>
                    <span className="text-xl font-extrabold">{totalRows}</span>
                    posts still need images
                  </>
                ) : (
                  <span>All {totalRows} posts have images ✓</span>
                )}
              </div>

              <button
                type="button"
                onClick={fetchPosts}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                Refresh
              </button>

              {/* Search */}
              <div className="relative flex-1 min-w-[220px] max-w-sm ml-auto">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[17px]">search</span>
                <input
                  id="image-review-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title or slug…"
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Workflow hint */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-secondary max-w-4xl">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">tips_and_updates</span>
              <p>
                <strong className="text-on-surface">Workflow:</strong> Click <em>View original</em> to open the old post on venturegraph.me and see what image it used.
                Save that image to your computer, then click <em>Upload image</em> to upload it directly to Supabase Storage.
                The row moves to <strong className="text-emerald-600 dark:text-emerald-400">Done</strong> instantly on success and <code className="font-mono bg-surface-container px-1 rounded">image_migrated</code> is set to <code className="font-mono bg-surface-container px-1 rounded">true</code>.
              </p>
            </div>

            {/* ── Pending table ── */}
            {totalRows === 0 ? (
              <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-secondary mb-3 block">inbox</span>
                <p className="font-semibold text-on-surface">No migrated posts found</p>
                <p className="text-sm text-secondary mt-1">
                  Import posts first at{' '}
                  <Link href="/admin/import" className="text-primary hover:underline">/admin/import</Link>.
                </p>
              </div>
            ) : pendingRows.length === 0 ? (
              <div className="rounded-2xl bg-emerald-500/8 border border-emerald-500/25 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-emerald-500 mb-3 block">task_alt</span>
                <p className="text-on-surface font-bold text-base">All images reviewed!</p>
                <p className="text-sm text-secondary mt-1">
                  Every migrated post has <code className="font-mono text-xs bg-surface-container px-1 rounded">image_migrated = true</code>.
                </p>
                <Link
                  href="/admin/posts?source=migration"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-95 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                  View migrated posts
                </Link>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="py-10 text-center text-secondary text-sm">
                No posts match &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/30 overflow-hidden">
                <div className="bg-surface-container-low border-b border-outline-variant/30 px-5 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-amber-500">pending</span>
                  <span className="text-sm font-bold text-on-surface">
                    Needs Image
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">{filteredPending.length}</span>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/60 border-b border-outline-variant/20">
                        <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left w-8">#</th>
                        <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left min-w-[180px]">Post</th>
                        <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left whitespace-nowrap">Original Post</th>
                        <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left min-w-[200px]">Current Image</th>
                        <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left whitespace-nowrap">Upload New</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPending.map((row, idx) => (
                        <PendingRow
                          key={row.post.id}
                          post={row.post}
                          index={idx + 1}
                          onDone={handleDone}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Done section ── collapsible */}
            {doneRows.length > 0 && (
              <div className="rounded-2xl border border-outline-variant/25 overflow-hidden">
                <button
                  type="button"
                  id="toggle-done-section"
                  onClick={() => setShowDone((p) => !p)}
                  className="w-full bg-surface-container-low/50 border-b border-outline-variant/20 px-5 py-3 flex items-center gap-3 hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span>
                  <span className="text-sm font-bold text-on-surface flex-1 text-left">
                    Done
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">{doneRows.length}</span>
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    {showDone ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showDone && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/30 border-b border-outline-variant/15">
                          <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left w-8">#</th>
                          <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left">Post</th>
                          <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left">Original</th>
                          <th className="px-3 py-2.5 text-[11px] font-semibold text-secondary uppercase tracking-wider text-left" colSpan={2}>Image URL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doneRows.map((row, idx) => (
                          <DoneRow
                            key={row.post.id}
                            post={row.post}
                            newUrl={row.rowState.phase === 'done' ? row.rowState.newUrl : row.post.featured_image_url ?? ''}
                            index={idx + 1}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      <footer className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-5 text-center text-xs text-secondary border-t border-outline-variant/20">
        Venture Graph CMS — Image Review Tool · Uploads target the{' '}
        <code className="font-mono">post-images</code> Supabase Storage bucket
      </footer>
    </div>
  );
}

