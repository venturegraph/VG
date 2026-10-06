-- ==============================================================================
-- MIGRATION: 20261006_cms_v2_upgrade.sql
-- CMS v2.0 Upgrade: Post Scheduling, Draft Previews & Persistent SEO Metrics
-- Note: Do NOT execute directly; to be reviewed and executed via Supabase SQL Editor.
-- ==============================================================================

-- 1. UPDATE POST STATUS CONSTRAINT
-- Allow 'scheduled' alongside 'draft', 'pending_review', and 'published'
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_status_check 
  CHECK (status IN ('draft', 'pending_review', 'scheduled', 'published'));

-- 2. DRAFT PREVIEWS & TOKEN SECURITY
-- Unique cryptographically random token for secure unauthenticated draft preview access
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS preview_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Populate existing rows where preview_token might be null
UPDATE public.posts SET preview_token = gen_random_uuid() WHERE preview_token IS NULL;

-- 3. PERSISTENT SEO METRICS & ENGINE FIELDS
-- Numeric SEO score (0-100) calculated by VG SEO Engine
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_score INT DEFAULT 0;

-- Custom canonical URL override
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Search engine indexing controls
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_noindex BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_nofollow BOOLEAN DEFAULT false;

-- Structured Data / JSON-LD schema type
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'Article';

-- Cornerstone content designation (high-priority pillars)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_cornerstone BOOLEAN DEFAULT false;

-- 4. PERFORMANCE & CRON SCHEDULING INDEXES
-- Optimized partial index for the scheduled dispatch worker/cron job
CREATE INDEX IF NOT EXISTS idx_posts_scheduled 
  ON public.posts(status, published_at) 
  WHERE status = 'scheduled';

-- Index for instant draft preview lookup via preview_token
CREATE INDEX IF NOT EXISTS idx_posts_preview_token 
  ON public.posts(preview_token);
