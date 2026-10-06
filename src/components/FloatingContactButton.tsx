'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const FloatingContactButton: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Synchronize initial scroll state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide across all admin panel pages and on the contact page itself
  if (pathname === '/contact' || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <Link
      href="/contact"
      aria-label="Contact editorial desk"
      title="Contact Editorial Desk"
      className={`fixed bottom-6 left-6 z-40 group flex items-center rounded-full bg-slate-dark dark:bg-gray-800 text-white hover:bg-accent-orange dark:hover:bg-accent-orange border border-white/20 dark:border-gray-700 shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 ${
        isScrolled ? 'p-2.5 hover:px-4' : 'px-4 py-2.5'
      }`}
    >
      <span className="material-symbols-outlined text-[20px] text-accent-orange group-hover:text-white transition-colors shrink-0">
        mail
      </span>
      <span
        className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold uppercase tracking-wider ${
          isScrolled
            ? 'max-w-0 opacity-0 pl-0 group-hover:max-w-[130px] group-hover:opacity-100 group-hover:pl-2'
            : 'max-w-[130px] opacity-100 pl-2'
        }`}
      >
        Contact Desk
      </span>
    </Link>
  );
};

