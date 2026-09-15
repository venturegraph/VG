'use client';

import React from 'react';
import { PARENT_TAXONOMY, STANDALONE_CATEGORIES } from '@/lib/taxonomy';

interface CategorySelectProps {
  category: string;
  subcategory: string;
  onCategoryChange: (cat: string, sub?: string) => void;
  onSubcategoryChange: (sub: string) => void;
  disabled?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  disabled = false,
}) => {
  const currentParentObj = PARENT_TAXONOMY.find((p) => p.name === category);
  const isParentWithChildren = !!currentParentObj;
  const availableSubcategories = currentParentObj ? currentParentObj.subcategories : [];

  const handleParentChange = (newCat: string) => {
    const parentObj = PARENT_TAXONOMY.find((p) => p.name === newCat);
    if (parentObj) {
      // Pick first child as sensible default
      const defaultChild = parentObj.subcategories[0] || '';
      onCategoryChange(newCat, defaultChild);
    } else {
      // Standalone category has no subcategory
      onCategoryChange(newCat, '');
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Category / Primary Taxonomy */}
        <div className="space-y-1.5">
          <label
            htmlFor="parent-category-select"
            className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">folder</span>
            <span>Category (Parent / Type)</span>
            <span className="text-error">*</span>
          </label>

          <div className="relative">
            <select
              id="parent-category-select"
              value={category}
              onChange={(e) => handleParentChange(e.target.value)}
              disabled={disabled}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm font-medium focus:outline-hidden focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
            >
              <optgroup label="Primary Taxonomy (Parent Categories)">
                {PARENT_TAXONOMY.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Standalone Types">
                {STANDALONE_CATEGORIES.map((s) => (
                  <option key={s} value={s}>
                    {s} (Standalone)
                  </option>
                ))}
              </optgroup>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-lg">
              unfold_more
            </span>
          </div>
          <p className="text-[11px] text-secondary">
            Matches live Venture Graph navigation taxonomy.
          </p>
        </div>

        {/* Subcategory (Cascading child) */}
        <div className="space-y-1.5">
          <label
            htmlFor="subcategory-select"
            className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">subdirectory_arrow_right</span>
              <span>Subcategory (Child)</span>
              {isParentWithChildren && <span className="text-error">*</span>}
            </span>
            {!isParentWithChildren && (
              <span className="text-[10px] font-mono text-secondary">Optional for standalone</span>
            )}
          </label>

          <div className="relative">
            {isParentWithChildren ? (
              <select
                id="subcategory-select"
                value={subcategory}
                onChange={(e) => onSubcategoryChange(e.target.value)}
                disabled={disabled}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm font-medium focus:outline-hidden focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-60"
              >
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="subcategory-select"
                type="text"
                value={subcategory}
                onChange={(e) => onSubcategoryChange(e.target.value)}
                disabled={disabled}
                placeholder="Optional child tag (e.g. Breaking News)"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
              />
            )}
            {isParentWithChildren && (
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-lg">
                unfold_more
              </span>
            )}
          </div>
          <p className="text-[11px] text-secondary">
            {isParentWithChildren
              ? `Subcategory under ${category}`
              : 'Standalone categories do not require a child subcategory'}
          </p>
        </div>
      </div>
    </div>
  );
};
