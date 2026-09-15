import {
  Post,
  NavCategory,
  SecondaryNavItem,
  CaseStudyArticle,
  NewsArticle,
  HubArticle,
  CategoryMetadata,
  TrendingPost,
} from '@/types';

export type { TrendingPost };

export const HERO_STORY: Post = {
  id: 'skybound-failure',
  title: 'SkyBound Failure: How a $175M Drone Delivery Startup Collapsed in 2024',
  slug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
  type: 'failure',
  category: 'Hardware & Autonomous Logistics',
  tag: 'Failure Case Study',
  publishDate: 'October 24, 2024',
  readTime: '14 min read',
  excerpt:
    'High hardware burn, prohibitive per-delivery unit economics, and delayed airspace approvals led to the quiet wind-down of one of autonomous logistics\' most funded bets.',
  image:
    'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
  author: {
    name: 'Marcus Vance',
    role: 'Head of Research, Venture Graph',
  },
  techCategory: 'ecommerce',
  fundingRange: '100m-unicorn',
  fundingTypeCategory: 'vc-backed',
  stats: {
    totalRaised: '$175 Million',
    foundedYear: '2018',
    shutdownYear: '2024',
    hqCountry: 'San Francisco, CA, USA',
    failureReason: 'Unit Economic Inversion & Delayed FAA Airspace Approvals',
    peakValuation: '$650 Million',
    keyInvestors: ['Foundry Horizons', 'Apex Mobility Ventures', 'Sequoia Capital'],
  },
};

