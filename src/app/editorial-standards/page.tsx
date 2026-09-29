import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Editorial Standards',
  description:
    'Venture Graph editorial guidelines, research methodology, citation standards, and corrections policies.',
  alternates: {
    canonical: '/editorial-standards',
  },
};

export default function EditorialStandardsPage() {
  return (
    <LegalPageLayout
      title="Editorial Standards"
      badge="Editorial Governance & Standards"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. How Case Studies Are Researched</h2>
        <p>
          [DRAFT: replace with real text] Case study research methodology, public document review, and data gathering procedures.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. How Sources Are Cited</h2>
        <p>
          [DRAFT: replace with real text] Direct attribution, primary reporting references, and documentation citation standards.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. How Conflicting Figures Are Handled</h2>
        <p>
          [DRAFT: replace with real text] Protocol for evaluating contradictory financing figures, valuations, or timeline disclosures across independent sources.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. How Corrections Work</h2>
        <p>
          [DRAFT: replace with real text] Editorial review workflow for factual adjustments and clarifications. For more information, visit our{' '}
          <Link href="/corrections" className="text-accent-orange hover:underline font-semibold">
            Corrections Policy
          </Link>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
