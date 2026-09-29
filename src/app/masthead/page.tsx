import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Masthead',
  description:
    'Editorial team and contributors of Venture Graph.',
  alternates: {
    canonical: '/masthead',
  },
};

export default function MastheadPage() {
  return (
    <LegalPageLayout
      title="Masthead"
      badge="Editorial Leadership & Contributors"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Editorial Leadership</h2>
        <p>
          [DRAFT: replace with real text] Editorial roles, management, and desk leads.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Research & Analysis</h2>
        <p>
          [DRAFT: replace with real text] Case study researchers, analysts, and post-mortem contributors.
        </p>
      </section>
    </LegalPageLayout>
  );
}
