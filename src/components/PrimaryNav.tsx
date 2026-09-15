'use client';

import React from 'react';
import { NavCategory, SecondaryNavItem } from '@/types';

interface PrimaryNavProps {
  categories: NavCategory[];
  secondaryItems: SecondaryNavItem[];
}

export const PrimaryNav: React.FC<PrimaryNavProps> = ({
  categories,
  secondaryItems,
}) => {
  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed top-24 left-0 w-full bg-surface-container-low border-b border-outline-variant/30 z-30 shadow-sm transition-colors"
    >
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        {/* ROW 1: Parent categories with dropdowns (Visible by default, child links strictly in elevated dropdowns) */}
        <div className="h-11 flex items-center gap-2 md:gap-6 border-b border-outline-variant/20 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <div key={category.title} className="relative group">
              <button
                aria-expanded="false"
                aria-haspopup="true"
                className="nav-dropdown-trigger h-8 px-2.5 rounded text-xs font-label-md font-semibold text-on-surface hover:text-primary hover:bg-surface-container transition-colors inline-flex items-center gap-1"
                type="button"
              >
                <span>{category.title}</span>
                <span className="material-symbols-outlined text-[16px] text-secondary group-hover:text-primary transition-transform duration-200 group-hover:rotate-180">
                  expand_more
                </span>
              </button>

              {/* Elevated Dropdown Panel */}
              <div className="dropdown-menu absolute left-0 top-full pt-1.5 hidden group-hover:block group-focus-within:block z-40">
                <div
                  className={`${
                    category.dropdownWidth || 'w-52'
                  } bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 py-2 p-1 text-xs transition-colors`}
                >
                  {category.items.map((item) => (
                    <a
                      key={item.name}
                      className={`block rounded-lg hover:bg-surface-container transition-colors ${
                        item.description ? 'flex flex-col px-3 py-2' : 'px-3 py-2 font-medium text-on-surface'
                      }`}
                      href={item.href}
                    >
                      <span className="font-semibold text-on-surface">{item.name}</span>
                      {item.description && (
                        <span className="text-[11px] text-secondary font-normal">
                          {item.description}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ROW 2: Secondary flat standalone links bar (No dropdowns) */}
        <div className="h-10 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-label-md">
          {secondaryItems.map((item) => (
            <a
              key={item.label}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 shrink-0 ${
                item.active
                  ? 'bg-surface-container text-on-surface font-semibold hover:bg-surface-container-highest'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              href={item.href}
            >
              <span className={`material-symbols-outlined text-[15px] ${item.iconColorClass}`}>
                {item.icon}
              </span>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};
