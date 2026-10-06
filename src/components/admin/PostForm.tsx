'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ContentType, PostStatus } from '@/types';
import { slugify, resolveSeoTitle } from '@/lib/seo';
import { PARENT_TAXONOMY } from '@/lib/taxonomy';
import { formatStatus } from '@/lib/formatStatus';
import DOMPurify from 'dompurify';
import { analyzeSEO, SeoAnalysisResult } from '@/lib/seoAnalysis';
import { getCanonicalPostPath } from '@/lib/routes';

import { ContentTypeSelect } from './ContentTypeSelect';
import { SlugField } from './SlugField';
import { TiptapEditor } from './TiptapEditor';
import { CategorySelect } from './CategorySelect';
import { ImageUpload } from './ImageUpload';
import { CaseStudyFields } from './CaseStudyFields';
import { StatusActions } from './StatusActions';
import { SeoSidebar } from './seo/SeoSidebar';
import { DraftPreviewFrame } from './DraftPreviewFrame';

export interface InitialPostData {
  id: string;
  title: string;
  seo_title?: string | null;
  slug: string;
  content_type: ContentType;
  content: string;
  meta_description?: string | null;
  focus_keyword?: string | null;
  secondary_keywords?: string[] | null;
  category?: string | null;
  subcategory?: string | null;
  featured_image_url?: string | null;
  status: PostStatus;
  total_raised?: string | null;
  founded_year?: number | string | null;
  shutdown_year?: number | string | null;
  hq_country?: string | null;
  failure_reason?: string | null;
  author_id?: string;
  published_at?: string | null;
  preview_token?: string | null;
  seo_score?: number | null;
  canonical_url?: string | null;
  is_noindex?: boolean | null;
  is_nofollow?: boolean | null;
  schema_type?: 'Article' | 'NewsArticle' | 'TechArticle' | 'FAQPage' | null;
  is_cornerstone?: boolean | null;
}

interface PostFormProps {
  isDarkMode?: boolean;
  initialPost?: InitialPostData;
  isEditMode?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({
  isDarkMode = false,
  initialPost,
  isEditMode = false,
}) => {
  const router = useRouter();

  // 1. Core Post Form State (pre-populated if in edit mode)
  const [contentType, setContentType] = useState<ContentType>(
    initialPost?.content_type || 'case_study'
  );
  const [title, setTitle] = useState(initialPost?.title || '');
  const [seoTitle, setSeoTitle] = useState(
    initialPost?.seo_title && initialPost.seo_title !== '%title% %sep% %sitename%'
      ? initialPost.seo_title
      : ''
  );
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [isSlugTaken, setIsSlugTaken] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const [content, setContent] = useState(initialPost?.content || '');
  const [editorDoc, setEditorDoc] = useState<any>(null);
  const [editorPlainText, setEditorPlainText] = useState('');

  const [metaDescription, setMetaDescription] = useState(
    initialPost?.meta_description || ''
  );
  const [focusKeyword, setFocusKeyword] = useState(
    initialPost?.focus_keyword || ''
  );
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>(
    initialPost?.secondary_keywords || []
  );

  // Taxonomy state
  const [category, setCategory] = useState<string>(
    initialPost?.category || PARENT_TAXONOMY[0].name
  );
  const [subcategory, setSubcategory] = useState<string>(
    initialPost?.subcategory || PARENT_TAXONOMY[0].subcategories[0]
  );

  // Media
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialPost?.featured_image_url || ''
  );

