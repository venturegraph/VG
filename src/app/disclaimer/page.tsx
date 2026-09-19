import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'Venture Graph Editorial & Financial Disclaimer. Information published is for research, educational, and journalistic purposes only and does not constitute investment or financial advice.',
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      badge="Editorial & Financial Disclosure"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Informational & Educational Purposes Only</h2>
        <p>
          The content, case studies, financial metrics, valuation histories, and retrospective post-mortems published on Venture Graph (
          <Link href="/" className="text-accent-orange hover:underline font-semibold">
            venturegraph.me
          </Link>
          ) are provided strictly for general informational, educational, and journalistic purposes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. No Investment, Financial, or Legal Advice</h2>
        <div className="p-5 bg-surface-container rounded-md border-l-4 border-accent-orange space-y-2 text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold block text-sm">
            IMPORTANT LEGAL & INVESTMENT NOTICE:
          </strong>
          <p>
            Venture Graph is not a registered investment advisor, broker-dealer, financial analyst, or legal consultancy. No material on this website should be construed as an offer, solicitation, recommendation, or endorsement to buy, sell, hold, or invest in any venture capital fund, private equity instrument, security, cryptocurrency, or corporate entity.
          </p>
          <p>
            You must conduct your own independent due diligence and consult certified financial, legal, and tax advisors before making any capital, business, or investment commitments.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Source Material & Reporting Standards</h2>
        <p>
          Our startup mortality breakdowns, failure post-mortems, and funding alerts are compiled from public regulatory filings (e.g., SEC EDGAR, Delaware Chancery Court records, USPTO dockets), official company announcements, verified direct interviews, and established financial journalism outlets.
        </p>
        <p>
          While we make every diligent effort to verify source material at the time of publication, corporate records and valuations in the private markets are subject to revision, ongoing litigation, and rapid change. Venture Graph cannot guarantee the complete accuracy, completeness, or timeliness of all third-party disclosures.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. Trademark & Fair Use Nominative Attribution</h2>
        <p>
          All company names, brand marks, product names, logos, and registered trademarks featured on Venture Graph are the property of their respective owners. Their inclusion in our analytical post-mortems and news reporting constitutes nominative fair use for descriptive, commentary, and news reporting purposes under applicable trademark law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">5. Contact & Editorial Corrections</h2>
        <p>
          If you are a founder, investor, or legal representative of a company profiled in our post-mortem database and believe an analytical detail or court citation requires factual correction or update, please submit your documentation to our editorial board at:
        </p>
        <div className="p-4 bg-surface-container rounded border border-outline-variant/20 text-xs text-on-surface-variant">
          <p className="font-semibold text-on-surface">Venture Graph Corrections Desk</p>
          <p>Email: editorial@venturegraph.me</p>
          <p>Reference: Include article slug, company name, and supporting court or regulatory filing dockets.</p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
