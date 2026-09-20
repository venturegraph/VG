import { Metadata } from 'next';
import { FAQView } from './FAQView';
import { FAQItem } from '@/components/FAQAccordion';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Venture Graph',
  description:
    'Frequently asked questions about Venture Graph, our startup shutdown post-mortems, funding intelligence, and editorial research methodology.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Venture Graph',
    description:
      'Frequently asked questions about Venture Graph, our startup shutdown post-mortems, funding intelligence, and editorial research methodology.',
    url: 'https://venturegraph.me/faq',
    type: 'website',
  },
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'what-is-venture-graph',
    question: 'What is Venture Graph?',
    answer:
      'Venture Graph is an independent intelligence index tracking the startup lifecycle, venture capital deployment, and startup mortality. We provide forensic post-mortems on collapsed companies, breaking funding alerts, and practical strategic playbooks for founders, investors, and operators.',
  },
  {
    id: 'where-does-data-come-from',
    question: 'Where does Venture Graph source its shutdown and funding data?',
    answer:
      'Our data is synthesized from regulatory filings, bankruptcy court records, investor disclosures, direct founder interviews, audited capital databases, and verified primary sources. Every dispatch is reviewed for accuracy before publication.',
  },
  {
    id: 'how-do-you-analyze-post-mortems',
    question: 'How do you analyze startup post-mortems?',
    answer:
      'Each post-mortem examines the startup’s timeline, total capital raised, peak valuation, key investors, core failure mechanism (such as premature scaling, unit economic deficit, or fraud), and the strategic lessons founders should take away to prevent similar outcomes.',
  },
  {
    id: 'can-founders-submit-tips',
    question: 'Can founders or investors submit confidential tips or corrections?',
    answer:
      'Yes. We actively welcome verified tips, anonymous shutdown briefings, and factual corrections. You can reach our research desk directly through our contact page or by submitting an editorial tip.',
  },
  {
    id: 'how-often-updated',
    question: 'How often is the Venture Graph database and ticker updated?',
    answer:
      'Our live ticker and news dispatches are updated hourly during market hours as venture funding rounds, major layoffs, and wind-down announcements occur. In-depth post-mortem case studies are published weekly.',
  },
  {
    id: 'is-venture-graph-free',
    question: 'Is Venture Graph free to access, and how does the email dispatch work?',
    answer:
      'All published post-mortems, news alerts, and category archives on Venture Graph are currently free to read. You can subscribe to our weekly email dispatch to receive our latest shutdown breakdowns and curated intelligence directly in your inbox.',
  },
  {
    id: 'how-are-failures-categorized',
    question: 'How are failure patterns and funding brackets categorized?',
    answer:
      'We categorize case studies by funding bracket (Under $10M, $10M–$50M, $50M–$100M, and $100M+ Unicorns), sector (AI, FinTech, SaaS, E-Commerce), funding origin (VC-backed vs. bootstrapped), and primary failure pattern.',
  },
];

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQView faqItems={FAQ_ITEMS} />
    </>
  );
}
