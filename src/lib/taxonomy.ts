import { NavCategory, SecondaryNavItem } from '@/types';

export interface TaxonomyParent {
  name: string;
  subcategories: string[];
}

export const PARENT_TAXONOMY: TaxonomyParent[] = [
  {
    name: 'Tech',
    subcategories: ['AI', 'E-commerce', 'SaaS', 'FinTech'],
  },
  {
    name: 'Funding Raised',
    subcategories: ['Under $10M', '$10M–$50M', '$50M–$100M', '$100M+ Unicorn'],
  },
  {
    name: 'Funding Type',
    subcategories: ['Crowdfunded', 'VC-Backed', 'Bootstrapped'],
  },
  {
    name: 'Lessons & Insights',
    subcategories: ['Top Lists', 'Lessons Learned', 'Failure Patterns'],
  },
];

export const STANDALONE_CATEGORIES = [
  'News',
  'Shutdowns & Collapses',
  'Funding Alerts',
  'Layoffs',
];

export const SUGGESTED_TAGS = [
  'Post-Mortem',
  'Unit Economics',
  'Burn Rate',
  'Debt Overhang',
  'Regulatory Trap',
  'Seed Round',
  'Series A',
  'Series B-D',
  'Unicorn Collapse',
  'Founder Retrospective',
  'Fraud & Governance',
  'Pivot Failure',
  'Acquisition Dissolution',
  'Market Timing',
];

export interface CategoryMetadata {
  slug: string;
  title: string;
  parentCategory: string;
  description: string;
  badgeColor?: string;
}

export const CATEGORY_DIRECTORY: Record<string, CategoryMetadata> = {
  // Tech parent category
  ai: {
    slug: 'ai',
    title: 'Artificial Intelligence',
    parentCategory: 'Tech',
    description:
      'Venture intelligence, compute economics, and post-mortems across generative foundation models, agentic workflows, and cloud clusters.',
  },
  ecommerce: {
    slug: 'ecommerce',
    title: 'E-commerce & Logistics',
    parentCategory: 'Tech',
    description:
      'Unit economics, inventory fulfillment traps, and shutdown breakdowns across direct-to-consumer platforms and supply chain automation.',
  },
  saas: {
    slug: 'saas',
    title: 'Software as a Service (SaaS)',
    parentCategory: 'Tech',
    description:
      'Enterprise renewal autopsies, multi-region infrastructure costs, and funding rounds in B2B workflow platforms.',
  },
  fintech: {
    slug: 'fintech',
    title: 'Financial Technology (FinTech)',
    parentCategory: 'Tech',
    description:
      'Treasury yield risks, custodial licensing, neo-bank deposit dynamics, and capital alerts across payments and banking infrastructure.',
  },

  // Funding Raised parent category
  'under-10m': {
    slug: 'under-10m',
    title: 'Under $10M Raised',
    parentCategory: 'Funding Raised',
    description:
      'Early-stage rounds, seed capital allocations, and initial commercialization hurdles for startups with under $10 million in financing.',
  },
  '10m-50m': {
    slug: '10m-50m',
    title: '$10M – $50M Raised',
    parentCategory: 'Funding Raised',
    description:
      'Series A and B growth rounds, warehouse scaling challenges, and bridge financing terms for mid-market startups.',
  },
  '50m-100m': {
    slug: '50m-100m',
    title: '$50M – $100M Raised',
    parentCategory: 'Funding Raised',
    description:
      'Major growth equity deployments, clinical trials, and platform transformations managing nine-figure capitalization.',
  },
  '100m-unicorn': {
    slug: '100m-unicorn',
    title: '$100M+ Unicorn Scale',
    parentCategory: 'Funding Raised',
    description:
      'Mega-rounds and massive post-mortems of venture-backed giants that raised over $100 million in institutional capital.',
  },

  // Funding Type parent category
  'vc-backed': {
    slug: 'vc-backed',
    title: 'Venture Capital Backed',
    parentCategory: 'Funding Type',
    description:
      'Institutional venture-backed companies operating with traditional preferred equity stacks, liquidation preferences, and board governance.',
  },
  bootstrapped: {
    slug: 'bootstrapped',
    title: 'Bootstrapped & Self-Funded',
    parentCategory: 'Funding Type',
    description:
      'Founder-funded, customer-financed, and capital-efficient operations growing without institutional equity dilution.',
  },
  crowdfunded: {
    slug: 'crowdfunded',
    title: 'Crowdfunded & Community Backed',
    parentCategory: 'Funding Type',
    description:
      'Reg CF and consumer-backed startups navigating public shareholder bases and hardware preorder delivery economics.',
  },

  // Editorial Standalone Sections
  'startup-news': {
    slug: 'startup-news',
    title: 'Startup News & Dispatches',
    parentCategory: 'Editorial Section',
    description:
      'Timely coverage of restructuring announcements, strategic corporate pivots, and market movement across global tech hubs.',
  },
  'shutdowns-collapses': {
    slug: 'shutdowns-collapses',
    title: 'Shutdowns & Collapses',
    parentCategory: 'Editorial Section',
    description:
      'Unvarnished post-mortems, forensic insolvency audits, and structural breakdowns of venture-backed failures.',
  },
  'funding-alerts': {
    slug: 'funding-alerts',
    title: 'Funding Alerts & Capital Movement',
    parentCategory: 'Editorial Section',
    description:
      'Verified financing rounds, secondary equity sales, and strategic sovereign capital injections across modern technology.',
  },
  layoffs: {
    slug: 'layoffs',
    title: 'Workforce Reductions & Layoffs',
    parentCategory: 'Editorial Section',
    description:
      'Headcount reduction disclosures, severance patterns, and restructuring alerts across technology startups.',
  },

  // Lessons & Insights
  'top-lists': {
    slug: 'top-lists',
    title: 'Top Lists & Rankings',
    parentCategory: 'Lessons & Insights',
    description:
      'Curated rankings, valuation wipeouts, and retroactive post-mortem comparisons across modern startup history.',
  },
  'lessons-learned': {
    slug: 'lessons-learned',
    title: 'Lessons Learned Playbooks',
    parentCategory: 'Lessons & Insights',
    description:
      'Actionable takeaways, unit economic guardrails, and founder retrospectives synthesized from real liquidation events.',
  },
  'failure-patterns': {
    slug: 'failure-patterns',
    title: 'Failure Patterns & Structural Autopsies',
    parentCategory: 'Lessons & Insights',
    description:
      'Forensic classification playbooks analyzing debt overhang, asset-liability mismatches, and regulatory traps.',
  },
};

