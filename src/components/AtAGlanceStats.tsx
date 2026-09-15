'use client';

import React, { useState } from 'react';
import { CaseStudyStats } from '@/types';

interface AtAGlanceStatsProps {
  stats: CaseStudyStats;
}

export const AtAGlanceStats: React.FC<AtAGlanceStatsProps> = ({ stats }) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const StatContent = () => (
    <div className="space-y-4 text-sm">
      {/* Total Raised Highlight */}
      <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary font-label-sm block mb-1">
          Total Capital Raised
        </span>
        <div className="text-2xl font-bold font-stat-lg text-primary">
          {stats.totalRaised}
        </div>
        {stats.peakValuation && (
          <div className="mt-1 text-xs text-on-surface-variant">
            Peak Valuation: <span className="font-semibold text-on-surface">{stats.peakValuation}</span>
          </div>
        )}
      </div>

      {/* Grid of Key Facts */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-sm block mb-0.5">
            Founded
          </span>
          <span className="font-semibold text-on-surface text-base">{stats.foundedYear}</span>
        </div>
        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-sm block mb-0.5">
            Shutdown
          </span>
          <span className="font-semibold text-error text-base">{stats.shutdownYear}</span>
        </div>
      </div>

      {/* Headquarters */}
      <div className="pt-2 border-t border-outline-variant/20">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary font-label-sm block mb-1">
          Headquarters
        </span>
        <div className="flex items-center gap-1.5 text-on-surface font-medium text-xs sm:text-sm">
          <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
          <span>{stats.hqCountry}</span>
        </div>
      </div>

      {/* Primary Failure Reason */}
      <div className="pt-2 border-t border-outline-variant/20">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary font-label-sm block mb-1">
          Primary Failure Factor
        </span>
        <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-on-surface text-xs leading-relaxed font-medium">
          <div className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-error mt-0.5 shrink-0">
              report
            </span>
            <span>{stats.failureReason}</span>
          </div>
        </div>
      </div>

      {/* Key Investors */}
      {stats.keyInvestors && stats.keyInvestors.length > 0 && (
        <div className="pt-2 border-t border-outline-variant/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary font-label-sm block mb-1.5">
            Notable Investors
          </span>
          <div className="flex flex-wrap gap-1.5">
            {stats.keyInvestors.map((investor) => (
              <span
                key={investor}
                className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px] border border-outline-variant/20"
              >
                {investor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Collapsible Accordion (Hidden on lg screens) */}
      <div className="lg:hidden mb-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container transition-colors"
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          aria-expanded={isMobileExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full" />
            <span className="font-headline-md text-base font-semibold text-on-surface">
              At a Glance: Startup Autopsy
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary font-semibold">
            <span>{isMobileExpanded ? 'Hide' : 'View Stats'}</span>
            <span
              className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                isMobileExpanded ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </div>
        </button>

        {isMobileExpanded && (
          <div className="p-4 pt-0 border-t border-outline-variant/20 bg-surface-container-lowest">
            <StatContent />
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar (Hidden on mobile/tablet, sticky on lg screens) */}
      <aside className="hidden lg:block w-full">
        <div className="sticky top-44 rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/30">
            <span className="w-2.5 h-2.5 bg-primary rounded-full" />
            <h3 className="font-headline-md text-lg text-on-surface font-semibold">
              At a Glance
            </h3>
          </div>
          <StatContent />
        </div>
      </aside>
    </>
  );
};
