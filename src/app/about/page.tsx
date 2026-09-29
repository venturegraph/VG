import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Venture Graph, our mission, coverage scope, and audience across the venture and startup ecosystem.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <LegalPageLayout
      title="About Venture Graph"
      badge="About Venture Graph"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. What Venture Graph Is</h2>
        <p>
          [DRAFT: replace with real text] Overview of Venture Graph as a digital publication and research resource covering startup post-mortems, venture capital developments, and founder retrospectives.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Who It&apos;s For</h2>
        <p>
          [DRAFT: replace with real text] Description of our intended audience, including founders, startup operators, investors, and researchers studying startup mortality and capital allocation.
        </p>
      </section>
    </LegalPageLayout>
  );
}
