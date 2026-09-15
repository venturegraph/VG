'use client';

import React, { useState } from 'react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="w-full bg-on-secondary-fixed text-on-secondary py-14 lg:py-16" id="newsletter-signup">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="p-8 lg:p-12 rounded-xl bg-surface-container-lowest/5 border border-surface-container-lowest/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="font-label-sm text-xs uppercase tracking-widest text-primary-container font-bold">
              Editorial Dispatch
            </span>
            <h2 className="font-headline-lg text-2xl lg:text-3xl text-surface-container-lowest mt-1 font-semibold">
              Get Venture Graph in Your Inbox
            </h2>
            <p className="font-body-sm text-sm text-secondary-fixed mt-2 leading-relaxed">
              A weekly dispatch covering startup funding rounds, shutdown case studies, and founder lessons.
            </p>
          </div>

          {isSubscribed ? (
            <div className="w-full md:w-auto p-4 rounded-lg bg-primary-container/20 border border-primary-container/40 text-on-primary flex items-center gap-2 font-body-sm text-sm">
              <span className="material-symbols-outlined text-primary-container">check_circle</span>
              <span>Subscribed to the Venture Graph weekly dispatch!</span>
            </div>
          ) : (
            <form
              className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5 shrink-0"
              onSubmit={handleSubmit}
            >
              <input
                aria-label="Email address"
                className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-sm focus:outline-none min-w-[260px] border border-outline-variant/40"
                placeholder="Enter your email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer"
                type="submit"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