export const CASE_STUDIES_DATA: Record<string, CaseStudyArticle> = {
  'skybound-failure-how-a-175m-drone-delivery-startup-collapsed': {
    ...HERO_STORY,
    subtitle:
      'High hardware burn, prohibitive per-delivery unit economics, and delayed airspace approvals led to the quiet wind-down of one of autonomous logistics\' most funded bets.',
    stats: {
      totalRaised: '$175 Million',
      foundedYear: '2018',
      shutdownYear: '2024',
      hqCountry: 'San Francisco, CA, USA',
      failureReason: 'Unit Economic Inversion & Delayed FAA Airspace Approvals',
      peakValuation: '$650 Million',
      keyInvestors: ['Foundry Horizons', 'Apex Mobility Ventures', 'Sequoia Capital'],
    },
    content: {
      introduction: [
        'When SkyBound announced its $95M Series B in mid-2021, the company was hailed as the future of suburban last-mile logistics. Pitch decks promised 15-minute delivery times for lightweight pharmacy supplies and gourmet coffee at a marginal cost cheaper than an Uber Eats courier.',
        'By August 2024, the company had laid off its remaining 42 engineers, initiated assignment for the benefit of creditors (ABC), and sold off its custom airframe patents for cents on the dollar. How did a company backed by tier-one venture capital and staffed by ex-NASA aerospace veterans fail to survive?',
      ],
      sections: [
        {
          heading: '1. The Unit Economics Trap: The Illusion of Low-Cost Air Freight',
          subheading: 'Why $4.50 per delivery turned out to actually cost $68.00 in the field',
          paragraphs: [
            'SkyBound\'s initial financial model assumed that a single ground operator could simultaneously supervise 20 autonomous drones in flight, reducing remote operator labor to less than $1.20 per delivery. Furthermore, drone airframes were depreciated across a projected 3,000 flight-hour lifecycle.',
            'In reality, FAA Part 135 regulatory mandates required dedicated one-to-one visual observers for Beyond Visual Line of Sight (BVLOS) operations in suburban test corridors. Instead of one technician overseeing an entire regional fleet, SkyBound had to maintain two certified ground crew members at every regional hub and field launch site.',
            'Battery degradation accelerated in cold-weather and humid environments, reducing battery pack life from 800 cycles down to 180 cycles. When accounting for scheduled maintenance, propeller replacements, and mandatory pilot standby compensation, SkyBound was losing roughly $63.50 on every single completed delivery.',
          ],
          callout: {
            category: 'Lessons & Insights',
            title: 'The Dangerous Seduction of Theoretical Unit Economics',
            description:
              'Why venture-backed hardware models that depend on regulatory deregulation almost always underestimate required working capital by 3x to 5x.',
            href: '/lessons/12-lessons-from-real-shutdowns',
          },
        },
        {
          heading: '2. The Regulatory Quagmire: BVLOS Waivers That Never Arrived',
          subheading: 'Commercial scaling throttled by slow municipal and federal certifications',
          paragraphs: [
            'SkyBound banked heavily on federal regulatory milestones accelerating between 2022 and 2024. However, commercial drone airspace integration stalled amid heightened FAA caution surrounding acoustic disturbance complaints and GPS spoofing risks near civilian municipal aerodromes.',
            'While enterprise retail partners signed letters of intent (LOIs) across three states, SkyBound was restricted to geofenced agricultural corridors and sparsely populated suburban pockets. The company was burning $3.2M a month maintaining flight ops centers that were legally prohibited from carrying paying cargo at scale.',
          ],
        },
        {
          heading: '3. The Down-Round Liquidation Preference Spiral',
          subheading: 'How structured 2x participating preferred terms eliminated common equity upside',
          paragraphs: [
            'When macro venture markets contracted in late 2022, SkyBound attempted to raise an emergency bridge round. To secure $25M in structured financing, management agreed to 2x senior participating liquidation preferences with full ratchet anti-dilution protections.',
            'By early 2024, the liquidation preference stack exceeded $190M. When a strategic defense contractor tabled an acquisition offer of $110M in June 2024, the founders and rank-and-file employees discovered that zero proceeds would trickle down to common shareholders. With key engineering talent resigning en masse within weeks, the strategic buyer walked away, triggering immediate liquidation.',
          ],
          callout: {
            category: 'Lessons & Insights',
            title: 'Understanding Senior Liquidation Preferences in Down-Rounds',
            description:
              'How aggressive cap-table terms turn salvageable acquisitions into complete write-offs when the waterfall leaves teams empty-handed.',
            href: '/lessons/12-lessons-from-real-shutdowns',
          },
        },
        {
          heading: '4. Key Takeaways for Founders & Hardware Operators',
          paragraphs: [
            'Never build commercial milestone timelines around bureaucratic regulatory approvals that you cannot directly influence or expedite.',
            'Stress-test your unit economics at 1:1 supervision ratios rather than theoretical 1:20 autonomous scale.',
            'Beware of structured capital terms that disincentivize key engineering teams from supporting sub-$200M exits.',
          ],
        },
      ],
    },
  },
  'omnipay-failure-how-92m-collapsed': {
    id: 'omnipay-failure',
    title: 'OmniPay Failure: How $92M Collapsed in 2024',
    slug: 'omnipay-failure-how-92m-collapsed',
    type: 'failure',
    category: 'FinTech / Banking',
    tag: 'FinTech / Banking',
    publishDate: 'Oct 2024',
    readTime: '9 min read',
    excerpt:
      'How undisclosed treasury yield mismatched assets triggered rapid customer withdrawals, forcing an emergency liquidation when bridge terms dissolved.',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Elena Rostova',
      role: 'FinTech Editor, Venture Graph',
    },
    subtitle:
      'How undisclosed treasury yield mismatched assets triggered rapid customer withdrawals, forcing an emergency liquidation when bridge terms dissolved.',
    stats: {
      totalRaised: '$92 Million',
      foundedYear: '2020',
      shutdownYear: '2024',
      hqCountry: 'New York, NY, USA',
      failureReason: 'Asset-Liability Duration Mismatch & Neo-Bank Run',
      peakValuation: '$410 Million',
      keyInvestors: ['Vanguard Horizon', 'FinTech Collective', 'Global Seed Capital'],
    },
    content: {
      introduction: [
        'OmniPay positioned itself as the premium treasury management platform for venture-backed startups, promising 5.4% automated yields on corporate deposits with zero lock-in.',
        'Within 72 hours in September 2024, over $380M in customer deposits were requested for transfer after leaks revealed the company had parked liquidity in illiquid short-duration private credit vehicles.',
      ],
      sections: [
        {
          heading: '1. The Yield Trap: Chasing Spreads in a Higher-for-Longer Environment',
          paragraphs: [
            'To out-compete established custodial players, OmniPay subsidized yields by originating short-term venture debt notes. When several debt borrowers defaulted, the underlying assets could not be converted to cash at par.',
            'As soon as a prominent CFO flagged delayed redemption wires on Twitter/X, panic spread through the YC and mid-market SaaS community, draining OmniPay\'s liquid reserves within hours.',
          ],
        },
      ],
    },
  },
  'why-pulsebio-failed-blood-analytics': {
    id: 'pulsebio-failure',
    title: 'Why PulseBio Failed: Inside the $90M Blood Analytics Platform That Collapsed in 2024',
    slug: 'why-pulsebio-failed-blood-analytics',
    type: 'failure',
    category: 'HealthTech / Diagnostics',
    tag: 'HealthTech / Diagnostics',
    publishDate: 'Oct 2024',
    readTime: '12 min read',
    excerpt:
      'Severe prototype sensor calibration issues combined with delayed clinical trial approvals depleted cash balances before secondary financing could close.',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Dr. Julian Thorne',
      role: 'BioTech Contributor',
    },
    subtitle:
      'Severe prototype sensor calibration issues combined with delayed clinical trial approvals depleted cash balances before secondary financing could close.',
    stats: {
      totalRaised: '$90 Million',
      foundedYear: '2019',
      shutdownYear: '2024',
      hqCountry: 'Boston, MA, USA',
      failureReason: 'Microfluidic Sensor Calibration Drift & Depleted Trial Reserves',
      peakValuation: '$350 Million',
      keyInvestors: ['LifeSciences Capital', 'Vertex BioVentures'],
    },
    content: {
      introduction: [
        'PulseBio raised $90M on the bold premise of single-drop multi-biomarker cancer screening using nanoscale photonic chips.',
        'However, when clinical trial data failed to replicate benchtop sensitivity metrics, the platform could not pass FDA Phase 2 validation.',
      ],
      sections: [],
    },
  },
  'why-crafthive-failed-logistics': {
    id: 'crafthive-failure',
    title: 'Why CraftHive Failed: How an E-Commerce Logistics Platform Burned $45M Before Liquidation',
    slug: 'why-crafthive-failed-logistics',
    type: 'failure',
    category: 'E-Commerce / Logistics',
    tag: 'E-Commerce / Logistics',
    publishDate: 'Oct 2024',
    readTime: '8 min read',
    excerpt:
      'Transitioning from a pure platform fee model into proprietary warehousing and fulfillment strained operating margins to unsustainable levels.',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Marcus Vance',
      role: 'Head of Research, Venture Graph',
    },
    subtitle:
      'Transitioning from a pure platform fee model into proprietary warehousing and fulfillment strained operating margins to unsustainable levels.',
    stats: {
      totalRaised: '$45 Million',
      foundedYear: '2021',
      shutdownYear: '2024',
      hqCountry: 'Austin, TX, USA',
      failureReason: 'Asset-Heavy Warehouse Expansion & Commercial Lease Liabilities',
      peakValuation: '$180 Million',
      keyInvestors: ['Retail Ventures', 'Prairie Capital'],
    },
    content: {
      introduction: [
        'CraftHive was initially a capital-efficient software tool linking boutique craft makers directly to nationwide couriers.',
      ],
      sections: [],
    },
  },
  'hyperscale-ai-failure-cloud-infrastructure': {
    id: 'hyperscale-ai-failure',
    title: 'HyperScale AI Failure: How $140M in Cloud Infrastructure Evaporated in 2024',
    slug: 'hyperscale-ai-failure-cloud-infrastructure',
    type: 'failure',
    category: 'AI / Cloud',
    tag: 'AI / Cloud',
    publishDate: 'Oct 2024',
    readTime: '11 min read',
    excerpt:
      'Long-term compute lease commitments clashed with lower-than-anticipated enterprise inferencing demand, forcing a distressed shutdown.',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Sarah Chen',
      role: 'AI Infrastructure Analyst',
    },
    subtitle:
      'Long-term compute lease commitments clashed with lower-than-anticipated enterprise inferencing demand, forcing a distressed shutdown.',
    stats: {
      totalRaised: '$140 Million',
      foundedYear: '2022',
      shutdownYear: '2024',
      hqCountry: 'Seattle, WA, USA',
      failureReason: 'Long-Term Take-or-Pay GPU Leases & Inferencing Margin Compression',
      peakValuation: '$550 Million',
      keyInvestors: ['Matrix Cloud Ventures', 'Compute Capital'],
    },
    content: {
      introduction: [
        'At the height of the 2023 GPU gold rush, HyperScale AI committed to $120M in multi-year take-or-pay cloud cluster leases.',
      ],
      sections: [],
    },
  },
};

