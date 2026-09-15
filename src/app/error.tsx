'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface p-6 text-center">
      <h1 className="font-display-hero text-4xl font-bold text-error mb-4">Something went wrong</h1>
      <p className="font-body-sm text-on-surface-variant max-w-md mb-6">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
