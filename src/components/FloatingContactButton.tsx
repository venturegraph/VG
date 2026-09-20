'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const FloatingContactButton: React.FC = () => {
  const pathname = usePathname();

  // Do not render floating contact button on the contact page itself
  if (pathname === '/contact') return null;

  return (
    <Link
      href="/contact"
      aria-label="Contact editorial desk"
      title="Contact Editorial"
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-2 p-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-slate-dark dark:bg-gray-800 text-white hover:bg-accent-orange dark:hover:bg-accent-orange border border-white/20 dark:border-gray-700 shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2"
    >
      <span className="material-symbols-outlined text-[20px] text-accent-orange group-hover:text-white transition-colors">
        mail
      </span>
      <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">
        Contact Desk
      </span>
    </Link>
  );
};
