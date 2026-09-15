'use client';

import React from 'react';

interface CaseStudyFieldsProps {
  totalRaised: string;
  onTotalRaisedChange: (val: string) => void;
  foundedYear: string;
  onFoundedYearChange: (val: string) => void;
  shutdownYear: string;
  onShutdownYearChange: (val: string) => void;
  hqCountry: string;
  onHqCountryChange: (val: string) => void;
  failureReason: string;
  onFailureReasonChange: (val: string) => void;
  disabled?: boolean;
}

export const CaseStudyFields: React.FC<CaseStudyFieldsProps> = ({
  totalRaised,
  onTotalRaisedChange,
  foundedYear,
  onFoundedYearChange,
  shutdownYear,
  onShutdownYearChange,
  hqCountry,
  onHqCountryChange,
  failureReason,
  onFailureReasonChange,
  disabled = false,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/40 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">
            analytics
          </span>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">
              Case Study Autopsy Metrics
            </h3>
            <p className="text-[11px] text-secondary">
              Forensic quantitative data required for startup post-mortem autopsies.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          Required for Case Study
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Raised */}
        <div className="space-y-1.5">
          <label
            htmlFor="total-raised-input"
            className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1"
          >
            <span>Total Raised</span>
            <span className="text-error">*</span>
          </label>
          <input
            id="total-raised-input"
            type="text"
            required
            value={totalRaised}
            onChange={(e) => onTotalRaisedChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. $120 million, $1.75B, or $42.5M"
            className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
          />
          <p className="text-[10px] text-secondary">Formatted value (e.g. $120 million, $1.75B) stored as-is</p>
        </div>

        {/* Founded Year */}
        <div className="space-y-1.5">
          <label
            htmlFor="founded-year-input"
            className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1"
          >
            <span>Founded Year</span>
            <span className="text-error">*</span>
          </label>
          <input
            id="founded-year-input"
            type="number"
            min="1980"
            max="2030"
            required
            value={foundedYear}
            onChange={(e) => onFoundedYearChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 2015"
            className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm font-mono focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
          />
          <p className="text-[10px] text-secondary">Year company was incorporated</p>
        </div>

        {/* Shutdown Year */}
        <div className="space-y-1.5">
          <label
            htmlFor="shutdown-year-input"
            className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1"
          >
            <span>Shutdown Year</span>
            <span className="text-error">*</span>
          </label>
          <input
            id="shutdown-year-input"
            type="number"
            min="1980"
            max="2030"
            required
            value={shutdownYear}
            onChange={(e) => onShutdownYearChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 2023"
            className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm font-mono focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
          />
          <p className="text-[10px] text-secondary">Year operations ceased or liquidated</p>
        </div>

        {/* HQ / Country */}
        <div className="space-y-1.5">
          <label
            htmlFor="hq-country-input"
            className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1"
          >
            <span>HQ / Country</span>
            <span className="text-error">*</span>
          </label>
          <input
            id="hq-country-input"
            type="text"
            required
            value={hqCountry}
            onChange={(e) => onHqCountryChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Seattle, WA, USA"
            className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
          />
          <p className="text-[10px] text-secondary">City, state, or country</p>
        </div>
      </div>

      {/* Failure Reason */}
      <div className="space-y-1.5">
        <label
          htmlFor="failure-reason-input"
          className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1"
        >
          <span>Primary Failure Reason</span>
          <span className="text-error">*</span>
        </label>
        <textarea
          id="failure-reason-input"
          rows={2}
          required
          value={failureReason}
          onChange={(e) => onFailureReasonChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g. Negative unit economics, freight recession, and inability to secure bridge financing after venture debt covenants tripped."
          className="w-full p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors disabled:opacity-60"
        />
        <p className="text-[10px] text-secondary">
          Concise root-cause analysis featured on post-mortem cards and autopsy funnels.
        </p>
      </div>
    </div>
  );
};
