'use client';

import React, { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-secondary text-xs gap-2">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span>Loading markdown editor...</span>
    </div>
  ),
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onWordCountChange?: (words: number) => void;
  isDarkMode?: boolean;
  minHeight?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onWordCountChange,
  isDarkMode = false,
  minHeight = 440,
}) => {
  // Compute plain-text metrics
  const { wordCount, lineCount, readingTimeMinutes } = useMemo(() => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { wordCount: 0, lineCount: 0, readingTimeMinutes: 0 };
    }
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const lines = value.split('\n').length;
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 225));
    return { wordCount: words, lineCount: lines, readingTimeMinutes };
  }, [value]);

  // Expose word count to parent
  useEffect(() => {
    if (onWordCountChange) {
      onWordCountChange(wordCount);
    }
  }, [wordCount, onWordCountChange]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
          <span>Post Content (Markdown)</span>
          <span className="text-error">*</span>
        </label>
        <div className="flex items-center gap-3 text-xs text-secondary font-mono">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>~{readingTimeMinutes} min read</span>
        </div>
      </div>

      <div
        data-color-mode={isDarkMode ? 'dark' : 'light'}
        className="w-full rounded-xl overflow-hidden border border-outline-variant/40 focus-within:border-primary transition-all shadow-xs"
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          height={minHeight}
          preview="live"
          className="!bg-surface-container-lowest !text-on-surface"
          textareaProps={{
            placeholder:
              '# Executive Summary\n\nProvide the forensic autopsy or dispatch breakdown here...\n\n## Timeline of Collapse\n- **Q1 2023**: Series B runway contract\n- **Q3 2023**: Customer churn acceleration\n\n> "Unit economics were unviable from day one."',
          }}
        />
      </div>
      <p className="text-[11px] text-secondary flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">info</span>
        <span>Full GitHub-Flavored Markdown supported: tables, callouts, bold, links, code blocks.</span>
      </p>
    </div>
  );
};