export const NEW_FUNDINGS: Post[] = [
  {
    id: 'anthropic-4b',
    title: 'Anthropic Secures Additional $4B Commitment from Amazon for AI Infrastructure',
    slug: 'anthropic-secures-additional-4b-commitment-amazon',
    type: 'funding',
    category: 'AI • Funding Alerts',
    publishDate: 'Oct 23, 2024',
    readTime: '4 min read',
    excerpt: 'Expands compute access across custom silicon chips with AWS named primary cloud provider.',
    amount: '$4.0 Billion',
    capitalType: 'Strategic Capital',
    round: 'Series D Strategic',
    techCategory: 'ai',
    fundingRange: '100m-unicorn',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'coreweave-650m',
    title: 'CoreWeave Secures $650M Secondary Share Sale at $23B Valuation',
    slug: 'coreweave-secures-650m-secondary-share-sale',
    type: 'funding',
    category: 'Cloud & AI • Funding News',
    publishDate: 'Oct 21, 2024',
    readTime: '3 min read',
    excerpt: 'Led by major institutional asset managers ahead of potential public listing in early 2025.',
    amount: '$650 Million',
    capitalType: 'Secondary Sale',
    round: 'Secondary Tender',
    techCategory: 'ai',
    fundingRange: '100m-unicorn',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'physical-intelligence-400m',
    title: 'Physical Intelligence Raises $400M Seed to Series A at $2.4B Valuation',
    slug: 'physical-intelligence-raises-400m-seed-series-a',
    type: 'funding',
    category: 'Robotics • Seed to Growth',
    publishDate: 'Oct 19, 2024',
    readTime: '5 min read',
    excerpt: 'Developing foundation models for general-purpose robotic autonomy and dexterous manipulation.',
    amount: '$400 Million',
    capitalType: 'Series A',
    round: 'Series A',
    techCategory: 'ai',
    fundingRange: '100m-unicorn',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'supabase-80m',
    title: 'Supabase Closes $80M Series C to Expand Open Source Postgres Platform',
    slug: 'supabase-closes-80m-series-c',
    type: 'funding',
    category: 'Developer Tools • Series C',
    publishDate: 'Oct 16, 2024',
    readTime: '4 min read',
    excerpt: 'Funding allocated to enterprise database features, compliance tooling, and multi-cloud availability.',
    amount: '$80 Million',
    capitalType: 'Series C',
    round: 'Series C',
    techCategory: 'saas',
    fundingRange: '50m-100m',
    fundingTypeCategory: 'vc-backed',
  },
];

export const RECENT_FAILURES: Post[] = [
  {
    id: 'omnipay-failure',
    title: 'OmniPay Failure: How $92M Collapsed in 2024',
    slug: 'omnipay-failure-how-92m-collapsed',
    type: 'failure',
    category: 'FinTech / Banking',
    publishDate: 'Oct 2024',
    readTime: '9 min read',
    excerpt:
      'How undisclosed treasury yield mismatched assets triggered rapid customer withdrawals, forcing an emergency liquidation when bridge terms dissolved.',
    techCategory: 'fintech',
    fundingRange: '50m-100m',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'pulsebio-failure',
    title: 'Why PulseBio Failed: Inside the $90M Blood Analytics Platform That Collapsed in 2024',
    slug: 'why-pulsebio-failed-blood-analytics',
    type: 'failure',
    category: 'HealthTech / Diagnostics',
    publishDate: 'Oct 2024',
    readTime: '12 min read',
    excerpt:
      'Severe prototype sensor calibration issues combined with delayed clinical trial approvals depleted cash balances before secondary financing could close.',
    fundingRange: '50m-100m',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'crafthive-failure',
    title: 'Why CraftHive Failed: How an E-Commerce Logistics Platform Burned $45M Before Liquidation',
    slug: 'why-crafthive-failed-logistics',
    type: 'failure',
    category: 'E-Commerce / Logistics',
    publishDate: 'Oct 2024',
    readTime: '8 min read',
    excerpt:
      'Transitioning from a pure platform fee model into proprietary warehousing and fulfillment strained operating margins to unsustainable levels.',
    techCategory: 'ecommerce',
    fundingRange: '10m-50m',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'hyperscale-ai-failure',
    title: 'HyperScale AI Failure: How $140M in Cloud Infrastructure Evaporated in 2024',
    slug: 'hyperscale-ai-failure-cloud-infrastructure',
    type: 'failure',
    category: 'AI / Cloud',
    publishDate: 'Oct 2024',
    readTime: '11 min read',
    excerpt:
      'Long-term compute lease commitments clashed with lower-than-anticipated enterprise inferencing demand, forcing a distressed shutdown.',
    techCategory: 'ai',
    fundingRange: '100m-unicorn',
    fundingTypeCategory: 'vc-backed',
  },
];

