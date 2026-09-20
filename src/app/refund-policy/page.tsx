import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Venture Graph Refund and Cancellation Policy detailing terms for subscriptions, digital research briefings, and editorial services.',
  alternates: {
    canonical: '/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      badge="Billing & Subscriptions"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Free Editorial Content & Dispatches</h2>
        <p>
          The vast majority of Venture Graph—including our comprehensive startup post-mortems, failure database, funding alerts, and weekly editorial dispatches—is provided to our readers free of charge. No payment or billing authorization is required to access our public articles.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Premium Subscriptions & Memberships</h2>
        <p>
          For optional paid subscriptions, premium briefings, and pro membership tiers (when activated):
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>
            <strong className="text-on-surface">14-Day Money-Back Guarantee:</strong> If you purchase an annual membership or subscription, you are entitled to request a full refund within 14 calendar days of your initial purchase date if you are not satisfied.
          </li>
          <li>
            <strong className="text-on-surface">Monthly Subscriptions:</strong> Monthly subscriptions can be canceled at any time via your account settings. When canceled, recurring billing stops immediately, and your access continues until the end of the current billing cycle.
          </li>
          <li>
            <strong className="text-on-surface">Renewal Notifications:</strong> We send email notifications prior to annual subscription renewals so you can review or adjust your subscription preferences.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Bespoke Research Reports & Datasets</h2>
        <p>
          Purchases of individually downloadable research datasets, historical data exports, or custom research commissions are digital products delivered electronically. Because digital files cannot be revoked once downloaded:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>One-off dataset exports are non-refundable once the file download has commenced.</li>
          <li>If an export is corrupt or incomplete, our data engineering team will provide a corrected download or issue a full credit.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. How to Request a Refund</h2>
        <p>
          To request a refund or raise a billing inquiry, contact our billing desk with your payment email and transaction reference ID:
        </p>
        <div className="p-4 bg-surface-container rounded border border-outline-variant/20 text-xs text-on-surface-variant space-y-1">
          <p className="font-semibold text-on-surface">Venture Graph Billing & Support</p>
          <p>Email: <span className="font-mono text-accent-orange">billing@venturegraph.me</span></p>
          <p>Direct Inquiries: <Link href="/contact" className="text-accent-orange hover:underline">Contact Editorial &amp; Support Desk</Link></p>
        </div>
        <p className="text-xs text-secondary">
          Refund requests are reviewed within two business days. Approved refunds are credited directly back to the original payment method.
        </p>
      </section>
    </LegalPageLayout>
  );
}
