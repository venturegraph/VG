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