export const LATEST_POSTS: Post[] = [
  {
    id: 'metrix-layoffs',
    title: 'B2B SaaS Provider Metrix Restructures Operations and Consolidates Austin Hub',
    slug: 'metrix-restructures-operations',
    type: 'layoff',
    category: 'Layoffs',
    publishDate: '2 hours ago',
    readTime: '4 min read',
    excerpt:
      'The enterprise workflow platform reduced workforce headcount across sales and administrative functions following a strategic review of enterprise renewals.',
    techCategory: 'saas',
    fundingRange: '10m-50m',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'wayshift-shutdown',
    title: 'Autonomous Freight Pilot WayShift Wounds Down Autonomous Long-Haul Division',
    slug: 'wayshift-wounds-down-autonomous-long-haul',
    type: 'failure',
    category: 'Shutdown Case Study',
    publishDate: '5 hours ago',
    readTime: '7 min read',
    excerpt:
      'A look into how prolonged hardware validation cycles and shifting commercial interest toward regional routing impacted the autonomous tractor-trailer pilot.',
    relatedCaseStudySlug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
    techCategory: 'ecommerce',
    fundingRange: '50m-100m',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'vaultsecure-funding',
    title: 'Security Protocol VaultSecure Extends Growth Line Ahead of European Expansion',
    slug: 'vaultsecure-extends-growth-line',
    type: 'funding',
    category: 'Funding News',
    publishDate: 'Yesterday',
    readTime: '3 min read',
    excerpt:
      'The digital custodial infrastructure startup secured structured convertible financing to satisfy European regulatory licensing criteria.',
    amount: '$35 Million',
    capitalType: 'Convertible Debt',
    round: 'Growth Line',
    techCategory: 'fintech',
    fundingRange: '10m-50m',
    fundingTypeCategory: 'vc-backed',
  },
  {
    id: 'multi-region-costs',
    title: 'The Hidden Costs of Premature Multi-Region Infrastructure Deployment',
    slug: 'hidden-costs-premature-multi-region',
    type: 'lessons',
    category: 'Founder Lessons',
    publishDate: '2 days ago',
    readTime: '6 min read',
    excerpt:
      'An analysis of five mid-stage SaaS companies that expanded server tenancy before reaching sustainable account density in core domestic markets.',
    techCategory: 'saas',
    fundingRange: 'under-10m',
    fundingTypeCategory: 'bootstrapped',
  },
  {
    id: 'formworks-shutdown',
    title: 'Direct-to-Consumer Furniture Maker FormWorks Ceases Direct Production',
    slug: 'formworks-ceases-direct-production',
    type: 'failure',
    category: 'Case Study',
    publishDate: '3 days ago',
    readTime: '5 min read',
    excerpt:
      'Examining how international freight rate spikes and long lead-time inventory cycles disrupted cash reserves during domestic supply chain contractions.',
    techCategory: 'ecommerce',
    fundingRange: '10m-50m',
    fundingTypeCategory: 'bootstrapped',
  },
];

export const ALL_POSTS_ARCHIVE: Post[] = [
  HERO_STORY,
  ...NEW_FUNDINGS,
  ...RECENT_FAILURES,
  ...LATEST_POSTS,
];

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

export function getCategoryData(slug: string): { metadata: CategoryMetadata; posts: Post[] } | null {
  const metadata = CATEGORY_DIRECTORY[slug];
  if (!metadata) return null;

  // Filter posts matching this category
  let matchedPosts = ALL_POSTS_ARCHIVE.filter((post) => {
    switch (slug) {
      // Tech categories
      case 'ai':
        return post.techCategory === 'ai' || post.category.toLowerCase().includes('ai');
      case 'ecommerce':
        return post.techCategory === 'ecommerce' || post.category.toLowerCase().includes('commerce') || post.category.toLowerCase().includes('logistics');
      case 'saas':
        return post.techCategory === 'saas' || post.category.toLowerCase().includes('saas') || post.category.toLowerCase().includes('developer');
      case 'fintech':
        return post.techCategory === 'fintech' || post.category.toLowerCase().includes('fintech') || post.category.toLowerCase().includes('banking');

      // Funding Raised ranges
      case 'under-10m':
        return post.fundingRange === 'under-10m';
      case '10m-50m':
        return post.fundingRange === '10m-50m';
      case '50m-100m':
        return post.fundingRange === '50m-100m';
      case '100m-unicorn':
        return post.fundingRange === '100m-unicorn';

      // Funding Types
      case 'vc-backed':
        return post.fundingTypeCategory === 'vc-backed' || !post.fundingTypeCategory;
      case 'bootstrapped':
        return post.fundingTypeCategory === 'bootstrapped';
      case 'crowdfunded':
        return post.fundingTypeCategory === 'crowdfunded';

      // Standalone Editorial Sections
      case 'startup-news':
        return post.type === 'news' || post.type === 'funding' || post.type === 'layoff';
      case 'shutdowns-collapses':
        return post.type === 'failure';
      case 'funding-alerts':
        return post.type === 'funding';
      case 'layoffs':
        return post.type === 'layoff';

      // Lessons & Insights
      case 'top-lists':
      case 'lessons-learned':
      case 'failure-patterns':
        return post.type === 'lessons' || post.type === 'failure';

      default:
        return false;
    }
  });

  // If matchedPosts is empty, provide relevant fallback items from archive so category pages are populated
  if (matchedPosts.length === 0) {
    matchedPosts = ALL_POSTS_ARCHIVE.slice(0, 4);
  }

  return { metadata, posts: matchedPosts };
}

export function getCaseStudyBySlug(slug: string): CaseStudyArticle | null {
  if (CASE_STUDIES_DATA[slug]) {
    return CASE_STUDIES_DATA[slug];
  }
  const found = Object.values(CASE_STUDIES_DATA).find(
    (item) => item.slug === slug || item.id === slug
  );
  return found || null;
}

export function getRelatedCaseStudies(currentSlug: string, count: number = 4): Post[] {
  const allFailures = [HERO_STORY, ...RECENT_FAILURES];
  return allFailures.filter((item) => item.slug !== currentSlug).slice(0, count);
}

