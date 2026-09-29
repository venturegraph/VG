-- ==============================================================================
-- MIGRATION: 20260929_newsletter.sql
-- Newsletter Subscribers Table with Row Level Security (RLS)
-- Note: Do NOT execute directly; to be reviewed and executed via Supabase SQL Editor.
-- ==============================================================================

-- 1. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT true,
  source_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive unique constraint on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscribers_lower_email
  ON public.newsletter_subscribers (lower(email));

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
-- Allow anonymous and authenticated visitors to insert new signups
DROP POLICY IF EXISTS "Allow anonymous and authenticated insert" ON public.newsletter_subscribers;
CREATE POLICY "Allow anonymous and authenticated insert"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Explicitly ensure NO select, update, or delete policies exist for anon/authenticated
-- (Without SELECT/UPDATE/DELETE policies, default deny prevents public reads or modifications)
