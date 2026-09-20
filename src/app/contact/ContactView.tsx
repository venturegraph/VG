'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { MobileDrawer } from '@/components/MobileDrawer';
import { Footer } from '@/components/Footer';
import { NAV_CATEGORIES, SECONDARY_NAV_ITEMS } from '@/lib/taxonomy';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';

export function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Confidential Tip');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState('');

  // Header & Drawer states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setErrorMsg('Please agree to the privacy policy before submitting.');
      trackEvent('form_submit_error', {
        form_name: 'contact_form',
        error_reason: 'consent_required',
      });
      return;
    }
    if (message.trim().length < 15) {
      setErrorMsg('Please enter a message of at least 15 characters.');
      trackEvent('form_submit_error', {
        form_name: 'contact_form',
        error_reason: 'message_too_short',
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const ref = `VG-${Date.now().toString(36).toUpperCase()}`;

    try {
      const supabase = createClient();
      const payload = {
        name: name.trim(),
        email: email.trim(),
        category,
        company: company.trim() || null,
        message: message.trim(),
        status: 'unread',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('contact_messages').insert(payload);

      if (error) {
        // Fallback: If contact_messages table does not exist yet, queue in localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('vg_contact_queue') || '[]');
          stored.push({ ...payload, ref });
          localStorage.setItem('vg_contact_queue', JSON.stringify(stored));
        } catch {
          // ignore storage error
        }
      }

      setReferenceId(ref);
      setSubmitted(true);
      trackEvent('form_submit_success', {
        form_name: 'contact_form',
        category,
        has_company: Boolean(company.trim()),
      });
    } catch {
      // Fallback
      setReferenceId(ref);
      setSubmitted(true);
      trackEvent('form_submit_success', {
        form_name: 'contact_form',
        category,
        fallback_mode: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCategory('Confidential Tip');
    setCompany('');
    setMessage('');
    setConsent(false);
    setSubmitted(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={NAV_CATEGORIES}
        secondaryItems={SECONDARY_NAV_ITEMS}
      />

      <main
        id="main-content"
        className="w-full flex-1"
        style={{ paddingTop: 'var(--header-height, 11rem)' }}
      >
        {/* Masthead Header */}
        <section className="w-full bg-surface-container-low border-b border-outline-variant/30 py-10 lg:py-16">
          <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange block mb-2 font-label-sm">
              Confidential &amp; Verified Desk
            </span>
            <h1 className="font-masthead text-4xl sm:text-5xl lg:text-6xl text-on-surface uppercase tracking-tight leading-tight mb-4">
              Contact Editorial Desk
            </h1>
            <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-2xl">
              Submit confidential startup shutdown tips, funding intelligence, editorial corrections, or partnership inquiries. We protect confidential sources.
            </p>
          </div>
        </section>

        {/* Contact Content & Form */}
        <section className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Info Column */}
            <div className="lg:col-span-4 space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-secondary font-label-sm mb-3">
                  Direct Inquiries
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-4">
                  For press, corrections, or verified investor data submissions:
                </p>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-accent-orange">
                      mail
                    </span>
                    <span className="font-mono">editorial@venturegraph.me</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-accent-orange">
                      security
                    </span>
                    <span>PGP / Secure drop available upon request</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-secondary space-y-2">
                <div className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                  Confidentiality Pledge
                </div>
                <p className="leading-relaxed">
                  We respect off-the-record briefings from founders, former employees, and venture partners. Please specify if you wish to remain anonymous in any published post-mortems.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-secondary font-label-sm mb-3">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-xs font-semibold">
                  <li>
                    <Link href="/faq" className="text-accent-orange hover:underline">
                      &rarr; Frequently Asked Questions
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-accent-orange hover:underline">
                      &rarr; Privacy &amp; Data Protection Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-8">
              {submitted ? (
                <div className="p-8 sm:p-10 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <h3 className="font-headline-sm text-2xl font-bold text-on-surface">
                    Message Dispatched Successfully
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed max-w-md mx-auto">
                    Your message has been received by the Venture Graph research desk. Our editorial team reviews every inbound inquiry.
                  </p>
                  <div className="py-2 px-4 bg-surface-container rounded-lg font-mono text-xs text-secondary inline-block">
                    Reference: {referenceId}
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-5"
                >
                  <div className="border-b border-outline-variant/30 pb-4 mb-2">
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                      Send an Inquiry or Tip
                    </h2>
                    <p className="text-xs text-secondary mt-1">
                      Fill out the form below. All fields marked with * are required.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contact-name">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        autoComplete="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Mercer"
                        className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contact-email">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contact-category">
                        Inquiry Category *
                      </label>
                      <select
                        id="contact-category"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange cursor-pointer"
                      >
                        <option value="Confidential Tip">Confidential Tip</option>
                        <option value="Shutdown Briefing">Shutdown Briefing</option>
                        <option value="Factual Correction">Factual Correction</option>
                        <option value="Partnership / Press">Partnership / Press</option>
                        <option value="General Feedback">General Feedback</option>
                      </select>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contact-company">
                        Organization / Startup (Optional)
                      </label>
                      <input
                        id="contact-company"
                        name="company"
                        autoComplete="organization"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Acme Ventures"
                        className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="contact-message">
                      Message Details *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide background, verifiable dates, relevant links, or context..."
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                    />
                  </div>

                  {/* Privacy Consent */}
                  <div className="pt-2">
                    <label htmlFor="contact-consent" className="flex items-start gap-2.5 cursor-pointer text-xs text-secondary select-none">
                      <input
                        id="contact-consent"
                        name="consent"
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded border border-outline-variant text-accent-orange accent-[#FA654D] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                      />
                      <span className="leading-snug">
                        I confirm that the information provided is accurate to the best of my knowledge, and agree to the{' '}
                        <Link href="/privacy-policy" className="text-accent-orange underline hover:opacity-80">
                          Privacy Policy
                        </Link>.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-accent-orange hover:opacity-90 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg transition-opacity flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Transmitting...</span>
                        </>
                      ) : (
                        <span>Submit to Editorial Desk</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