export const NEWS_ARTICLES_DATA: Record<string, NewsArticle> = {
  'anthropic-secures-additional-4b-commitment-amazon': {
    id: 'anthropic-4b',
    title: 'Anthropic Secures Additional $4B Commitment from Amazon for AI Infrastructure',
    slug: 'anthropic-secures-additional-4b-commitment-amazon',
    type: 'funding',
    category: 'AI • Funding Alerts',
    publishDate: 'Oct 23, 2024',
    timestamp: 'Wednesday, October 23, 2024 • 10:45 AM EDT',
    updatedTime: 'Updated 2 hours ago',
    readTime: '4 min read',
    excerpt:
      'Expands compute access across custom silicon chips with AWS named primary cloud provider in a multi-year infrastructure expansion.',
    amount: '$4.0 Billion',
    capitalType: 'Strategic Capital',
    round: 'Series D Strategic',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Sarah Chen',
      role: 'Venture Graph AI & Compute Desk',
    },
    metrics: {
      amount: '$4.0 Billion',
      capitalType: 'Strategic Capital',
      round: 'Series D Strategic Extension',
      valuation: '$18.4 Billion Post-Money',
      leadInvestors: ['Amazon Web Services (AWS)', 'Amazon Corporate Investment'],
      keyPartners: 'AWS Annapurna Labs (Trainium 2 & Inferentia 2)',
    },
    content: {
      summary:
        'Amazon has doubled down on generative AI foundation model leader Anthropic with an incremental $4 billion capital and compute commitment, bringing its aggregate stake to $8 billion and securing exclusive custom silicon training pipelines.',
      body: [
        'Amazon Web Services confirmed early Wednesday morning that it has deepened its strategic collaboration with Anthropic through an additional $4 billion minority investment structured as convertible equity with compute access tranches.',
        'Under the terms of the expanded agreement, Anthropic will designate AWS as its primary cloud training and inferencing provider, prioritizing next-generation Trainium2 accelerator clusters for frontier model pre-training.',
        'The massive capital injection comes amid a fierce compute-acquisition race between hyperscalers. Anthropic plans to deploy the capital toward scaling its Claude 3.5 Sonnet and Opus model architectures.',
      ],
      keyTerms: [
        { label: 'Primary Cloud Provider', value: 'Amazon Web Services (AWS)' },
        { label: 'Compute Allocation', value: 'Trainium2 & Inferentia2 Priority Clusters' },
        { label: 'Governance & Board', value: 'Non-voting observer seat; independent governance retained' },
        { label: 'Enterprise Distribution', value: 'Enhanced API access on AWS Bedrock' },
      ],
      quote: {
        text: 'Our deep collaboration with Amazon allows us to push the boundaries of frontier AI safety and capability on world-class silicon architectures at massive planetary scale.',
        author: 'Dario Amodei',
        role: 'CEO & Co-founder, Anthropic',
      },
    },
  },
  'coreweave-secures-650m-secondary-share-sale': {
    id: 'coreweave-650m',
    title: 'CoreWeave Secures $650M Secondary Share Sale at $23B Valuation',
    slug: 'coreweave-secures-650m-secondary-share-sale',
    type: 'funding',
    category: 'Cloud & AI • Funding News',
    publishDate: 'Oct 21, 2024',
    timestamp: 'Monday, October 21, 2024 • 02:15 PM EDT',
    readTime: '3 min read',
    excerpt:
      'Led by major institutional asset managers ahead of potential public listing in early 2025, providing early liquidity to staff and seed angels.',
    amount: '$650 Million',
    capitalType: 'Secondary Sale',
    round: 'Secondary Tender',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Marcus Vance',
      role: 'Head of Research, Venture Graph',
    },
    metrics: {
      amount: '$650 Million',
      capitalType: 'Secondary Share Tender',
      round: 'Late Stage Growth Liquidity',
      valuation: '$23.0 Billion',
      leadInvestors: ['Fidelity Management & Research', 'Jane Street Capital', 'JPMorgan Chase'],
      keyPartners: 'NVIDIA Elite Cloud Partner',
    },
    content: {
      summary:
        'Specialized GPU cloud provider CoreWeave has completed a $650 million secondary share tender at a $23 billion valuation, granting early employees and angel investors liquidity ahead of a widely anticipated early 2025 IPO.',
      body: [
        'CoreWeave valuation has skyrocketed from $7 billion in late 2023 to $23 billion today, fueled by insatiable enterprise appetite for dedicated NVIDIA H100 and upcoming Blackwell B200 infrastructure clusters.',
      ],
    },
  },
  'physical-intelligence-raises-400m-seed-series-a': {
    id: 'physical-intelligence-400m',
    title: 'Physical Intelligence Raises $400M Seed to Series A at $2.4B Valuation',
    slug: 'physical-intelligence-raises-400m-seed-series-a',
    type: 'funding',
    category: 'Robotics • Seed to Growth',
    publishDate: 'Oct 19, 2024',
    timestamp: 'Saturday, October 19, 2024 • 09:30 AM EDT',
    readTime: '5 min read',
    excerpt:
      'Developing foundation models for general-purpose robotic autonomy and dexterous manipulation with backing from top tech luminaries.',
    amount: '$400 Million',
    capitalType: 'Series A',
    round: 'Series A',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Sarah Chen',
      role: 'Venture Graph AI & Compute Desk',
    },
    metrics: {
      amount: '$400 Million',
      capitalType: 'Early Stage Growth',
      round: 'Combined Seed & Series A',
      valuation: '$2.4 Billion Post-Money',
      leadInvestors: ['Jeff Bezos', 'Lux Capital', 'Thrive Capital', 'OpenAI'],
    },
    content: {
      summary:
        'San Francisco-based Physical Intelligence has emerged from stealth with $400 million in combined Seed and Series A funding at a $2.4 billion post-money valuation.',
      body: [
        'Rather than developing bespoke proprietary robot hardware, Physical Intelligence is training general-purpose foundational policies that can be ported across arbitrary robotic platforms.',
      ],
    },
  },
  'supabase-closes-80m-series-c': {
    id: 'supabase-80m',
    title: 'Supabase Closes $80M Series C to Expand Open Source Postgres Platform',
    slug: 'supabase-closes-80m-series-c',
    type: 'funding',
    category: 'Developer Tools • Series C',
    publishDate: 'Oct 16, 2024',
    timestamp: 'Wednesday, October 16, 2024 • 11:00 AM EDT',
    readTime: '4 min read',
    excerpt:
      'Funding allocated to enterprise database features, compliance tooling, and multi-cloud availability across AWS, GCP, and Azure.',
    amount: '$80 Million',
    capitalType: 'Series C',
    round: 'Series C',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Elena Rostova',
      role: 'Staff Reporter',
    },
    metrics: {
      amount: '$80 Million',
      capitalType: 'Growth Equity',
      round: 'Series C',
      valuation: '$1.1 Billion',
      leadInvestors: ['Peak XV Partners', 'Craft Ventures', 'Felicis'],
    },
    content: {
      summary:
        'Open-source Firebase alternative Supabase has secured an $80 million Series C financing round to deepen its enterprise compliance features.',
      body: [
        'The developer tooling platform now manages more than 1.5 million active Postgres databases, with annual recurring revenue expanding 3.5x over the past 14 months.',
      ],
    },
  },
  'wayshift-wounds-down-autonomous-long-haul': {
    id: 'wayshift-shutdown',
    title: 'Autonomous Freight Pilot WayShift Wounds Down Autonomous Long-Haul Division',
    slug: 'wayshift-wounds-down-autonomous-long-haul',
    type: 'failure',
    category: 'Shutdown Case Study',
    publishDate: '5 hours ago',
    timestamp: 'Today at 08:15 AM EDT • Verified Dispatch',
    updatedTime: 'Breaking News',
    readTime: '3 min read',
    excerpt:
      'A look into how prolonged hardware validation cycles and shifting commercial interest toward regional routing impacted the autonomous tractor-trailer pilot.',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Marcus Vance',
      role: 'Head of Research, Venture Graph',
    },
    relatedCaseStudySlug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
    content: {
      summary:
        'Autonomous long-haul trucking pilot WayShift announced this morning that it will discontinue its Class 8 tractor-trailer operations across the Sunbelt freight corridor, laying off 85 employees.',
      body: [
        'The Dallas-based company, which had raised $62 million since its 2021 inception, cited extended hardware validation cycles, skyrocketing liability insurance premiums, and freight spot rates hovering near multi-year lows.',
      ],
    },
  },
  'metrix-restructures-operations': {
    id: 'metrix-layoffs',
    title: 'B2B SaaS Provider Metrix Restructures Operations and Consolidates Austin Hub',
    slug: 'metrix-restructures-operations',
    type: 'layoff',
    category: 'Layoffs',
    publishDate: '2 hours ago',
    timestamp: 'Today at 11:30 AM EDT • Verified Dispatch',
    updatedTime: 'Breaking News',
    readTime: '3 min read',
    excerpt:
      'The enterprise workflow platform reduced workforce headcount across sales and administrative functions following a strategic review of enterprise renewals.',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Elena Rostova',
      role: 'Staff Reporter',
    },
    content: {
      summary:
        'Enterprise workflow automation provider Metrix has eliminated 18% of its workforce, primarily impacting North American inside sales and recruiting teams.',
      body: [
        'CEO Jason Sterling informed staff in an all-hands memo that enterprise contract expansion cycles lengthened from 45 days to over 110 days in the second half of 2024.',
      ],
    },
  },
  'vaultsecure-extends-growth-line': {
    id: 'vaultsecure-funding',
    title: 'Security Protocol VaultSecure Extends Growth Line Ahead of European Expansion',
    slug: 'vaultsecure-extends-growth-line',
    type: 'funding',
    category: 'Funding News',
    publishDate: 'Yesterday',
    timestamp: 'Tuesday, October 22, 2024 • 04:00 PM EDT',
    readTime: '3 min read',
    excerpt:
      'The digital custodial infrastructure startup secured structured convertible financing to satisfy European regulatory licensing criteria.',
    amount: '$35 Million',
    capitalType: 'Convertible Debt',
    round: 'Growth Line',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xywr2xdhsDhqd3cEB1MTGEB6oyRB0V99-CiMrgIRqPJZ_2wmSHkoqtM3Fx78NcQVWLuAqGASHjl79w3B0Oq5HraL_OQ7Q0JqIOfUL38o66oTF03PS1Eh7T5PxqPWpeaPc03mz8j4Kx5WebIAuKpJDpVu8bndSLuC6GxG27CdAF-5NRZ58mPrso5op3PzstnY12xjvlEwWJZpnd-QRIVr4QXPoP8Tx5Gqk39GjIaX1_t1DF3SRfhLzyppgR',
    author: {
      name: 'Elena Rostova',
      role: 'FinTech Editor, Venture Graph',
    },
    metrics: {
      amount: '$35 Million',
      capitalType: 'Convertible Growth Note',
      round: 'Growth Extension',
      leadInvestors: ['Nordic Horizon Partners', 'CyberSec Ventures'],
    },
    content: {
      summary:
        'Custodial key management infrastructure firm VaultSecure has secured a $35 million convertible growth note to satisfy capital adequacy reserves mandated under the EU\'s upcoming MiCA regulatory framework.',
      body: [
        'The funds will be held in designated escrow while the company finalizes its licensing submissions with the European Securities and Markets Authority (ESMA).',
      ],
    },
  },
};

