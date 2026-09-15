'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('Thursday, October 24, 2024');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Format dynamic date on client side
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    } catch {
      // fallback to approved date
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant/30 transition-colors">
      {/* Publication Info Bar */}
      <div className="h-8 w-full bg-surface-container-low border-b border-outline-variant/20 px-4 lg:px-6 flex items-center justify-between text-on-surface-variant transition-colors">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs">
          <span className="inline-flex items-center gap-1.5 font-label-sm uppercase text-primary font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            VENTURE GRAPH
          </span>
          <span className="text-secondary">•</span>
          <span className="font-body-sm text-secondary truncate">
            Startup Post-Mortems, Funding Intelligence &amp; Founder Playbooks
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-label-sm tracking-wider uppercase text-secondary">
          <span id="header-current-date">{currentDate}</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="relative h-16 max-w-[1280px] mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            aria-label="Open mobile menu"
            className="lg:hidden p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded"
            id="mobile-menu-open-btn"
            type="button"
            onClick={onOpenMobileMenu}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Venture Graph Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XP8QDymFpqagarXnm65HMbh8X8tFtZWFtrczWEyA1vqfSkrN3ZDVdZx292_TzSYRuaRWHjlCGUTBfeaQryI-xSLhJjW03-FtCRLHAZGUA9S8H0A74T2_koIRN2bSjeJ2R1AIAwkz_WH2HJw2UziWtf01RYu_HRc_bOPE1CBjY8x9GT013sf2A60ij3t73BNec66eZV8XzN5V0AZbawYcmcFP6vavI_jJ-I9w9nURywyEFiUvaBQdi5WZlF"
            />
          </Link>
        </div>

        {/* Action Items: Search, Dark Mode, Subscribe */}
        <div className="flex items-center gap-3">
          {/* Search trigger button */}
          <button
            aria-label="Search stories"
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded"
            id="search-open-btn"
            type="button"
            onClick={() => setIsSearchOpen(true)}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button
            aria-label="Toggle color mode"
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded"
            type="button"
            onClick={onToggleDarkMode}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <a
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold hover:bg-primary transition-colors"
            href="#newsletter-signup"
          >
            Subscribe
          </a>
        </div>

        {/* Expandable Search Overlay/Bar in Header */}
        <div
          className={`absolute inset-0 bg-surface-container-lowest z-20 px-4 lg:px-6 flex items-center justify-between gap-3 transition-all duration-200 ${
            isSearchOpen ? 'flex' : 'hidden'
          }`}
          id="header-search-bar"
        >
          <div className="flex items-center gap-3 flex-1 max-w-4xl mx-auto">
            <span className="material-symbols-outlined text-secondary text-[22px]">search</span>
            <input
              ref={searchInputRef}
              autoComplete="off"
              className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 text-sm font-body-base py-2 focus:outline-none"
              id="header-search-input"
              placeholder="Search by company name, round, or keyword..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            aria-label="Close search"
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-colors flex items-center gap-1 text-xs font-label-md"
            id="search-close-btn"
            type="button"
            onClick={handleCloseSearch}
          >
            <span className="hidden sm:inline text-secondary font-mono">ESC</span>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </header>
  );
};
