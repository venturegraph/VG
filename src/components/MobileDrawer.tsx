'use client';

import React, { useState, useEffect } from 'react';
import { NavCategory, SecondaryNavItem } from '@/types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: NavCategory[];
  secondaryItems: SecondaryNavItem[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  secondaryItems,
}) => {
  // Track open state of accordions by category title
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const toggleAccordion = (title: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-inverse-surface/60 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        id="mobile-drawer-backdrop"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        aria-label="Mobile Navigation"
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-surface-container-lowest z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="mobile-drawer"
        role="dialog"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <a className="flex items-center" href="#" onClick={onClose}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Venture Graph Logo"
              className="h-7 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XP8QDymFpqagarXnm65HMbh8X8tFtZWFtrczWEyA1vqfSkrN3ZDVdZx292_TzSYRuaRWHjlCGUTBfeaQryI-xSLhJjW03-FtCRLHAZGUA9S8H0A74T2_koIRN2bSjeJ2R1AIAwkz_WH2HJw2UziWtf01RYu_HRc_bOPE1CBjY8x9GT013sf2A60ij3t73BNec66eZV8XzN5V0AZbawYcmcFP6vavI_jJ-I9w9nURywyEFiUvaBQdi5WZlF"
            />
          </a>
          <button
            aria-label="Close mobile menu"
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-colors"
            id="mobile-menu-close-btn"
            type="button"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Drawer Search */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">
              search
            </span>
            <input
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-container-lowest rounded-lg border border-outline-variant/40 placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary text-on-surface"
              placeholder="Search startups, rounds..."
              type="text"
            />
          </div>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-secondary px-2 mb-2 font-label-sm">
              Browse Categories
            </div>

            {/* Accordions */}
            {categories.map((category) => {
              const isExpanded = !!openAccordions[category.title];
              return (
                <div key={category.title} className="border-b border-outline-variant/20">
                  <button
                    className="mobile-accordion-btn w-full py-2.5 px-2 flex items-center justify-between text-sm font-semibold text-on-surface hover:text-primary transition-colors text-left"
                    type="button"
                    onClick={() => toggleAccordion(category.title)}
                  >
                    <span>{category.title}</span>
                    <span
                      className={`material-symbols-outlined text-[18px] transition-transform duration-200 mobile-acc-chevron ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="mobile-accordion-panel pb-2 pl-3 pr-2 space-y-1">
                      {category.items.map((item) => (
                        <a
                          key={item.name}
                          className="block py-1.5 px-2 rounded hover:bg-surface-container text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                          href={item.href}
                          onClick={onClose}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Standalone Editorial Sections in Drawer */}
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-secondary px-2 mb-2 font-label-sm">
              Editorial Sections
            </div>
            <div className="space-y-1">
              {secondaryItems.map((sec) => (
                <a
                  key={sec.label}
                  className="flex items-center gap-2 px-2 py-2 rounded text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  href={sec.href}
                  onClick={onClose}
                >
                  <span className={`material-symbols-outlined text-[16px] ${sec.iconColorClass}`}>
                    {sec.icon}
                  </span>
                  {sec.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer CTA */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low">
          <a
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm"
            href="#newsletter-signup"
            onClick={onClose}
          >
            Subscribe
          </a>
        </div>
      </div>
    </>
  );
};