export const HUB_ARTICLES_DATA: Record<string, HubArticle> = {
  '12-lessons-from-real-shutdowns': {
    id: '12-lessons-from-real-shutdowns',
    title: '12 Hard Lessons from Real Startup Shutdowns in 2024',
    slug: '12-lessons-from-real-shutdowns',
    category: 'Lessons Learned',
    subtitle:
      'An exhaustive breakdown of the recurring operational, financial, and strategic blind spots that vaporized over $540M in venture capital this year.',
    publishDate: 'October 24, 2024',
    readTime: '18 min read',
    author: {
      name: 'Marcus Vance',
      role: 'Head of Research, Venture Graph',
    },
    introduction: [
      'Every startup post-mortem tells a seemingly unique tragedy of bad timing, regulatory hurdles, or sudden market shifts. But across 40+ liquidations analyzed in 2024 by the Venture Graph research team, the underlying mechanics of failure are remarkably consistent.',
      'Below are 12 unvarnished lessons synthesized directly from court dockets, Delaware insolvency filings, and candid interviews with founders whose companies were forced into assignment for the benefit of creditors.',
    ],
    lessons: [
      {
        number: '01',
        id: 'lesson-unit-economics-supervision',
        title: 'Theoretical Unit Economics Always Invert Under Real-World Supervision Ratios',
        thesis:
          'Automation models that assume 1:20 human-to-machine supervision almost always collapse to 1:1 or 2:1 when live compliance and field edge cases hit.',
        paragraphs: [
          'Venture models frequently reward founders who present spreadsheet economics assuming frictionless autonomous operations.',
          'In reality, physical world edge cases and safety oversight require redundant staff on site, turning projected gross margins negative.',
        ],
        takeaway:
          'Rule: Never raise growth capital based on automated margins until your fleet has operated for 90 days at sub-1:2 human intervention rates.',
        relatedCaseStudySlug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
      },
      {
        number: '02',
        id: 'lesson-treasury-duration-mismatch',
        title: 'Chasing Yield on Corporate Deposits is a Hidden Insolvency Lever',
        thesis:
          'In a high-rate environment, offering above-benchmark yield by investing deposits in illiquid credit creates fatal bank-run vulnerability.',
        paragraphs: [
          'Neo-banks and modern treasury platforms competed aggressively on headline APY, subsidizing spreads by originating private venture debt.',
          'When commercial liquidity tightened and counterparties delayed wires, depositors panicked, causing rapid liquidity exhaustion.',
        ],
        takeaway:
          'Rule: Segregate operating cash strictly in bankruptcy-remote FDIC sweeps; never monetize customer float without 100% reserve backing.',
        relatedCaseStudySlug: 'omnipay-failure-how-92m-collapsed',
      },
      {
        number: '03',
        id: 'lesson-physical-moat-delusion',
        title: 'Building a Physical "Moat" Usually Just Creates an Anchor of Fixed Overhead',
        thesis:
          'Transitioning a high-margin software marketplace into proprietary warehousing or hardware manufacturing crushes capital efficiency.',
        paragraphs: [
          'Software marketplaces that experience take-rate compression often convince themselves that owning fulfillment will unlock pricing power.',
          'Instead, fixed lease liabilities and warehouse equipment depreciation quickly overwhelm platform commissions.',
        ],
        takeaway:
          'Rule: If your software model does not possess network effects, physical asset accumulation will multiply your burn rather than solve your churn.',
        relatedCaseStudySlug: 'why-crafthive-failed-logistics',
      },
      {
        number: '04',
        id: 'lesson-take-or-pay-cloud-leases',
        title: 'Take-or-Pay Compute Contracts Are Structural Debt in Disguise',
        thesis:
          'Long-term GPU cluster lease commitments with monthly take-or-pay terms become fatal when model optimizations compress inferencing compute needs.',
        paragraphs: [
          'During the 2023 infrastructure crunch, startups signed multi-year compute reservations at peak rates.',
          'As open-weight models optimized memory footprints, market GPU rates dropped by more than 50%, leaving companies trapped in rigid contracts.',
        ],
        takeaway:
          'Rule: Treat multi-year cloud commitments as senior secured debt on your financial balance sheet.',
        relatedCaseStudySlug: 'hyperscale-ai-failure-cloud-infrastructure',
      },
      {
        number: '05',
        id: 'lesson-benchtop-to-clinic-gap',
        title: 'Benchtop Precision in Controlled Saline Rarely Survives Real Patient Serum',
        thesis:
          'BioTech and diagnostics startups frequently mistake laboratory feasibility for scalable commercial sensitivity.',
        paragraphs: [
          'In deep-tech and medical hardware, the jump from university lab proof-of-concept to reproducible clinical trials is the primary death valley.',
          'Fixing sensor drift requires multiple fabrication iterations, each taking months and burning millions in foundry fees.',
        ],
        takeaway:
          'Rule: Budget for a minimum of 4x foundry iteration cycles beyond initial benchtop validation.',
        relatedCaseStudySlug: 'why-pulsebio-failed-blood-analytics',
      },
      {
        number: '06',
        id: 'lesson-liquidation-preference-trap',
        title: 'Senior Participating Preferred Terms Vaporize Common Shareholder Alignment',
        thesis:
          'Agreeing to 2x or 3x liquidation preferences in down-rounds destroys founder and employee incentives, killing strategic acquihire outcomes.',
        paragraphs: [
          'When emergency bridge capital is needed, founders often accept senior preference multiples or full ratchet anti-dilution.',
          'Once the preference stack exceeds acquisition value, key engineering talent departs, destroying salvageable acquisitions.',
        ],
        takeaway:
          'Rule: A lower clean valuation with 1x non-participating terms is vastly superior to an inflated valuation encumbered by preference multiples.',
        relatedCaseStudySlug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
      },
    ],
    conclusion:
      'Failure in venture-backed tech is rarely caused by a single rogue event; it is almost always the inevitable compounding of structural misalignment.',
  },
  'failure-patterns-structural-autopsy': {
    id: 'failure-patterns-structural-autopsy',
    title: 'The 5 Structural Autopsy Patterns of 2024 Tech Liquidations',
    slug: 'failure-patterns-structural-autopsy',
    category: 'Failure Patterns',
    subtitle:
      'A forensic classification framework examining balance-sheet mismatches, regulatory lag, and unit economic inversion.',
    publishDate: 'October 21, 2024',
    readTime: '12 min read',
    author: {
      name: 'Marcus Vance',
      role: 'Head of Research, Venture Graph',
    },
    introduction: [
      'By analyzing the cap sheets and receiver filings of 2024 insolvencies, we have cataloged five recurring structural failure patterns.',
    ],
    lessons: [
      {
        number: '01',
        id: 'pattern-duration-mismatch',
        title: 'Pattern 1: The Liquidity & Duration Mismatch',
        thesis: 'Using short-term deposits or floating-rate liabilities to fund illiquid or venture-risk assets.',
        paragraphs: [
          'When customer liabilities can be withdrawn on demand while assets are tied up in private credit, any loss of confidence triggers an irreversible run.',
        ],
        takeaway: 'Match duration strictly across asset-liability pairings.',
        relatedCaseStudySlug: 'omnipay-failure-how-92m-collapsed',
      },
      {
        number: '02',
        id: 'pattern-hardware-regulatory-drag',
        title: 'Pattern 2: The Regulatory Milestone Drag',
        thesis: 'High burn rates sustained in anticipation of bureaucratic approvals that stall.',
        paragraphs: [
          'Burning millions monthly on operational centers that cannot legally generate commercial revenue because permits are delayed.',
        ],
        takeaway: 'Do not scale field operations ahead of finalized regulatory waivers.',
        relatedCaseStudySlug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
      },
    ],
  },
  'top-lists-biggest-collapses-2024': {
    id: 'top-lists-biggest-collapses-2024',
    title: 'Ranked: The 10 Most Expensive Startup Failures of 2024',
    slug: 'top-lists-biggest-collapses-2024',
    category: 'Top Lists',
    subtitle:
      'A ranked breakdown of the year largest venture capital liquidations and the structural reasons why each collapsed.',
    publishDate: 'October 18, 2024',
    readTime: '15 min read',
    author: {
      name: 'Elena Rostova',
      role: 'Staff Reporter, Venture Graph',
    },
    introduction: [
      'In 2024, more than $1.8 billion in total equity capital was wiped out across the top 10 largest venture shutdowns.',
    ],
    lessons: [
      {
        number: '01',
        id: 'rank-01-skybound',
        title: 'Rank 1: SkyBound ($175M Collapsed)',
        thesis: 'High hardware burn and prohibitive unit economics in autonomous drone delivery.',
        paragraphs: [
          'Despite raising $175 million from tier-one funds, unit economics of $68 per delivery versus $4.50 revenue forced an emergency liquidation.',
        ],
        takeaway: 'Autonomous delivery requires sub-1:5 remote operator ratios to reach positive gross margins.',
        relatedCaseStudySlug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
      },
      {
        number: '02',
        id: 'rank-02-hyperscale',
        title: 'Rank 2: HyperScale AI ($140M Collapsed)',
        thesis: 'Long-term take-or-pay compute leases vs plunging inferencing margins.',
        paragraphs: [
          'Fixed multi-year GPU contract liabilities clashed with lower enterprise demand as models became more efficient.',
        ],
        takeaway: 'Never sign non-cancelable compute leases exceeding verified contracted revenue.',
        relatedCaseStudySlug: 'hyperscale-ai-failure-cloud-infrastructure',
      },
      {
        number: '03',
        id: 'rank-03-omnipay',
        title: 'Rank 3: OmniPay ($92M Collapsed)',
        thesis: 'Undisclosed private credit exposure triggered a catastrophic deposit run.',
        paragraphs: [
          'Startups pulled over $380M in 72 hours when yield-generating debt notes defaulted.',
        ],
        takeaway: 'Treasury management platforms must never trade liquidity for yield.',
        relatedCaseStudySlug: 'omnipay-failure-how-92m-collapsed',
      },
    ],
  },
};

