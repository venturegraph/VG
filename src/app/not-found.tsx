import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface p-6 text-center">
      <h1 className="font-display-hero text-5xl font-bold text-primary mb-4">404</h1>
      <h2 className="font-headline-md text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="font-body-sm text-on-surface-variant max-w-md mb-6">
        The story or resource you are looking for has been moved or does not exist.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
      >
        Return to Homepage
      </Link>
    </main>
  );
}
