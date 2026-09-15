-- ==============================================================================
-- VENTURE GRAPH CMS SCHEMA & MIGRATIONS
-- Table: profiles (roles: admin, editor, writer)
-- Table: posts (with soft delete deleted_at)
-- Storage: post-images
-- Migration columns: import_source, original_wp_slug, original_wp_post_id, image_migrated
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE & ROLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'writer' CHECK (role IN ('admin', 'editor', 'writer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: check if currently authenticated user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper function: get role of current user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'writer'
  );
$$;

-- Drop existing profile policies before recreating
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;

-- Profiles RLS Policies:
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    CASE WHEN public.is_admin() THEN true
         ELSE role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    END
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Auto-provision profile trigger when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE
      WHEN NEW.email = 'bazighchohan@gmail.com' THEN 'admin'
      WHEN NEW.email ILIKE '%admin%' THEN 'admin'
      ELSE 'writer'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE
      WHEN EXCLUDED.email = 'bazighchohan@gmail.com' THEN 'admin'
      ELSE public.profiles.role
    END,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profile rows for any existing accounts (including bazighchohan@gmail.com)
INSERT INTO public.profiles (id, email, name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  CASE
    WHEN email = 'bazighchohan@gmail.com' THEN 'admin'
    WHEN email ILIKE '%admin%' THEN 'admin'
    ELSE 'writer'
  END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = CASE
    WHEN EXCLUDED.email = 'bazighchohan@gmail.com' THEN 'admin'
    ELSE public.profiles.role
  END;

-- Explicitly ensure bazighchohan@gmail.com has admin role
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE email = 'bazighchohan@gmail.com';

-- ==============================================================================
-- 2. POSTS TABLE (With soft-delete deleted_at)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('case_study', 'news', 'lessons_hub', 'founder_playbook', 'trend_analysis')),
  content TEXT, -- markdown
  meta_description TEXT,
  seo_title TEXT,
  focus_keyword TEXT,
  secondary_keywords TEXT[],
  category TEXT,
  subcategory TEXT,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published')),
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ, -- Soft delete timestamp
  
  -- Case-study-only fields
  total_raised TEXT, -- Formatted string as-is (e.g. "$120 million", "$1.75B")
  total_raised_numeric NUMERIC, -- Derived numeric value for sorting/filtering
  founded_year INT,
  shutdown_year INT,
  hq_country TEXT,
  failure_reason TEXT
);

-- Migrations for existing tables
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.posts ALTER COLUMN total_raised TYPE TEXT USING total_raised::TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS total_raised_numeric NUMERIC;

-- Migration-tracking columns (import pipeline & Image Review tool only)
-- import_source: 'wordpress_migration' for imported posts, NULL for editor-created posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS import_source TEXT;
-- original_wp_slug: original WordPress slug/URL path for image lookup against the live old site
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS original_wp_slug TEXT;
-- original_wp_post_id: WordPress internal post ID (wp:post_id) as a stable import reference
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS original_wp_post_id TEXT;
-- image_migrated: tracks whether the featured image has been reviewed/uploaded via the Image Review tool
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_migrated BOOLEAN NOT NULL DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON public.posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON public.posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON public.posts(updated_at DESC);
-- Partial index: quickly find posts that came from the WordPress import pipeline
CREATE INDEX IF NOT EXISTS idx_posts_import_source ON public.posts(import_source) WHERE import_source IS NOT NULL;

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop old post policies before recreating
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Role based post select" ON public.posts;
DROP POLICY IF EXISTS "Role based post insert" ON public.posts;
DROP POLICY IF EXISTS "Role based post update" ON public.posts;
DROP POLICY IF EXISTS "Role based post delete" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;

-- ==============================================================================
-- POSTS RLS POLICIES (Enforcing soft-delete, role checks, and anon read)
-- ==============================================================================

-- 1. Anonymous & Public Visitors:
--    Can ONLY SELECT posts where status = 'published' AND deleted_at IS NULL
CREATE POLICY "Public can view published posts"
  ON public.posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);

-- 2. Authenticated Dashboard Select:
--    - Admin sees all posts (deleted_at IS NULL)
--    - Writers/Editors see their own posts (deleted_at IS NULL)
CREATE POLICY "Role based post select"
  ON public.posts FOR SELECT
  TO authenticated
  USING (
    (public.is_admin() AND deleted_at IS NULL)
    OR (auth.uid() = author_id AND deleted_at IS NULL)
    OR (status = 'published' AND deleted_at IS NULL)
  );

-- 3. Insert Policy:
--    - Writers / editors can only insert their own posts with 'draft' or 'pending_review'
--    - Admins can insert with any status
CREATE POLICY "Role based post insert"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = author_id AND (status IN ('draft', 'pending_review') OR public.is_admin()))
    OR public.is_admin()
  );

-- 4. Update Policy:
--    - Writers / editors can only update their own posts AND CANNOT set status to 'published'
--    - Only admin can update status to 'published'
--    - Admin can update all posts
CREATE POLICY "Role based post update"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR auth.uid() = author_id
  )
  WITH CHECK (
    public.is_admin()
    OR (auth.uid() = author_id AND status IN ('draft', 'pending_review'))
  );

-- 5. Delete Policy:
--    - Admins can delete any post
--    - Authors can delete their own non-published posts
CREATE POLICY "Role based post delete"
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR (auth.uid() = author_id AND status != 'published')
  );

-- ==============================================================================
-- 3. STORAGE BUCKET: post-images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access to post images" ON storage.objects;
CREATE POLICY "Public access to post images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- ==============================================================================
-- 4. VERIFICATION TEST DATA SEED & WRITER ACCOUNT ACTIVATION
-- ==============================================================================

-- 4.1 Confirm test writer account in auth.users so test scripts can authenticate
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now()) 
WHERE email = 'writer.test.venturegraph@gmail.com';

-- 4.2 Seed a published post authored by admin (bazighchohan@gmail.com)
INSERT INTO public.posts (
  id, title, slug, content_type, content, status, author_id, published_at, updated_at, deleted_at
) VALUES (
  'e1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c',
  'Why Fast Failed: The $102M Checkout Collapse',
  'why-fast-failed-checkout-collapse',
  'case_study',
  'An in-depth post-mortem autopsy of Fast, the checkout startup that burned through $102M.',
  'published',
  '54032975-9c83-41b2-b713-7ab4b9a51c74',
  now(),
  now(),
  NULL
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'published',
  deleted_at = NULL,
  published_at = COALESCE(public.posts.published_at, now()),
  updated_at = now();

-- 4.3 Seed a pending_review post authored by test writer (for status escalation testing)
INSERT INTO public.posts (
  id, title, slug, content_type, content, status, author_id, updated_at, deleted_at
) VALUES (
  'f2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d',
  'Quibi Post-Mortem: Why Mobile-Only Short-Form Failed',
  'quibi-post-mortem-mobile-short-form',
  'case_study',
  'Analysis of Quibi raising $1.75B and shutting down in 6 months.',
  'pending_review',
  '3d129a4f-62db-41b7-b4ab-9b29a986af92',
  now(),
  NULL
) ON CONFLICT (slug) DO UPDATE SET 
  status = 'pending_review',
  deleted_at = NULL,
  updated_at = now();
