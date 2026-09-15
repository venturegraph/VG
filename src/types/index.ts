export type PostType =
  | 'failure'
  | 'funding'
  | 'news'
  | 'layoff'
  | 'lessons'
  | 'guide';

export interface Author {
  name: string;
  avatar?: string;
  role?: string;
}

export interface CaseStudyStats {
  totalRaised: string;
  foundedYear: string;
  shutdownYear: string;
  hqCountry: string;
  failureReason: string;
  peakValuation?: string;
  keyInvestors?: string[];
}

export interface ArticleCallout {
  title: string;
  description: string;
  href: string;
  category?: string;
}

export interface ArticleSection {
  heading: string;
  subheading?: string;
  paragraphs: string[];
  callout?: ArticleCallout;
  keyTakeaway?: string;
}

export interface CaseStudyArticle extends Post {
  subtitle: string;
  stats: CaseStudyStats;
  htmlContent?: string;
  content: {
    introduction: string[];
    sections: ArticleSection[];
  };
}

export interface FundingMetrics {
  amount: string;
  capitalType: string;
  round: string;
  valuation?: string;
  leadInvestors?: string[];
  keyPartners?: string;
}

export interface NewsArticle extends Post {
  timestamp: string;
  updatedTime?: string;
  metrics?: FundingMetrics;
  relatedCaseStudySlug?: string;
  content: {
    summary: string;
    body: string[];
    keyTerms?: { label: string; value: string }[];
    quote?: {
      text: string;
      author: string;
      role: string;
    };
  };
}

export interface HubLessonItem {
  number: string;
  id: string;
  title: string;
  thesis: string;
  paragraphs: string[];
  takeaway: string;
  relatedCaseStudySlug?: string;
}

export interface HubArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  publishDate: string;
  readTime: string;
  author: Author;
  introduction: string[];
  lessons: HubLessonItem[];
  conclusion?: string;
}

export interface CategoryMetadata {
  slug: string;
  title: string;
  parentCategory: string;
  description: string;
  badgeColor?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  category: string;
  subcategory?: string;
  publishDate: string;
  readTime: string;
  excerpt: string;
  image?: string;
  author?: Author;
  // Specific fields for funding / case studies
  amount?: string;
  round?: string;
  valuation?: string;
  capitalType?: string;
  tag?: string;
  stats?: CaseStudyStats;
  relatedCaseStudySlug?: string;
  // Taxonomy tags for multi-dimensional category filtering
  techCategory?: 'ai' | 'ecommerce' | 'saas' | 'fintech';
  fundingRange?: 'under-10m' | '10m-50m' | '50m-100m' | '100m-unicorn';
  fundingTypeCategory?: 'vc-backed' | 'bootstrapped' | 'crowdfunded';
}

export interface NavCategoryItem {
  name: string;
  description?: string;
  href: string;
}

export interface NavCategory {
  title: string;
  dropdownWidth?: string;
  items: NavCategoryItem[];
}

export interface SecondaryNavItem {
  label: string;
  href: string;
  icon: string;
  iconColorClass: string;
  active?: boolean;
}

export interface TrendingPost {
  rank: string;
  title: string;
  category: string;
  slug: string;
}

export type ContentType =
  | 'case_study'
  | 'news'
  | 'lessons_hub'
  | 'founder_playbook'
  | 'trend_analysis';

export type PostStatus = 'draft' | 'pending_review' | 'published';

export interface PostFormData {
  contentType: ContentType;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  category: string;
  subcategory: string;
  tags: string[];
  featuredImageUrl: string;
  status: PostStatus;
  totalRaised?: string;
  foundedYear?: string;
  shutdownYear?: string;
  hqCountry?: string;
  failureReason?: string;
}

export type UserRole = 'admin' | 'editor' | 'writer';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

/**
 * Full database row shape for the `posts` table.
 * Use this when reading raw rows from Supabase (e.g. in the import
 * pipeline or the Image Review tool).  The editor form uses PostFormData
 * instead — the migration-tracking fields below are intentionally absent
 * from PostFormData so they never appear in the normal editor UI.
 */
export interface DbPost {
  id: string;
  title: string;
  slug: string;
  content_type: ContentType;
  content: string | null;
  meta_description: string | null;
  seo_title: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[] | null;
  category: string | null;
  subcategory: string | null;
  featured_image_url: string | null;
  status: PostStatus;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Case-study-only fields
  total_raised: string | null;
  total_raised_numeric: number | null;
  founded_year: number | null;
  shutdown_year: number | null;
  hq_country: string | null;
  failure_reason: string | null;
  // Migration-tracking fields (import pipeline & Image Review tool only)
  /** 'wordpress_migration' for imported posts; NULL for editor-created posts */
  import_source: string | null;
  /** Original WordPress slug/URL path — used to locate images on the live old site */
  original_wp_slug: string | null;
  /** WordPress internal post ID (wp:post_id) — stable reference for import debugging */
  original_wp_post_id: string | null;
  /** true once the featured image has been reviewed/uploaded via the Image Review tool */
  image_migrated: boolean;
}
