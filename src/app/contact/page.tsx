import { Metadata } from 'next';
import { ContactView } from './ContactView';

export const metadata: Metadata = {
  title: 'Contact Editorial Desk | Venture Graph',
  description:
    'Submit confidential startup shutdown tips, funding intelligence, editorial corrections, or partnership inquiries to the Venture Graph research desk.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Editorial Desk | Venture Graph',
    description:
      'Submit confidential startup shutdown tips, funding intelligence, editorial corrections, or partnership inquiries to the Venture Graph research desk.',
    url: 'https://venturegraph.me/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactView />;
}
