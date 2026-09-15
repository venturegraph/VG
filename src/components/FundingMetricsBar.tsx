import React from 'react';
import { FundingMetrics } from '@/types';

interface FundingMetricsBarProps {
  metrics: FundingMetrics;
}

export const FundingMetricsBar: React.FC<FundingMetricsBarProps> = ({ metrics }) => {
  return (
    <div className="my-6 p-5 sm:p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <span className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider block mb-1">
            {metrics.capitalType}
          </span>
          <div className="text-3xl sm:text-4xl font-bold font-stat-lg text-on-surface tracking-tight">
            {metrics.amount}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-surface-container font-label-md font-semibold text-on-surface border border-outline-variant/20">
            {metrics.round}
          </div>
          {metrics.valuation && (
            <div className="px-3 py-1.5 rounded-lg bg-surface-container-low font-label-md text-on-surface-variant border border-outline-variant/20">
              Valuation: <span className="font-bold text-on-surface">{metrics.valuation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail items */}
      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {metrics.leadInvestors && metrics.leadInvestors.length > 0 && (
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider text-[10px] font-bold block mb-1">
              Lead Syndicate / Investors
            </span>
            <div className="text-on-surface font-medium">
              {metrics.leadInvestors.join(', ')}
            </div>
          </div>
        )}

        {metrics.keyPartners && (
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider text-[10px] font-bold block mb-1">
              Infrastructure / Partner Ties
            </span>
            <div className="text-on-surface font-medium">
              {metrics.keyPartners}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
