import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30 transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-outline-variant/20">
          {/* Brand & Tagline Column */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Venture Graph Logo"
                className="h-7 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XP8QDymFpqagarXnm65HMbh8X8tFtZWFtrczWEyA1vqfSkrN3ZDVdZx292_TzSYRuaRWHjlCGUTBfeaQryI-xSLhJjW03-FtCRLHAZGUA9S8H0A74T2_koIRN2bSjeJ2R1AIAwkz_WH2HJw2UziWtf01RYu_HRc_bOPE1CBjY8x9GT013sf2A60ij3t73BNec66eZV8XzN5V0AZbawYcmcFP6vavI_jJ-I9w9nURywyEFiUvaBQdi5WZlF"
              />
            </div>
            <p className="font-body-sm text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Startup failure case studies, funding news, and founder playbooks.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                aria-label="LinkedIn"
                className="p-2 rounded bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold"
                href="#"
              >
                LinkedIn
              </a>
              <a
                aria-label="X (Twitter)"
                className="p-2 rounded bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold"
                href="#"
              >
                X
              </a>
              <a
                aria-label="Instagram"
                className="p-2 rounded bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold"
                href="#"
              >
                Instagram
              </a>
              <a
                aria-label="Facebook"
                className="p-2 rounded bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold"
                href="#"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Links Column 1: Company */}
          <div className="md:col-span-3">
            <h4 className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold mb-3">
              Company
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Contact Us
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Editorial Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Legal */}
          <div className="md:col-span-3">
            <h4 className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold mb-3">
              Legal
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Disclaimer
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
          <p>© 2024 Venture Graph. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-on-surface transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
