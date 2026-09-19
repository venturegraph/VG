import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Venture Graph Privacy Policy detailing data collection, email dispatch consent, cookies, analytics, and your privacy rights under GDPR and CCPA.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      badge="Compliance & Privacy"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. Introduction & Overview</h2>
        <p>
          Venture Graph (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates as a premier digital publication and research index providing startup post-mortems, funding intelligence, and executive retrospectives. We respect your privacy and are committed to protecting the personal data you share with us.
        </p>
        <p>
          This Privacy Policy describes how we collect, store, process, and safeguard information when you visit{' '}
          <Link href="/" className="text-accent-orange hover:underline font-semibold">
            venturegraph.me
          </Link>{' '}
          or subscribe to our editorial dispatch.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. Information We Collect</h2>
        <p>
          We deliberately minimize the amount of personal data we request or retain:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>
            <strong className="text-on-surface">Email Address:</strong> When you voluntarily subscribe to our weekly editorial dispatch via our subscription forms, we collect your email address with your explicit affirmative consent.
          </li>
          <li>
            <strong className="text-on-surface">Device & Browser Information:</strong> We may collect standard aggregate server log data, including IP address, browser user-agent, operating system, and referral headers to ensure system stability and security.
          </li>
          <li>
            <strong className="text-on-surface">Local Client State:</strong> We store non-identifying operational preferences in your browser&apos;s local storage, such as your theme selection (light or dark mode) and your cookie banner dismissal state.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Legal Basis for Processing (GDPR)</h2>
        <p>
          If you are an individual residing in the European Economic Area (EEA), United Kingdom, or Switzerland, our processing of your personal data is governed by the following legal bases:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>
            <strong className="text-on-surface">Consent (Article 6(1)(a)):</strong> You provide specific, informed consent when opting into our newsletter dispatch or consenting to non-essential cookies.
          </li>
          <li>
            <strong className="text-on-surface">Legitimate Interests (Article 6(1)(f)):</strong> To monitor malicious traffic, maintain uptime, and defend against denial-of-service attempts.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. Email Communications & CAN-SPAM / GDPR</h2>
        <p>
          We strictly adhere to international email marketing standards, including the US CAN-SPAM Act and GDPR Article 7:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>We will never sell, lease, or distribute your email address to third-party advertisers or brokers.</li>
          <li>Every newsletter dispatch includes an immediate, automated single-click &quot;Unsubscribe&quot; mechanism.</li>
          <li>We require an explicit opt-in confirmation checkbox prior to submitting any email subscription.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">5. Cookies & Tracking Technologies</h2>
        <p>
          We use strictly necessary cookies to ensure site functionality, as well as optional analytical cookies to assess readership metrics. You can read full details on our cookie classification and control your preferences at our{' '}
          <Link href="/cookie-policy" className="text-accent-orange hover:underline font-semibold">
            Cookie Policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">6. Data Processors & Infrastructure</h2>
        <p>
          We partner with secure, industry-leading infrastructure providers to deliver our services:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>
            <strong className="text-on-surface">Supabase:</strong> For cloud database hosting, API management, and subscriber records.
          </li>
          <li>
            <strong className="text-on-surface">Vercel:</strong> For edge network routing, serverless execution, and static asset distribution.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">7. Your Privacy Rights</h2>
        <p>
          Regardless of your geography, Venture Graph affords you the following rights concerning your personal information:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>The right to request confirmation of what personal data we hold about you.</li>
          <li>The right to request immediate correction or permanent deletion of your email address from our subscriber index.</li>
          <li>The right to withdraw consent at any time without affecting previous lawful processing.</li>
        </ul>
        <p>
          To exercise any of these rights, contact our editorial team at{' '}
          <span className="text-on-surface font-semibold">privacy@venturegraph.me</span>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">8. Contact & Legal Counsel Inquiries</h2>
        <p>
          For questions, legal notices, or compliance verifications regarding this policy, please reach out to:
        </p>
        <div className="p-4 bg-surface-container rounded border border-outline-variant/20 text-xs text-on-surface-variant">
          <p className="font-semibold text-on-surface">Venture Graph Editorial & Compliance</p>
          <p>Email: legal@venturegraph.me</p>
          <p>Website: https://venturegraph.me</p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
