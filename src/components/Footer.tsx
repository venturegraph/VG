import React from 'react';
import Link from 'next/link';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';

// Build a flat list of Index Coverage links from real taxonomy data:
// — all NAV_CATEGORIES parent items (each child becomes a link)
// — all SECONDARY_NAV_ITEMS (standalone editorial sections)
const INDEX_COVERAGE = [
  ...SECONDARY_NAV_ITEMS.map((item) => ({ label: item.label, href: item.href })),
  ...NAV_CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({ label: item.name, href: item.href }))
  ),
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-dark text-white border-t-4 border-accent-orange mt-16">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 pt-12 pb-10">

        {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-b border-white/10 pb-12">

          {/* Column 1: Brand, tagline, social icons — lg:col-span-4 */}
          <div className="lg:col-span-4 space-y-4">
            {/* Wordmark */}
            <Link href="/" className="inline-block group">
              <span className="font-masthead text-4xl sm:text-5xl text-white tracking-tight uppercase select-none group-hover:opacity-90 transition-opacity leading-none">
                VENTURE{' '}GRAPH
              </span>
            </Link>

            {/* Tagline — using real site copy, not Stitch placeholder */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent-orange">
              The Startup Mortality &amp; Capital Index
            </p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md font-normal">
              Startup failure case studies, funding news, and founder playbooks.
            </p>

            {/* Social Icons — X, LinkedIn, Instagram, Facebook */}
            <div className="flex items-center gap-4 pt-2 text-gray-400">
              {/* X / Twitter */}
              <a
                href="#"
                aria-label="X (Twitter)"
                title="X / Twitter"
                className="hover:text-accent-orange transition-colors p-1"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="hover:text-accent-orange transition-colors p-1"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                title="Instagram"
                className="hover:text-accent-orange transition-colors p-1"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                title="Facebook"
                className="hover:text-accent-orange transition-colors p-1"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Index Coverage — populated from real taxonomy */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange mb-4">
              Index Coverage
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-white uppercase tracking-wider">
              {INDEX_COVERAGE.slice(0, 8).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-accent-orange transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-white uppercase tracking-wider">
              <li>
                <Link href="/faq" className="hover:text-accent-orange transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent-orange transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-accent-orange transition-colors">
                  Editorial Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-white uppercase tracking-wider">
              <li>
                <Link href="/privacy-policy" className="hover:text-accent-orange transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-accent-orange transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-accent-orange transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-accent-orange transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-accent-orange transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── COPYRIGHT BAR ─────────────────────────────────────────────────── */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] text-gray-400">
          <div className="space-y-1">
            <p className="font-medium text-white tracking-wider">
              © {currentYear} Venture Graph. All rights reserved.
            </p>
            <p className="text-gray-500 max-w-2xl leading-normal">
              Market intelligence compiled from public filings, court records, and verified direct reporting. Not financial or investment advice.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
