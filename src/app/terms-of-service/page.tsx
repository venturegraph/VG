import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Venture Graph Terms of Service governing access to our startup mortality database, funding alerts, analysis, and subscriber publications.',
  alternates: {
    canonical: '/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      badge="Legal Agreement"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Acceptance of Terms</h2>
        <p>
          By accessing or using Venture Graph (located at{' '}
          <Link href="/" className="text-accent-orange hover:underline font-semibold">
            venturegraph.me
          </Link>
          ), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, please discontinue your use of the site immediately.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">
          2. Informational & Editorial Purpose (No Investment Advice)
        </h2>
        <p>
          Venture Graph is an independent research publication and index specializing in startup autopsy analysis, venture capital movements, founder lessons, and company failures.
        </p>
        <div className="p-4 bg-surface-container rounded border-l-4 border-accent-orange text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold block mb-1">
            CRITICAL DISCLAIMER:
          </strong>
          Nothing published on Venture Graph—including our funding alerts, failure case studies, mortality scores, or retrospective commentary—constitutes investment, financial, legal, or tax advice. You should consult qualified professional advisers before making any capital allocation or investment decisions.
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Intellectual Property Rights</h2>
        <p>
          All original commentary, custom taxonomy, investigative reports, code, visual presentation, and database structures are the exclusive intellectual property of Venture Graph and protected by international copyright laws.
        </p>
        <p>
          Company names, logos, trademarks, and corporate filings referenced in our post-mortems and news reporting are the property of their respective trademark holders and are utilized here under fair use nominative identification for journalistic and reporting purposes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. Permitted Use & Scraping Limitations</h2>
        <p>
          You are permitted to access, view, and read Venture Graph content for your personal, academic, or internal business research. You agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>Systematically scrape or mass-extract our database without prior written consent from our editorial board.</li>
          <li>Engage in any denial-of-service attack, vulnerability scanning, or automated probing of our administration interfaces.</li>
          <li>Republish our long-form case studies in their entirety without clear canonical attribution and prior license.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">5. Newsletter & User Submissions</h2>
        <p>
          When subscribing to our newsletter dispatch, you agree to provide an accurate email address and confirm your consent in accordance with our{' '}
          <Link href="/privacy-policy" className="text-accent-orange hover:underline font-semibold">
            Privacy Policy
          </Link>
          . You may terminate your subscription at any time using the one-click unsubscribe link provided in every issue.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">6. Limitation of Liability</h2>
        <p>
          Venture Graph and its authors, editors, and affiliates provide all content on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied. Under no circumstances will Venture Graph be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or reliance upon any analysis or data published on this website.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">7. Governing Law & Contact</h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with applicable governing law without regard to conflict of law principles. For inquiries regarding these terms, please contact:
        </p>
        <div className="p-4 bg-surface-container rounded border border-outline-variant/20 text-xs text-on-surface-variant">
          <p className="font-semibold text-on-surface">Venture Graph Legal Desk</p>
          <p>Email: legal@venturegraph.me</p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
