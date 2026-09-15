'use client';

import React from 'react';

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface CategoryFilterPillsProps {
  options: FilterOption[];
  activeFilter: string;
  onSelectFilter: (id: string) => void;
}

export const CategoryFilterPills: React.FC<CategoryFilterPillsProps> = ({
  options,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      {options.map((option) => {
        const isActive = activeFilter === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectFilter(option.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary-container text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <span>{option.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isActive
                  ? 'bg-on-primary/20 text-on-primary'
                  : 'bg-surface-container-high text-secondary'
              }`}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
