'use client';

import React, { useState, useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

interface GoogleAnalyticsWrapperProps {
  gaId?: string;
}

/**
 * Gated Google Analytics 4 integration using Next.js official @next/third-parties/google.
 * Strict Cookie Consent: Only activates and renders the GA4 scripts after the visitor
 * clicks "Accept All" ('accepted' stored in 'vg_cookie_consent').
 * If the user chooses "Essential Only" or hasn't consented yet, the GA4 component is not rendered.
 */
export const GoogleAnalyticsWrapper: React.FC<GoogleAnalyticsWrapperProps> = ({ gaId }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check existing consent state on mount
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('vg_cookie_consent');
        setHasConsent(consent === 'accepted');
      } catch {
        setHasConsent(false);
      }
    };

    checkConsent();

    // Listen for consent changes triggered by CookieBanner.tsx
    const handleConsentChange = () => {
      checkConsent();
    };

    window.addEventListener('vg_cookie_consent_updated', handleConsentChange);
    window.addEventListener('storage', handleConsentChange);

    return () => {
      window.removeEventListener('vg_cookie_consent_updated', handleConsentChange);
      window.removeEventListener('storage', handleConsentChange);
    };
  }, []);

  const measurementId = gaId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId || !hasConsent) {
    return null;
  }

  return <GoogleAnalytics gaId={measurementId} />;
};
