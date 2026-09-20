import type { Metadata } from 'next';
import './globals.css';
import { CookieBanner } from '@/components/CookieBanner';
import { ScrollToTop } from '@/components/ScrollToTop';
import { FloatingContactButton } from '@/components/FloatingContactButton';
import { GoogleAnalyticsWrapper } from '@/components/GoogleAnalyticsWrapper';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://venturegraph.me';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Venture Graph | Startup Post-Mortems, Funding Intelligence & Founder Playbooks',
    template: '%s | Venture Graph',
  },
  description:
    'Unvarnished post-mortems, funding alerts, and actionable playbooks for founders and investors.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Venture Graph',
    title: 'Venture Graph | Startup Post-Mortems, Funding Intelligence & Founder Playbooks',
    description:
      'Unvarnished post-mortems, funding alerts, and actionable playbooks for founders and investors.',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Venture Graph Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venture Graph | Startup Post-Mortems, Funding Intelligence & Founder Playbooks',
    description:
      'Unvarnished post-mortems, funding alerts, and actionable playbooks for founders and investors.',
    images: ['/icon.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background font-body-base text-body-base text-on-surface antialiased transition-colors duration-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-orange focus:text-white focus:text-sm focus:font-bold focus:rounded focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>
        {children}
        <CookieBanner />
        <ScrollToTop />
        <FloatingContactButton />
        <GoogleAnalyticsWrapper gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}
