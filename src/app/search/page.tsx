import { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchView } from './SearchView';
import { BrandedLoader } from '@/components/BrandedLoader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search the Archive | Venture Graph',
  description: 'Search startup shutdowns, post-mortems, funding intelligence, and playbooks.',
  robots: {
    index: false, // Internal search results should not be indexed by search engines
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-secondary">
          <BrandedLoader size="lg" label="Loading Archive Intelligence..." />
        </div>
      }
    >
      <SearchView />
    </Suspense>
  );
}
