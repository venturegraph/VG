'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatStatus, formatContentType, formatRole } from '@/lib/formatStatus';
import { PostStatus, UserRole } from '@/types';

interface AdminPostItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  contentType: string; // raw snake_case: 'case_study', 'news', 'lessons_hub', etc.
  status: PostStatus; // raw snake_case: 'draft', 'pending_review', 'published'
  lastUpdated: string;
  rawUpdatedAt: string;
  authorId?: string;
  authorName: string;
  authorEmail: string;
  authorRole?: string;
  link: string;
  isDatabaseRecord: boolean;
  /** 'wordpress_migration' for WP-imported posts, null otherwise */
  importSource: string | null;
}

function AdminPostsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Status filter state (stores RAW snake_case value: 'all' | 'pending_review' | 'published' | 'draft')
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
  // Source filter — 'migration' to show only WP-imported posts
  const [sourceFilter, setSourceFilter] = useState<'all' | 'migration'>('all');
  // Content type filter tab
  const [activeTypeTab, setActiveTypeTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Database posts state
  const [dbPosts, setDbPosts] = useState<AdminPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState<string | null>(null);

  // Inline action state (e.g. Approve & Publish loading ID)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Read URL params on mount: ?source=migration&status=draft
  useEffect(() => {
    const src = searchParams.get('source');
    const st = searchParams.get('status') as PostStatus | null;
    if (src === 'migration') setSourceFilter('migration');
    if (st && ['draft', 'published', 'pending_review'].includes(st)) setStatusFilter(st);
  }, [searchParams]);

  // Fetch current user and their profile/role from Supabase
  useEffect(() => {
    const fetchUserAndRole = async () => {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (user) {
          setCurrentUserId(user.id);
          const email = user.email || 'editorial-admin@venturegraph.me';
          setUserEmail(email);

          // Specifically guarantee bazighchohan@gmail.com has admin role
          const isBazighAdmin = email.toLowerCase() === 'bazighchohan@gmail.com';

          // Fetch role from profiles table
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();

            if (profile?.role) {
              setUserRole(profile.role as UserRole);
            } else if (isBazighAdmin) {
              setUserRole('admin');
              // Attempt to auto-provision admin profile row if table exists
              await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                name: 'Bazigh Chohan',
                role: 'admin',
              });
            } else {
              const detectedRole: UserRole = email.toLowerCase().includes('admin') ? 'admin' : 'writer';
              setUserRole(detectedRole);
            }
          } catch {
            if (isBazighAdmin || email.toLowerCase().includes('admin')) {
              setUserRole('admin');
            } else {
              setUserRole('writer');
            }
          }
        } else {
          setUserEmail('editorial-admin@venturegraph.me');
          setUserRole('admin');
        }
      } catch {
        setUserEmail('editorial-admin@venturegraph.me');
        setUserRole('admin');
      }
    };
    fetchUserAndRole();
  }, []);

  // Fetch posts from Supabase database based on role:
  // - If role === 'admin': selects across ALL authors
  // - If role === 'editor' | 'writer': selects ONLY their own posts
  const fetchSupabasePosts = useCallback(async () => {
    setIsLoading(true);
    setLoadNotice(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from('posts')
        .select('*')
        .order('updated_at', { ascending: false });

      // Role-based filtering: writers and editors only see their own posts
      if (userRole !== 'admin' && currentUserId) {
        query = query.eq('author_id', currentUserId);
      }

      // Status filtering (using RAW snake_case value)
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Soft delete filter: WHERE deleted_at IS NULL
      query = query.is('deleted_at', null);

      let { data, error } = await query;

      // Graceful fallback if deleted_at column does not exist yet before SQL migration
      if (error && error.code === '42703') {
        let retryQuery = supabase
          .from('posts')
          .select('*')
          .order('updated_at', { ascending: false });

        if (userRole !== 'admin' && currentUserId) {
          retryQuery = retryQuery.eq('author_id', currentUserId);
        }
        if (statusFilter !== 'all') {
          retryQuery = retryQuery.eq('status', statusFilter);
        }
        const retryRes = await retryQuery;
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) {
        console.warn('Supabase query notice:', error.message);
        setLoadNotice(error.message);
      } else if (data) {
        const mapped: AdminPostItem[] = data.map((item) => {
          const rawDate = item.updated_at || item.created_at;
          const formattedDate = rawDate
            ? new Date(rawDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent';

          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            category: item.category || 'General',
            contentType: item.content_type || 'case_study',
            status: item.status as PostStatus, // raw snake_case
            lastUpdated: formattedDate,
            rawUpdatedAt: rawDate || new Date().toISOString(),
            authorId: item.author_id,
            authorName: item.author_id === currentUserId ? 'You' : 'Editorial Author',
            authorEmail: item.author_id === currentUserId && userEmail ? userEmail : 'staff@venturegraph.me',
            authorRole: item.author_id === currentUserId ? userRole : 'writer',
            link: `/articles/${item.slug}`,
            isDatabaseRecord: true,
            importSource: item.import_source ?? null,
          };
        });
        setDbPosts(mapped);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching posts.';
      console.error(msg);
      setLoadNotice(msg);
    } finally {
      setIsLoading(false);
    }
  }, [userRole, currentUserId, userEmail, statusFilter]);

  useEffect(() => {
    fetchSupabasePosts();
  }, [fetchSupabasePosts]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push('/admin');
    router.refresh();
  };

  // Action: Admin "Approve & Publish" Pending Review post
  const handleApproveAndPublish = async (post: AdminPostItem) => {
    if (userRole !== 'admin') {
      alert('Only administrators have permission to publish posts.');
      return;
    }

    setActionLoadingId(post.id);
    setActionSuccessMessage(null);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      // Only admin can update status to 'published'
      const { error } = await supabase
        .from('posts')
        .update({
          status: 'published',
          published_at: now,
          updated_at: now,
        })
        .eq('id', post.id);

      if (error) {
        throw error;
      }

      // Optimistic update in local list
      setDbPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                status: 'published',
                lastUpdated: 'Just now',
              }
            : p
        )
      );

      setActionSuccessMessage(
        `Post "${post.title}" has been approved and published to the live portal.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve post.';
      alert(`Approval error: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permissions for deletion matching RLS policy:
  // - Admin can delete any post
  // - Authors can delete their own non-published posts (status !== 'published')
  const canDeletePost = (post: AdminPostItem) => {
    if (userRole === 'admin') return true;
    const isOwnPost = post.authorId === currentUserId || !post.isDatabaseRecord;
    return isOwnPost && post.status !== 'published';
  };

  // Action: Soft delete post (sets deleted_at = now())
  const handleDeletePost = async (post: AdminPostItem) => {
    if (!canDeletePost(post)) {
      alert('You do not have permission to delete this dispatch.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${post.title}"?\n\nThis will soft-delete the dispatch and remove it from public and editorial listings.`
    );
    if (!confirmed) return;

    setActionLoadingId(post.id);
    setActionSuccessMessage(null);

    try {
      if (post.isDatabaseRecord) {
        const supabase = createClient();
        const now = new Date().toISOString();

        // 1. Attempt soft delete: set deleted_at = now()
        const { error } = await supabase
          .from('posts')
          .update({
            deleted_at: now,
            updated_at: now,
          })
          .eq('id', post.id);

        if (error) {
          // If deleted_at column is not yet migrated in Supabase, fallback to hard delete
          if (error.code === '42703') {
            const { error: hardDeleteErr } = await supabase
              .from('posts')
              .delete()
              .eq('id', post.id);

            if (hardDeleteErr) throw hardDeleteErr;
          } else {
            throw error;
          }
        }
      }

      // Remove from local list
      setDbPosts((prev) => prev.filter((p) => p.id !== post.id));
      setActionSuccessMessage(`Post "${post.title}" has been deleted.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete post.';
      alert(`Delete error: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Real posts from Supabase database
  const allPosts: AdminPostItem[] = dbPosts;

  // Client-side filtering for search, content types, and source
  const filteredPosts = allPosts.filter((post) => {
    // Status check (raw snake_case)
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

    // Source filter: only WP-migrated posts
    const matchesSource =
      sourceFilter === 'all' || post.importSource === 'wordpress_migration';

    // Content type check
    const matchesType =
      activeTypeTab === 'all' ||
      post.contentType === activeTypeTab ||
      (activeTypeTab === 'case_study' &&
        (post.contentType === 'case_study' || post.contentType === 'failure'));

    // Search query check
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch && matchesSource;
  });

  // Calculate counts
  const totalCount = allPosts.length;
  const pendingReviewCount = allPosts.filter((p) => p.status === 'pending_review').length;
  const publishedCount = allPosts.filter((p) => p.status === 'published').length;
  const draftCount = allPosts.filter((p) => p.status === 'draft').length;

  // Status Filter Tabs (IDs are RAW snake_case values)
  const STATUS_TABS: { id: 'all' | PostStatus; label: string }[] = [
    { id: 'all', label: 'All Statuses' },
    { id: 'pending_review', label: 'Pending Review' },
    { id: 'published', label: 'Published' },
    { id: 'draft', label: 'Drafts' },
  ];

  // Content Type Filter Tabs
  const TYPE_TABS = [
    { id: 'all', label: 'All Formats' },
    { id: 'case_study', label: 'Case Studies' },
    { id: 'news', label: 'News' },
    { id: 'funding', label: 'Funding' },
    { id: 'lessons_hub', label: 'Lessons Hub' },
    { id: 'founder_playbook', label: 'Playbooks' },
    { id: 'trend_analysis', label: 'Trends' },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <svg
                className="w-6 h-6 text-primary transition-transform group-hover:scale-105"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 9l4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
                <circle
                  cx="20"
                  cy="16"
                  r="1.5"
                  className="fill-primary-container stroke-primary-container"
                />
              </svg>
              <div className="flex items-center gap-2">
                <span className="font-headline-lg font-bold tracking-tight text-on-surface text-base leading-none">
                  VENTURE<span className="text-primary-container">GRAPH</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase">
                  CMS
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 border-l border-outline-variant/30 pl-6">
              <Link
                href="/admin/posts"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-semibold bg-surface-container text-primary"
              >
                Posts & Intelligence
              </Link>
              <Link
                href="/admin/new"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                + New Post
              </Link>
              <Link
                href="/admin/import"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                WP Import
              </Link>
              <Link
                href="/admin/import/images"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]">image_search</span>
                Image Review
              </Link>
              <Link
                href="/"
                target="_blank"
                className="px-3 py-1.5 rounded-lg text-xs font-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
              >
                <span>Live Site</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Role indicator & switcher for testing/demonstration */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/30">
              <span className="text-[10px] font-mono text-secondary uppercase font-semibold">
                Role:
              </span>
              <select
                aria-label="Active user role"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-bold text-on-surface focus:outline-hidden cursor-pointer"
              >
                <option value="admin" className="bg-surface-container">Admin</option>
                <option value="editor" className="bg-surface-container">Editor</option>
                <option value="writer" className="bg-surface-container">Writer</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleToggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface">
              <span
                className={`w-2 h-2 rounded-full ${
                  userRole === 'admin' ? 'bg-primary' : 'bg-emerald-500'
                } animate-pulse`}
              />
              <span className="font-mono text-[11px] text-secondary truncate max-w-[170px]">
                {userEmail || 'admin'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-secondary hover:text-error text-xs font-label-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-8 flex-1">
        {/* Role Permissions Notification Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-xl text-lg material-symbols-outlined ${
                userRole === 'admin'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {userRole === 'admin' ? 'admin_panel_settings' : 'edit_note'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  {formatRole(userRole)} Dashboard
                </h2>
                <span
                  className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                    userRole === 'admin'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}
                >
                  RLS Active
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                {userRole === 'admin'
                  ? 'Showing all posts across all authors. Administrators have exclusive authority to approve & publish dispatches.'
                  : `Restricted view: Displaying your personal drafts and submissions only. Only administrators can approve & publish.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchSupabasePosts()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-secondary hover:text-on-surface text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[15px] ${isLoading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>Sync</span>
            </button>
            <Link
              href="/admin/new"
              className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:opacity-95 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Post</span>
            </Link>
          </div>
        </div>

        {/* Migration filter banner — shown when ?source=migration is active */}
        {sourceFilter === 'migration' && (
          <div className="mb-4 p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25 flex flex-wrap items-center gap-3 text-xs">
            <span className="material-symbols-outlined text-[18px] text-violet-500">move_to_inbox</span>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-violet-700 dark:text-violet-300">WordPress migration filter active</span>
              <span className="text-secondary ml-2">Showing only WP-imported posts{statusFilter !== 'all' ? ` · status: ${statusFilter}` : ''}</span>
            </div>
            <button
              type="button"
              onClick={() => { setSourceFilter('all'); setStatusFilter('all'); }}
              className="flex items-center gap-1 text-violet-700 dark:text-violet-300 hover:text-on-surface font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Clear filter
            </button>
          </div>
        )}

        {/* Action success alert banner */}
        {actionSuccessMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">
                check_circle
              </span>
              <span className="font-semibold">{actionSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          </div>
        )}

        {/* Overview Stats Cards (Clickable to filter by status) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-surface-container-high border-primary/50 shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant'
            }`}
          >
            <span className="text-xs text-secondary font-label-sm font-semibold uppercase tracking-wider">
              {userRole === 'admin' ? 'Total Dispatches' : 'My Posts'}
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-bold font-headline-lg text-on-surface">
              {totalCount}
            </div>
            <span className="text-[11px] text-secondary mt-0.5 block">
              {userRole === 'admin' ? 'Across all contributors' : 'Created by your account'}
            </span>
          </button>

          {/* Pending Review Card */}
          <button
            type="button"
            onClick={() => setStatusFilter('pending_review')}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              statusFilter === 'pending_review'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary font-label-sm font-semibold uppercase tracking-wider">
                Pending Review
              </span>
              {pendingReviewCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold font-headline-lg text-amber-600 dark:text-amber-400">
              {pendingReviewCount}
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 block font-medium">
              {userRole === 'admin' ? 'Ready for approval' : 'Awaiting admin sign-off'}
            </span>
          </button>

          {/* Published */}
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-emerald-500/15 border-emerald-500/50 shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 hover:border-emerald-500/40'
            }`}
          >
            <span className="text-xs text-secondary font-label-sm font-semibold uppercase tracking-wider">
              Published
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-bold font-headline-lg text-emerald-600 dark:text-emerald-400">
              {publishedCount}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">
              Live in public portal
            </span>
          </button>

          {/* Drafts */}
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-secondary/15 border-secondary/50 shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant'
            }`}
          >
            <span className="text-xs text-secondary font-label-sm font-semibold uppercase tracking-wider">
              Drafts
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-bold font-headline-lg text-secondary">
              {draftCount}
            </div>
            <span className="text-[11px] text-secondary mt-0.5 block">
              Incomplete / work in progress
            </span>
          </button>
        </div>

        {/* Database load notice */}
        {loadNotice && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>
                Database note: {loadNotice}. Showing available local records.
              </span>
            </div>
            <button
              type="button"
              onClick={() => fetchSupabasePosts()}
              className="text-xs font-semibold underline hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="mb-6 space-y-4">
          {/* Row 1: STATUS TABS (Uses RAW snake_case values for state, formatStatus for display) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider shrink-0 mr-1">
                Status:
              </span>
              {STATUS_TABS.map((tab) => {
                const count =
                  tab.id === 'all'
                    ? totalCount
                    : allPosts.filter((p) => p.status === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      statusFilter === tab.id
                        ? tab.id === 'pending_review'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-secondary hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{tab.id === 'all' ? tab.label : formatStatus(tab.id)}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        statusFilter === tab.id
                          ? 'bg-black/20 text-white'
                          : 'bg-surface-container-high text-secondary'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, category, author..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface placeholder:text-secondary focus:outline-hidden focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: CONTENT TYPE TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider shrink-0 mr-1">
              Type:
            </span>
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTypeTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-label-md font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTypeTab === tab.id
                    ? 'bg-surface-container-highest text-on-surface font-semibold'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low text-secondary text-[11px] font-label-md uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Author</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Last Updated</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-secondary">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Loading dashboard posts...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-secondary">
                      <div className="space-y-2">
                        <p className="font-semibold text-on-surface">No posts found.</p>
                        <p className="text-[11px] text-secondary">
                          {statusFilter !== 'all'
                            ? `No records found with status "${formatStatus(statusFilter)}".`
                            : userRole !== 'admin'
                            ? 'You have not authored any posts in this category yet.'
                            : 'No posts matched your current search and type filters.'}
                        </p>
                        <div className="pt-2">
                          <Link
                            href="/admin/new"
                            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                          >
                            <span className="material-symbols-outlined text-[15px]">add</span>
                            <span>Create New Post</span>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-surface-container-low/60 transition-colors group"
                    >
                      {/* Title Column */}
                      <td className="py-3.5 px-4 font-semibold text-on-surface max-w-xs sm:max-w-md">
                        <Link
                          href={post.link}
                          target="_blank"
                          className="hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5"
                        >
                          <span>{post.title}</span>
                          <span className="material-symbols-outlined text-[13px] text-secondary group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            open_in_new
                          </span>
                        </Link>
                        <div className="flex items-center gap-2 text-[10px] text-secondary font-mono mt-0.5">
                          <span>/{post.slug}</span>
                          {post.isDatabaseRecord ? (
                            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold">
                              DB
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-surface-container text-secondary">
                              Archive
                            </span>
                          )}
                          {post.importSource === 'wordpress_migration' && (
                            <span
                              className="px-1.5 py-0.2 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25 font-bold text-[9px] uppercase tracking-wide"
                              title="Imported from WordPress"
                            >
                              WP
                            </span>
                          )}
                          <span>•</span>
                          <span>{post.category}</span>
                        </div>
                      </td>

                      {/* Content Type cell formatted with formatContentType */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-label-sm text-[10px] font-bold uppercase ${
                            post.contentType === 'case_study' || post.contentType === 'failure'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : post.contentType === 'funding'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : post.contentType === 'news'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {formatContentType(post.contentType)}
                        </span>
                      </td>

                      {/* Author Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-on-surface font-medium">
                            {post.authorName}
                          </span>
                          {post.authorRole && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-surface-container text-secondary">
                              {formatRole(post.authorRole)}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-secondary font-mono">
                          {post.authorEmail}
                        </div>
                      </td>

                      {/* Status cell formatted with formatStatus */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold uppercase tracking-wider ${
                            post.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : post.status === 'pending_review'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-secondary/15 text-secondary border border-secondary/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              post.status === 'published'
                                ? 'bg-emerald-500'
                                : post.status === 'pending_review'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-secondary'
                            }`}
                          />
                          {formatStatus(post.status)}
                        </span>
                      </td>

                      {/* Last Updated Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-secondary font-mono text-[11px]">
                        {post.lastUpdated}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Admin Only: "Approve & Publish" action for Pending Review posts */}
                          {userRole === 'admin' && post.status === 'pending_review' && (
                            <button
                              type="button"
                              onClick={() => handleApproveAndPublish(post)}
                              disabled={actionLoadingId === post.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Approve post and publish to live site"
                            >
                              {actionLoadingId === post.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <span className="material-symbols-outlined text-[14px]">
                                  verified
                                </span>
                              )}
                              <span>Approve &amp; Publish</span>
                            </button>
                          )}

                          <Link
                            href={post.link}
                            target="_blank"
                            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                            title="View post"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              visibility
                            </span>
                          </Link>

                          {post.isDatabaseRecord ? (
                            <Link
                              href={`/admin/edit/${post.id}`}
                              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                              title="Edit post"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => alert(`"${post.title}" is a mock demo dispatch. Create or edit real database posts at /admin/new.`)}
                              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                              title="Demo mock post (read-only)"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          )}

                          {/* Delete Action: Visible for admin on all posts, and for authors on their own non-published posts */}
                          {canDeletePost(post) && (
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post)}
                              disabled={actionLoadingId === post.id}
                              className="p-1.5 rounded-lg text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete post (soft delete)"
                            >
                              {actionLoadingId === post.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-error border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <span className="material-symbols-outlined text-[16px]">
                                  delete_outline
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-6 text-center text-xs text-secondary border-t border-outline-variant/20">
        Venture Graph CMS — Role-based access control active ({formatRole(userRole)} Session).
      </footer>
    </div>
  );
}

function AdminPostsFallback() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary">
      <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-headline-lg font-bold tracking-tight text-on-surface text-base leading-none">
                VENTURE<span className="text-primary-container">GRAPH</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase">
                CMS
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-medium text-secondary tracking-wide uppercase font-mono">
            Loading editorial dashboard…
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<AdminPostsFallback />}>
      <AdminPostsContent />
    </Suspense>
  );
}
