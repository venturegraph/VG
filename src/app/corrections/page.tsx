import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Corrections Policy',
  description:
    'Venture Graph corrections policy, error reporting process, and record of editorial corrections.',
  alternates: {
    canonical: '/corrections',
  },
};

export default function CorrectionsPage() {
  return (
    <LegalPageLayout
      title="Corrections"
      badge="Editorial Accountability"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. How to Report an Error</h2>
        <p>
          [DRAFT: replace with real text] Venture Graph is committed to factual precision. If you believe a case study, article, or intelligence note contains a factual error or misattributed statement, please notify our editorial team via our{' '}
          <Link href="/contact" className="text-accent-orange hover:underline font-semibold">
            Contact Page
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Recent Corrections</h2>
        <p className="text-on-surface-variant italic">
          No recent corrections to report.
        </p>
      </section>
    </LegalPageLayout>
  );
}