export function getNewsArticleBySlug(slug: string): NewsArticle | null {
  if (NEWS_ARTICLES_DATA[slug]) {
    return NEWS_ARTICLES_DATA[slug];
  }
  const found = Object.values(NEWS_ARTICLES_DATA).find(
    (item) => item.slug === slug || item.id === slug
  );
  if (found) return found;

  const fallback = [...NEW_FUNDINGS, ...LATEST_POSTS].find((item) => item.slug === slug);
  if (fallback) {
    return {
      ...fallback,
      timestamp: `${fallback.publishDate} • Verified Dispatch`,
      metrics: fallback.amount
        ? {
            amount: fallback.amount,
            capitalType: fallback.capitalType || 'Venture Round',
            round: fallback.round || 'Strategic',
          }
        : undefined,
      content: {
        summary: fallback.excerpt,
        body: [
          fallback.excerpt,
          'Full technical and financial terms have been verified through company regulatory disclosures.',
        ],
      },
    };
  }

  return null;
}

export function getRelatedNews(currentSlug: string, count: number = 4): Post[] {
  return NEW_FUNDINGS.filter((item) => item.slug !== currentSlug).slice(0, count);
}

export function getHubArticleBySlug(slug: string): HubArticle | null {
  if (HUB_ARTICLES_DATA[slug]) {
    return HUB_ARTICLES_DATA[slug];
  }
  const found = Object.values(HUB_ARTICLES_DATA).find(
    (item) => item.slug === slug || item.id === slug
  );
  return found || null;
}

