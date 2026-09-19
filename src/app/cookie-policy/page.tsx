import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Venture Graph Cookie Policy detailing our transparent use of cookies, local storage state, analytics, and preference controls.',
  alternates: {
    canonical: '/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      badge="Cookies & Tracking"
      lastUpdated="September 2026"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your computer or mobile device by websites that you visit. They are widely utilized to enable website functionality, make sites operate more efficiently, and provide non-identifying telemetry to website operators.
        </p>
        <p>
          Alongside cookies, modern web applications utilize browser &quot;Local Storage&quot; to remember user selections (such as color themes) without transmitting excess data across every server request.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">2. How Venture Graph Uses Cookies & Local Storage</h2>
        <p>
          We take a privacy-first approach and strictly minimize all client-side storage to operational necessities and performance telemetry:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>
            <strong className="text-on-surface">Essential Local Storage:</strong> Remembers your explicit color preference (dark mode vs. light mode) and logs whether you have acknowledged our cookie consent banner.
          </li>
          <li>
            <strong className="text-on-surface">Authentication & Security (Admin):</strong> For authenticated administrative staff, secure encrypted session cookies (provided by Supabase) verify identity and access permissions to our publishing dashboard.
          </li>
          <li>
            <strong className="text-on-surface">Performance & Readership Analytics:</strong> Aggregated anonymous metrics that help our editorial room understand which startup post-mortems and categories resonate most with readers.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">3. Inventory of Storage Tokens</h2>
        <div className="overflow-x-auto border border-outline-variant/30 rounded-lg">
          <table className="w-full text-left text-xs text-on-surface-variant border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface font-semibold uppercase tracking-wider">
                <th className="p-3">Key / Cookie</th>
                <th className="p-3">Type</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <tr>
                <td className="p-3 font-mono text-on-surface font-semibold">theme</td>
                <td className="p-3">Local Storage</td>
                <td className="p-3 font-semibold text-accent-orange">Essential</td>
                <td className="p-3">Remembers your light or dark mode theme selection.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-on-surface font-semibold">vg_cookie_consent</td>
                <td className="p-3">Local Storage</td>
                <td className="p-3 font-semibold text-accent-orange">Essential</td>
                <td className="p-3">Stores your cookie consent choice (&quot;accepted&quot; or &quot;essential&quot;).</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-on-surface font-semibold">sb-*-auth-token</td>
                <td className="p-3">Secure HTTP Cookie</td>
                <td className="p-3 font-semibold text-accent-orange">Essential (Admin Only)</td>
                <td className="p-3">Maintains administrative editor authentication sessions.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">4. How to Control or Revoke Your Preferences</h2>
        <p>
          You have full control over cookies and storage mechanisms:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
          <li>
            <strong className="text-on-surface">Through Our Banner:</strong> When you first visit Venture Graph, you can select &quot;Essential Only&quot; to prevent any non-vital tracking.
          </li>
          <li>
            <strong className="text-on-surface">Through Browser Settings:</strong> You can block or delete cookies entirely via your browser&apos;s privacy settings (e.g. Chrome, Safari, Firefox, Edge).
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">5. Inquiries & Contact</h2>
        <p>
          If you have questions regarding our use of cookies or want more information regarding our data practices, review our{' '}
          <Link href="/privacy-policy" className="text-accent-orange hover:underline font-semibold">
            Privacy Policy
          </Link>{' '}
          or contact us at <span className="text-on-surface font-semibold">privacy@venturegraph.me</span>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
