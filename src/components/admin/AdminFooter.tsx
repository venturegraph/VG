import React from 'react';

export function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-outline-variant/30 dark:border-slate-800/80 bg-surface-container-lowest/60 dark:bg-slate-950/60 backdrop-blur-xs py-4 px-4 sm:px-8 transition-colors">
      <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        {/* Left: Branding & Tagline */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
          <span className="font-semibold text-on-surface dark:text-slate-200 tracking-tight">
            Venture Graph CMS v2.0
          </span>
          <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] sm:text-xs">
            Built for High-Performance Editorial Intelligence
          </span>
        </div>

        {/* Right: Operational Status & Copyright */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Status: Operational</span>
          </div>
          <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            &copy; {currentYear}
          </span>
        </div>
      </div>
    </footer>
  );
}