export function getRelatedHubArticles(currentSlug: string): HubArticle[] {
  return Object.values(HUB_ARTICLES_DATA).filter((item) => item.slug !== currentSlug);
}

export const TRENDING_POSTS = [
  {
    rank: '01',
    title: 'SkyBound Failure: How a $175M Drone Delivery Startup Collapsed in 2024',
    category: 'Failure Case Study',
    slug: 'skybound-failure-how-a-175m-drone-delivery-startup-collapsed',
  },
  {
    rank: '02',
    title: 'OmniPay Failure: How $92M Collapsed in 2024',
    category: 'FinTech / Banking',
    slug: 'omnipay-failure-how-92m-collapsed',
  },
  {
    rank: '03',
    title: 'Anthropic Secures Additional $4B Commitment from Amazon for AI Infrastructure',
    category: 'Funding News',
    slug: 'anthropic-secures-additional-4b-commitment-amazon',
  },
  {
    rank: '04',
    title: 'Why PulseBio Failed: Inside the $90M Blood Analytics Platform That Collapsed in 2024',
    category: 'HealthTech',
    slug: 'why-pulsebio-failed-blood-analytics',
  },
  {
    rank: '05',
    title: 'Understanding Senior Liquidation Preferences in Down-Rounds',
    category: 'Founder Lessons',
    slug: 'understanding-senior-liquidation-preferences',
  },
];

export const CASE_STUDIES_DATA_EXPORT = CASE_STUDIES_DATA;