  // Publication Status
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status || 'draft'
  );

  // Case-study-only fields
  const [totalRaised, setTotalRaised] = useState(
    initialPost?.total_raised || ''
  );
  const [foundedYear, setFoundedYear] = useState(
    initialPost?.founded_year ? String(initialPost.founded_year) : ''
  );
  const [shutdownYear, setShutdownYear] = useState(
    initialPost?.shutdown_year ? String(initialPost.shutdown_year) : ''
  );
  const [hqCountry, setHqCountry] = useState(initialPost?.hq_country || '');
  const [failureReason, setFailureReason] = useState(
    initialPost?.failure_reason || ''
  );

  // UI / Network state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<{
    slug: string;
    status: PostStatus;
    id: string;
  } | null>(null);

  // Draft Preview & Workspace Mode State
  const [publishedAt, setPublishedAt] = useState<string | null>(
    initialPost?.published_at || null
  );
  const [previewToken, setPreviewToken] = useState<string | null>(
    initialPost?.preview_token || null
  );
  const [workspaceMode, setWorkspaceMode] = useState<'editor' | 'split' | 'fullscreen_preview'>('editor');
  const [isDirty, setIsDirty] = useState(false);

  // SEO & Schema State
  const [canonicalUrl, setCanonicalUrl] = useState<string>(
    initialPost?.canonical_url || ''
  );
  const [isNoindex, setIsNoindex] = useState<boolean>(
    Boolean(initialPost?.is_noindex)
  );
  const [isNofollow, setIsNofollow] = useState<boolean>(
    Boolean(initialPost?.is_nofollow)
  );
  const [schemaType, setSchemaType] = useState<'Article' | 'NewsArticle' | 'TechArticle' | 'FAQPage'>(
    initialPost?.schema_type || 'Article'
  );

  // 2. VG SEO Engine Live SEO Analysis (debounced 500ms)
  const [isDebouncingSeo, setIsDebouncingSeo] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysisResult>(() =>
    analyzeSEO({
      title: initialPost?.title || '',
      seoTitle:
        initialPost?.seo_title && initialPost.seo_title !== '%title% %sep% %sitename%'
          ? initialPost.seo_title
          : '',
      slug: initialPost?.slug || '',
      metaDescription: initialPost?.meta_description || '',
      focusKeyword: initialPost?.focus_keyword || '',
      secondaryKeywords: initialPost?.secondary_keywords || [],
      doc: null,
      plainText: '',
    })
  );

  useEffect(() => {
    setIsDebouncingSeo(true);
    const timer = setTimeout(() => {
      const res = analyzeSEO({
        title,
        seoTitle,
        slug,
        metaDescription,
        focusKeyword,
        secondaryKeywords,
        doc: editorDoc,
        plainText: editorPlainText,
      });
      setSeoAnalysis(res);
      setIsDebouncingSeo(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    title,
    seoTitle,
    slug,
    metaDescription,
    focusKeyword,
    secondaryKeywords,
    editorDoc,
    editorPlainText,
  ]);

  // Fetch logged in user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
          setCurrentUserId(data.user.id);
          setCurrentUserEmail(data.user.email || null);
        } else if (error) {
          console.warn('Supabase auth user check:', error.message);
        }
      } catch (err) {
        console.error('Failed to get auth user:', err);
      }
    };
    fetchUser();
  }, []);

  // Auto-generate slug from title on blur if slug is empty or matches previous title
  const handleTitleBlur = () => {
    if (!slug && title) {
      const generated = slugify(title);
      setSlug(generated);
      checkSlugUniqueness(generated);
    }
  };

  // Check slug uniqueness against Supabase
  const checkSlugUniqueness = async (slugToCheck: string): Promise<boolean> => {
    const cleanSlug = slugify(slugToCheck);
    if (!cleanSlug) {
      setIsSlugTaken(false);
      return true;
    }

    // In edit mode, if slug is unchanged, it is valid
    if (isEditMode && initialPost && cleanSlug === initialPost.slug) {
      setIsSlugTaken(false);
      return true;
    }

    setIsCheckingSlug(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('posts')
        .select('id')
        .eq('slug', cleanSlug)
        .is('deleted_at', null);

      let { data, error } = await query.maybeSingle();

      // Fallback if deleted_at column not yet present
      if (error && error.code === '42703') {
        const retryRes = await supabase
          .from('posts')
          .select('id')
          .eq('slug', cleanSlug)
          .maybeSingle();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error && error.code !== 'PGRST116') {
        console.warn('Slug uniqueness query notice:', error.message);
        setIsSlugTaken(false);
        return true;
      }

      const taken = !!data && (!isEditMode || data.id !== initialPost?.id);
      setIsSlugTaken(taken);
      return !taken;
    } catch {
      setIsSlugTaken(false);
      return true;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Derive numeric value for optional sorting/filtering while preserving formatted input verbatim
  const parseRaisedNumeric = (val: string): number | null => {
    if (!val) return null;
    const clean = val.replace(/[\$,]/g, '').trim().toUpperCase();
    if (clean.endsWith('B') || clean.includes('BILLION')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      return isNaN(num) ? null : num * 1_000_000_000;
    }
    if (clean.endsWith('M') || clean.includes('MILLION')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      return isNaN(num) ? null : num * 1_000_000;
    }
    if (clean.endsWith('K') || clean.includes('THOUSAND')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      return isNaN(num) ? null : num * 1_000;
    }
    const directNum = parseFloat(clean.replace(/[^\d.]/g, ''));
    return isNaN(directNum) ? null : directNum;
  };

  // Form submission handler
  const handleSubmit = async (
    targetStatus: PostStatus,
    scheduledDateIso?: string | null
  ) => {
    setFormError(null);
    setFormSuccess(null);

    // 1. Basic validation
    if (!title.trim()) {
      setFormError('Post title is required.');
      return;
    }

    const cleanSlug = slugify(slug || title);
    if (!cleanSlug) {
      setFormError('A valid URL slug is required.');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      setFormError('Article content body cannot be empty.');
      return;
    }

    // 2. Validate slug uniqueness before submit
    const isUnique = await checkSlugUniqueness(cleanSlug);
    if (!isUnique) {
      setFormError(`Slug "${cleanSlug}" is already taken. Please customize your URL slug.`);
      return;
    }

    // 3. Case study required fields validation
    if (contentType === 'case_study') {
      if (!totalRaised.trim()) {
        setFormError('Total Raised is required for Case Study post-mortems (e.g. $120 million, $1.75B, or Undisclosed).');
        return;
      }
      if (!foundedYear.trim()) {
        setFormError('Founded Year is required for Case Study post-mortems.');
        return;
      }
      if (!shutdownYear.trim()) {
        setFormError('Shutdown Year is required for Case Study post-mortems.');
        return;
      }
      if (!hqCountry.trim()) {
        setFormError('HQ / Country is required for Case Study post-mortems.');
        return;
      }
      if (!failureReason.trim()) {
        setFormError('Primary Failure Reason is required for Case Study post-mortems.');
        return;
      }
    }

    // 4. Ensure authenticated author
    const supabase = createClient();
    let authorId = currentUserId || initialPost?.author_id;

    if (!authorId) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        authorId = userData.user.id;
        setCurrentUserId(authorId);
      } else {
        setFormError(
          'You must be signed in to save posts. Please log in to your admin account.'
        );
        return;
      }
    }

    setIsSubmitting(true);
    setStatus(targetStatus);

    try {
      const parsedNumericRaised = contentType === 'case_study' ? parseRaisedNumeric(totalRaised) : null;
      const parsedFounded = contentType === 'case_study' && foundedYear ? parseInt(foundedYear, 10) : null;
      const parsedShutdown = contentType === 'case_study' && shutdownYear ? parseInt(shutdownYear, 10) : null;

      // Sanitize HTML with isomorphic-dompurify before saving to database
      const sanitizedContent = DOMPurify.sanitize(content, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'frameborder', 'data-type'],
      });

      const now = new Date().toISOString();

      const cleanSeoTitle =
        seoTitle.trim() && seoTitle.trim() !== '%title% %sep% %sitename%'
          ? resolveSeoTitle(seoTitle, title)
          : null;

      // Calculate fresh SEO score at save time
      const currentSeo = analyzeSEO({
        title,
        seoTitle,
        slug: cleanSlug,
        metaDescription,
        focusKeyword,
        secondaryKeywords,
        doc: editorDoc,
        plainText: editorPlainText,
      });

      const postPayload: Record<string, any> = {
        title: title.trim(),
        seo_title: cleanSeoTitle && cleanSeoTitle !== title.trim() ? cleanSeoTitle : null,
        slug: cleanSlug,
        content_type: contentType,
        content: sanitizedContent,
        meta_description: metaDescription.trim() || null,
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords,
        category,
        subcategory: subcategory ? subcategory.trim() : null,
        featured_image_url: featuredImageUrl.trim() || null,
        status: targetStatus,
        updated_at: now,
        seo_score: currentSeo.score,
        canonical_url: canonicalUrl.trim() || null,
        is_noindex: isNoindex,
        is_nofollow: isNofollow,
        schema_type: schemaType,
        // Case-study-only fields
        total_raised: contentType === 'case_study' ? totalRaised.trim() : null,
        total_raised_numeric: parsedNumericRaised,
        founded_year: parsedFounded,
        shutdown_year: parsedShutdown,
        hq_country: contentType === 'case_study' ? hqCountry.trim() : null,
        failure_reason: contentType === 'case_study' ? failureReason.trim() : null,
      };

      if (targetStatus === 'scheduled') {
        postPayload.published_at = scheduledDateIso || publishedAt || now;
      } else if (targetStatus === 'published') {
        postPayload.published_at = publishedAt || now;
      } else {
        postPayload.published_at = null;
      }

      if (!isEditMode) {
        postPayload.author_id = authorId;
      }

      let savedId = initialPost?.id || '';

      if (isEditMode && initialPost?.id) {
        // UPDATE existing post
        const { data, error } = await supabase
          .from('posts')
          .update(postPayload)
          .eq('id', initialPost.id)
          .select('id, slug, status, preview_token')
          .single();

        if (data?.preview_token) {
          setPreviewToken(data.preview_token);
        }

        if (error) {
          // Graceful retry if optional columns not yet migrated
          if (error.code === '42703') {
            if (error.message.includes('total_raised_numeric')) delete postPayload.total_raised_numeric;
            if (error.message.includes('seo_title')) delete postPayload.seo_title;
            if (error.message.includes('seo_score')) delete postPayload.seo_score;
            if (error.message.includes('canonical_url')) delete postPayload.canonical_url;
            if (error.message.includes('is_noindex')) delete postPayload.is_noindex;
            if (error.message.includes('is_nofollow')) delete postPayload.is_nofollow;
            if (error.message.includes('schema_type')) delete postPayload.schema_type;
            const retryRes = await supabase
              .from('posts')
              .update(postPayload)
              .eq('id', initialPost.id)
              .select('id, slug, status')
              .single();
            if (retryRes.error) throw retryRes.error;
            savedId = retryRes.data?.id || initialPost.id;
          } else {
            throw error;
          }
        } else {
          savedId = data?.id || initialPost.id;
        }
      } else {
        // INSERT new post
        const { data, error } = await supabase
          .from('posts')
          .insert([postPayload])
          .select('id, slug, status, preview_token')
          .single();

        if (data?.preview_token) {
          setPreviewToken(data.preview_token);
        }

        if (error) {
          if (error.code === '42703') {
            if (error.message.includes('total_raised_numeric')) delete postPayload.total_raised_numeric;
            if (error.message.includes('seo_title')) delete postPayload.seo_title;
            if (error.message.includes('seo_score')) delete postPayload.seo_score;
            if (error.message.includes('canonical_url')) delete postPayload.canonical_url;
            if (error.message.includes('is_noindex')) delete postPayload.is_noindex;
            if (error.message.includes('is_nofollow')) delete postPayload.is_nofollow;
            if (error.message.includes('schema_type')) delete postPayload.schema_type;
            const retryRes = await supabase
              .from('posts')
              .insert([postPayload])
              .select('id, slug, status')
              .single();
            if (retryRes.error) throw retryRes.error;
            savedId = retryRes.data?.id || '';
          } else if (error.code === '42P01') {
            throw new Error(
              'The "posts" table does not exist in your Supabase database yet. Please run the SQL schema located in /supabase/schema.sql in your Supabase SQL Editor.'
            );
          } else {
            throw error;
          }
        } else {
          savedId = data?.id || '';
        }
      }

      setFormSuccess({
        id: savedId,
        slug: cleanSlug,
        status: targetStatus,
      });
      setIsDirty(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while saving post.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-secondary font-mono mb-2">
            <Link href="/admin/posts" className="hover:text-primary transition-colors">
              Posts &amp; Intelligence
            </Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">
              {isEditMode ? 'Edit Post' : 'New Post'}
            </span>
          </nav>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {isEditMode ? 'Edit Intelligence Post' : 'Create New Intelligence Post'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-secondary">
            {isEditMode
              ? `Update and optimize editorial dispatch "${initialPost?.title || title}".`
              : 'Draft forensic case studies, news dispatches, and tactical founder playbooks with live VG SEO Engine.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Workspace Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setWorkspaceMode('editor')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                workspaceMode === 'editor'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">edit_note</span>
              <span>Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceMode(workspaceMode === 'split' ? 'editor' : 'split')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                workspaceMode === 'split'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">vertical_split</span>
              <span>Split 50/50</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkspaceMode('fullscreen_preview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                workspaceMode === 'fullscreen_preview'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">visibility</span>
              <span>Full Preview</span>
            </button>
          </div>

          <Link
            href="/admin/posts"
            className="px-3.5 py-2 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-secondary hover:text-on-surface text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>All Posts</span>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {formSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-emerald-500 shrink-0">
              check_circle
            </span>
            <div>
              <p className="text-sm font-bold">
                {isEditMode ? 'Post updated successfully!' : 'Post created successfully!'}
              </p>
              <p className="text-xs opacity-90">
                Status: <span className="font-semibold uppercase tracking-wider">{formatStatus(formSuccess.status)}</span>
                {formSuccess.status === 'published' ? ' — Available on the live site.' : ' — Stored securely.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={getCanonicalPostPath(contentType, formSuccess.slug)}
              target="_blank"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wider transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>View Article</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </Link>
            {!isEditMode && (
              <button
                type="button"
                onClick={() => {
                  setFormSuccess(null);
                  setTitle('');
                  setSeoTitle('');
                  setSlug('');
                  setContent('');
                  setMetaDescription('');
                  setFocusKeyword('');
                  setSecondaryKeywords([]);
                  setFeaturedImageUrl('');
                  setStatus('draft');
                  setTotalRaised('');
                  setFoundedYear('');
                  setShutdownYear('');
                  setHqCountry('');
                  setFailureReason('');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors cursor-pointer"
              >
                Create Another Post
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {formError && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error flex items-start gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
          <div className="flex-1 text-xs">
            <p className="font-bold">Unable to save post</p>
            <p className="mt-0.5 opacity-90">{formError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-error/70 hover:text-error cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Main Two-Column Gutenberg + VG SEO Engine Layout */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(status);
        }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Column (8 cols): Title, Slug, Content, Autopsy Metrics, Media */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Content Type & Title & Slug */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-6 shadow-xs">
            <ContentTypeSelect
              value={contentType}
              onChange={(val) => setContentType(val)}
              disabled={isSubmitting}
            />

            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-title-input"
                className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">title</span>
                <span>Article Title</span>
                <span className="text-error">*</span>
              </label>
              <input
                id="post-title-input"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                disabled={isSubmitting}
                placeholder="e.g. Why Fast Failed: The $102M Checkout Collapse"
                className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-base font-semibold focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
              />
              <p className="text-[11px] text-secondary">
                The article title serves as the canonical H1 for the page.
              </p>
            </div>

            {/* Slug */}
            <SlugField
              value={slug}
              title={title}
              contentType={contentType}
              onChange={(val) => setSlug(val)}
              isTaken={isSlugTaken}
              isChecking={isCheckingSlug}
              disabled={isSubmitting}
              onBlurCheck={checkSlugUniqueness}
            />
          </div>

          {/* Section 2: Case-Study-Only Conditional Block */}
          {contentType === 'case_study' && (
            <CaseStudyFields
              totalRaised={totalRaised}
              onTotalRaisedChange={setTotalRaised}
              foundedYear={foundedYear}
              onFoundedYearChange={setFoundedYear}
              shutdownYear={shutdownYear}
              onShutdownYearChange={setShutdownYear}
              hqCountry={hqCountry}
              onHqCountryChange={setHqCountry}
              failureReason={failureReason}
              onFailureReasonChange={setFailureReason}
              disabled={isSubmitting}
            />
          )}

          {/* Section 3: Tiptap Block Editor */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">edit_note</span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Article Body &amp; Intelligence Breakdown
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setWorkspaceMode(workspaceMode === 'split' ? 'editor' : 'split')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    workspaceMode === 'split'
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-surface-container text-secondary hover:text-on-surface'
                  }`}
                  title="Toggle Split-Screen Live Preview"
                >
                  <span className="material-symbols-outlined text-[14px]">vertical_split</span>
                  <span>{workspaceMode === 'split' ? 'Hide Split' : 'Split Preview'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('fullscreen_preview')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
                  title="Open Fullscreen Live Preview"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  <span>Live Preview</span>
                </button>
              </div>
            </div>

            <TiptapEditor
              value={content}
              postId={initialPost?.id || 'new'}
              onChange={(val) => {
                setContent(val);
                setIsDirty(true);
              }}
              onDocumentChange={setEditorDoc}
              onPlainTextChange={setEditorPlainText}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Section 4: Taxonomy & Primary Category */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-6 shadow-xs">
            <div className="border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">category</span>
                <span>Taxonomy &amp; Placement</span>
              </h2>
              <p className="text-[11px] text-secondary">
                Map this dispatch directly into the Venture Graph PrimaryNav taxonomy hierarchy.
              </p>
            </div>

            <CategorySelect
              category={category}
              subcategory={subcategory}
              onCategoryChange={(val, sub) => {
                setCategory(val);
                if (sub !== undefined) setSubcategory(sub);
              }}
              onSubcategoryChange={(val) => setSubcategory(val)}
              disabled={isSubmitting}
            />
          </div>

          {/* Section 5: Featured Media */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-6 shadow-xs">
            <div className="border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">image</span>
                <span>Visual Asset / Featured Graphic</span>
              </h2>
              <p className="text-[11px] text-secondary">
                Upload an editorial graphic or chart directly to Supabase Storage.
              </p>
            </div>

            <ImageUpload
              value={featuredImageUrl}
              onChange={setFeaturedImageUrl}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {workspaceMode === 'split' ? (
          /* Split Right Column (6 cols): Sticky Live Preview Frame + Status & SEO */
          <div className="xl:col-span-6 space-y-6 xl:sticky xl:top-20">
            <DraftPreviewFrame
              slug={slug}
              contentType={contentType}
              previewToken={previewToken}
              isSaved={!isDirty}
              onQuickSave={() => handleSubmit('draft')}
              isSubmitting={isSubmitting}
              onToggleFullscreen={() => setWorkspaceMode('fullscreen_preview')}
              onClose={() => setWorkspaceMode('editor')}
            />

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <StatusActions
                status={status}
                onStatusChange={setStatus}
                publishedAt={publishedAt}
                onPublishedAtChange={setPublishedAt}
                onSubmit={(targetStatus, scheduledAt) => handleSubmit(targetStatus, scheduledAt)}
                isSubmitting={isSubmitting}
              />
            </div>

            <SeoSidebar
              analysis={seoAnalysis}
              title={title}
              seoTitle={seoTitle}
              contentType={contentType}
              onSeoTitleChange={(val) => {
                setSeoTitle(val);
                setIsDirty(true);
              }}
              slug={slug}
              onSlugChange={(val) => {
                setSlug(val);
                setIsDirty(true);
              }}
              metaDescription={metaDescription}
              onMetaDescriptionChange={(val) => {
                setMetaDescription(val);
                setIsDirty(true);
              }}
              focusKeyword={focusKeyword}
              onFocusKeywordChange={(val) => {
                setFocusKeyword(val);
                setIsDirty(true);
              }}
              secondaryKeywords={secondaryKeywords}
              onSecondaryKeywordsChange={(val) => {
                setSecondaryKeywords(val);
                setIsDirty(true);
              }}
              canonicalUrl={canonicalUrl}
              onCanonicalUrlChange={(val) => {
                setCanonicalUrl(val);
                setIsDirty(true);
              }}
              isNoindex={isNoindex}
              onIsNoindexChange={(val) => {
                setIsNoindex(val);
                setIsDirty(true);
              }}
              isNofollow={isNofollow}
              onIsNofollowChange={(val) => {
                setIsNofollow(val);
                setIsDirty(true);
              }}
              schemaType={schemaType}
              onSchemaTypeChange={(val) => {
                setSchemaType(val);
                setIsDirty(true);
              }}
              isDebouncing={isDebouncingSeo}
            />
          </div>
        ) : (
          /* Standard Right Column (4 cols): Sticky VG SEO Engine Sidebar & Status Actions */
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            <SeoSidebar
              analysis={seoAnalysis}
              title={title}
              seoTitle={seoTitle}
              contentType={contentType}
              onSeoTitleChange={(val) => {
                setSeoTitle(val);
                setIsDirty(true);
              }}
              slug={slug}
              onSlugChange={(val) => {
                setSlug(val);
                setIsDirty(true);
              }}
              metaDescription={metaDescription}
              onMetaDescriptionChange={(val) => {
                setMetaDescription(val);
                setIsDirty(true);
              }}
              focusKeyword={focusKeyword}
              onFocusKeywordChange={(val) => {
                setFocusKeyword(val);
                setIsDirty(true);
              }}
              secondaryKeywords={secondaryKeywords}
              onSecondaryKeywordsChange={(val) => {
                setSecondaryKeywords(val);
                setIsDirty(true);
              }}
              canonicalUrl={canonicalUrl}
              onCanonicalUrlChange={(val) => {
                setCanonicalUrl(val);
                setIsDirty(true);
              }}
              isNoindex={isNoindex}
              onIsNoindexChange={(val) => {
                setIsNoindex(val);
                setIsDirty(true);
              }}
              isNofollow={isNofollow}
              onIsNofollowChange={(val) => {
                setIsNofollow(val);
                setIsDirty(true);
              }}
              schemaType={schemaType}
              onSchemaTypeChange={(val) => {
                setSchemaType(val);
                setIsDirty(true);
              }}
              isDebouncing={isDebouncingSeo}
            />

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <StatusActions
                status={status}
                onStatusChange={setStatus}
                publishedAt={publishedAt}
                onPublishedAtChange={setPublishedAt}
                onSubmit={(targetStatus, scheduledAt) => handleSubmit(targetStatus, scheduledAt)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}
      </form>

      {/* Fullscreen Preview Modal Overlay */}
      {workspaceMode === 'fullscreen_preview' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full h-full max-w-7xl max-h-[96vh]">
            <DraftPreviewFrame
              slug={slug}
              contentType={contentType}
              previewToken={previewToken}
              isSaved={!isDirty}
              onQuickSave={() => handleSubmit('draft')}
              isSubmitting={isSubmitting}
              isFullscreen={true}
              onToggleFullscreen={() => setWorkspaceMode('editor')}
              onClose={() => setWorkspaceMode('editor')}
            />
          </div>
        </div>
      )}
    </div>
  );
};
