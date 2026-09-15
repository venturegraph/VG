'use client';

import React, { useState } from 'react';
import { RankMathAnalysisResult, RankMathCheck, ChecklistGroup } from '@/lib/rankMathAnalysis';
import { SnippetEditorModal } from './SnippetEditorModal';

interface RankMathSidebarProps {
  analysis: RankMathAnalysisResult;
  title: string;
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  slug: string;
  onSlugChange: (val: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (val: string) => void;
  focusKeyword: string;
  onFocusKeywordChange: (val: string) => void;
  secondaryKeywords: string[];
  onSecondaryKeywordsChange: (keywords: string[]) => void;
  isDebouncing?: boolean;
}

export const RankMathSidebar: React.FC<RankMathSidebarProps> = ({
  analysis,
  title,
  seoTitle,
  onSeoTitleChange,
  slug,
  onSlugChange,
  metaDescription,
  onMetaDescriptionChange,
  focusKeyword,
  onFocusKeywordChange,
  secondaryKeywords,
  onSecondaryKeywordsChange,
  isDebouncing = false,
}) => {
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basic: false,
    additional: false,
    titleReadability: true,
    contentReadability: true,
  });

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Secondary keyword add/remove handlers
  const handleAddSecondaryKeyword = () => {
    const trimmed = newKeywordInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!secondaryKeywords.includes(trimmed) && trimmed !== focusKeyword.trim().toLowerCase()) {
      onSecondaryKeywordsChange([...secondaryKeywords, trimmed]);
    }
    setNewKeywordInput('');
  };

  const handleRemoveSecondaryKeyword = (keywordToRemove: string) => {
    onSecondaryKeywordsChange(secondaryKeywords.filter((k) => k !== keywordToRemove));
  };

  // Evaluated title for preview
  const evaluatedTitle =
    (seoTitle || '%title% %sep% %sitename%')
      .replace(/%title%/gi, title || 'Sample Headline')
      .replace(/%sep%/gi, '-')
      .replace(/%sitename%/gi, 'Venture Graph');

  const { score, scoreGrade, groups } = analysis;

  const scoreBadgeColors = {
    good: 'bg-emerald-500 text-white shadow-emerald-500/20',
    average: 'bg-amber-500 text-white shadow-amber-500/20',
    poor: 'bg-rose-500 text-white shadow-rose-500/20',
  }[scoreGrade];

  const scoreBorderColor = {
    good: 'border-emerald-500/30 bg-emerald-500/5',
    average: 'border-amber-500/30 bg-amber-500/5',
    poor: 'border-rose-500/30 bg-rose-500/5',
  }[scoreGrade];

  return (
    <div className="space-y-5">
      {/* 1. Header Overall SEO Score Badge Card */}
      <div className={`p-5 rounded-2xl border transition-all ${scoreBorderColor} shadow-xs`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">auto_graph</span>
            <div>
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Rank Math SEO Engine
              </h3>
              <p className="text-[10px] text-secondary">Live Algorithmic Audit</p>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl font-mono text-sm font-bold shadow-sm flex items-center gap-1 ${scoreBadgeColors}`}
            title={`Overall SEO Score: ${score} / 100`}
          >
            <span>{score}</span>
            <span className="text-[10px] opacity-75">/ 100</span>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-500 ${
              scoreGrade === 'good'
                ? 'bg-emerald-500'
                : scoreGrade === 'average'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-secondary">
          <span className="font-semibold">
            {scoreGrade === 'good'
              ? 'Great SEO Optimization'
              : scoreGrade === 'average'
              ? 'Acceptable (Optimization Recommended)'
              : 'Needs Immediate Attention'}
          </span>
          {isDebouncing && (
            <span className="flex items-center gap-1 text-[10px] text-primary">
              <span className="w-2 h-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Google Search Snippet Preview Card */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">visibility</span>
            <span>Snippet Preview</span>
          </span>
          <button
            type="button"
            onClick={() => setIsSnippetModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>Edit Snippet</span>
          </button>
        </div>

        {/* Mini Google SERP Display */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1 font-sans">
          <div className="text-[10px] text-secondary font-mono flex items-center gap-1 truncate">
            <span className="text-on-surface font-semibold">venturegraph.me</span>
            <span>›</span>
            <span>articles</span>
            <span>›</span>
            <span className="truncate">{slug || 'post-slug'}</span>
          </div>

          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate leading-snug">
            {evaluatedTitle}
          </div>

          <div className="text-[11px] text-secondary line-clamp-2 leading-relaxed">
            {metaDescription ||
              'Add a compelling meta description to improve click-through rates from search results...'}
          </div>
        </div>
      </div>

      {/* 3. Focus Keyword & Secondary Keywords Section */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">key</span>
            <span>Keywords</span>
          </span>
        </div>

        {/* Primary Focus Keyword Input */}
        <div className="space-y-1">
          <label className="text-[11px] text-secondary font-medium">Primary Focus Keyword</label>
          <div className="relative">
            <span className="material-symbols-outlined text-amber-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              star
            </span>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => onFocusKeywordChange(e.target.value)}
              placeholder="e.g. fast checkout"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs focus:outline-hidden focus:border-primary transition-colors font-medium"
            />
          </div>
        </div>

        {/* Keyword Chips List */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] text-secondary font-medium">Active Keywords</label>
          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
            {focusKeyword.trim() ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <span className="material-symbols-outlined text-[13px] text-amber-500">star</span>
                <span>{focusKeyword.trim()}</span>
              </span>
            ) : (
              <span className="text-[11px] text-secondary italic">No primary keyword set</span>
            )}

            {secondaryKeywords.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-container text-on-surface border border-outline-variant/30"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSecondaryKeyword(tag)}
                  className="hover:text-error transition-colors cursor-pointer"
                  title={`Remove ${tag}`}
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Add Secondary Keyword Input */}
        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleAddSecondaryKeyword();
              }
            }}
            placeholder="Add secondary keyword..."
            className="grow h-8 px-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-xs focus:outline-hidden focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={handleAddSecondaryKeyword}
            disabled={!newKeywordInput.trim()}
            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* 4. Analysis Checklists (4 Collapsible Sections) */}
      <div className="space-y-2.5">
        {/* Section 1: Basic SEO */}
        <ChecklistSectionCard
          group={groups.basic}
          isCollapsed={collapsedSections.basic}
          onToggle={() => toggleSection('basic')}
        />

        {/* Section 2: Additional */}
        <ChecklistSectionCard
          group={groups.additional}
          isCollapsed={collapsedSections.additional}
          onToggle={() => toggleSection('additional')}
        />

        {/* Section 3: Title Readability */}
        <ChecklistSectionCard
          group={groups.titleReadability}
          isCollapsed={collapsedSections.titleReadability}
          onToggle={() => toggleSection('titleReadability')}
        />

        {/* Section 4: Content Readability */}
        <ChecklistSectionCard
          group={groups.contentReadability}
          isCollapsed={collapsedSections.contentReadability}
          onToggle={() => toggleSection('contentReadability')}
        />
      </div>

      {/* Snippet Editor Modal */}
      <SnippetEditorModal
        isOpen={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
        title={title}
        seoTitle={seoTitle}
        onSeoTitleChange={onSeoTitleChange}
        slug={slug}
        onSlugChange={onSlugChange}
        metaDescription={metaDescription}
        onMetaDescriptionChange={onMetaDescriptionChange}
      />
    </div>
  );
};

// Sub-component: Collapsible Checklist Section Card
const ChecklistSectionCard: React.FC<{
  group: ChecklistGroup;
  isCollapsed: boolean;
  onToggle: () => void;
}> = ({ group, isCollapsed, onToggle }) => {
  const isAllGood = group.passCount === group.totalCount;
  const errorCount = group.checks.filter((c) => c.status === 'fail').length;

  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-xs">
      {/* Section Header Button */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3.5 flex items-center justify-between gap-2 hover:bg-surface-container-low transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
            {group.title}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              isAllGood
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : errorCount > 0
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
            }`}
          >
            {isAllGood ? 'All Good' : errorCount > 0 ? `${errorCount} Errors` : `${group.checks.length - group.passCount} Warnings`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-secondary">
          <span className="text-[11px] font-mono">
            {group.passCount}/{group.totalCount}
          </span>
          <span
            className={`material-symbols-outlined text-base transition-transform duration-200 ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Checklist Items */}
      {!isCollapsed && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-outline-variant/20">
          {group.checks.map((check) => (
            <ChecklistItem key={check.id} check={check} />
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component: Individual Checklist Line Item with Tooltip
const ChecklistItem: React.FC<{ check: RankMathCheck }> = ({ check }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const iconInfo = {
    pass: { icon: 'check_circle', color: 'text-emerald-500' },
    warning: { icon: 'warning', color: 'text-amber-500' },
    fail: { icon: 'cancel', color: 'text-rose-500' },
  }[check.status];

  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <div className="flex items-start gap-2 flex-1">
        <span className={`material-symbols-outlined text-[15px] shrink-0 mt-0.5 ${iconInfo.color}`}>
          {iconInfo.icon}
        </span>
        <div className="space-y-0.5">
          <div className="text-on-surface font-medium leading-snug">{check.label}</div>
          <div className="text-[11px] text-secondary leading-snug">{check.message}</div>
        </div>
      </div>

      {/* Tooltip trigger */}
      <div className="relative shrink-0 mt-0.5">
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((prev) => !prev)}
          className="text-secondary/70 hover:text-on-surface transition-colors cursor-help p-0.5"
          title={check.tooltip}
        >
          <span className="material-symbols-outlined text-[14px]">help_outline</span>
        </button>

        {showTooltip && (
          <div className="absolute right-0 bottom-full mb-1.5 w-52 p-2 rounded-xl bg-surface-container-highest text-on-surface text-[10px] shadow-lg border border-outline-variant/30 z-30 pointer-events-none animate-fadeIn leading-relaxed">
            {check.tooltip}
          </div>
        )}
      </div>
    </div>
  );
};