export function getCategoryMetadata(slug: string): CategoryMetadata {
  if (CATEGORY_DIRECTORY[slug]) {
    return CATEGORY_DIRECTORY[slug];
  }
  const formattedTitle = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return {
    slug,
    title: formattedTitle,
    parentCategory: 'Archive',
    description: `Articles, reports, and post-mortems categorized under ${formattedTitle}.`,
  };
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'Tech',
    dropdownWidth: 'w-56',
    items: [
      { name: 'AI', description: 'Foundational models & agents', href: '/category/ai' },
      { name: 'E-commerce', description: 'DTC, marketplace & fulfillment', href: '/category/ecommerce' },
      { name: 'SaaS', description: 'Enterprise & vertical software', href: '/category/saas' },
      { name: 'FinTech', description: 'Banking, payments & treasury', href: '/category/fintech' },
    ],
  },
  {
    title: 'Funding Raised',
    dropdownWidth: 'w-48',
    items: [
      { name: 'Under $10M', href: '/category/under-10m' },
      { name: '$10M–$50M', href: '/category/10m-50m' },
      { name: '$50M–$100M', href: '/category/50m-100m' },
      { name: '$100M+ Unicorn', href: '/category/100m-unicorn' },
    ],
  },
  {
    title: 'Funding Type',
    dropdownWidth: 'w-44',
    items: [
      { name: 'Crowdfunded', href: '/category/crowdfunded' },
      { name: 'VC-Backed', href: '/category/vc-backed' },
      { name: 'Bootstrapped', href: '/category/bootstrapped' },
    ],
  },
  {
    title: 'Lessons & Insights',
    dropdownWidth: 'w-52',
    items: [
      {
        name: 'Top Lists',
        description: 'Rankings & post-mortem retros',
        href: '/lessons/top-lists-biggest-collapses-2024',
      },
      {
        name: 'Lessons Learned',
        description: 'Actionable founder takeaways',
        href: '/lessons/12-lessons-from-real-shutdowns',
      },
      {
        name: 'Failure Patterns',
        description: 'Structural autopsy playbooks',
        href: '/lessons/failure-patterns-structural-autopsy',
      },
    ],
  },
];

export const SECONDARY_NAV_ITEMS: SecondaryNavItem[] = [
  {
    label: 'Startup News',
    href: '/category/startup-news',
    icon: 'newspaper',
    iconColorClass: 'text-secondary',
  },
  {
    label: 'Shutdowns & Collapses',
    href: '/category/shutdowns-collapses',
    icon: 'domain_disabled',
    iconColorClass: 'text-primary-container',
  },
  {
    label: 'Funding Alerts',
    href: '/category/funding-alerts',
    icon: 'monetization_on',
    iconColorClass: 'text-tertiary',
  },
  {
    label: 'Layoffs',
    href: '/category/layoffs',
    icon: 'group_remove',
    iconColorClass: 'text-error',
  },
];


