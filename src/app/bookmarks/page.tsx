import type { Metadata } from 'next';
import { BookmarksView } from './BookmarksView';

export const metadata: Metadata = {
  title: 'My Bookmarks',
  description:
    'Your saved startup post-mortems, funding alerts, and founder lessons on Venture Graph.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function BookmarksPage() {
  return <BookmarksView />;
}
