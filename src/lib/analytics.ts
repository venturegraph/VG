import { sendGAEvent } from '@next/third-parties/google';

/**
 * Checks if the user has explicitly accepted analytics cookies.
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('vg_cookie_consent') === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Fires a custom Google Analytics 4 event only if analytics consent has been granted.
 * Respects the user's choice from CookieBanner (only fires when 'accepted').
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  try {
    // If gtag was initialized by @next/third-parties/google, call it directly
    if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, eventParams);
      return;
    }

    // Fallback to sendGAEvent from @next/third-parties/google
    sendGAEvent('event', eventName, eventParams || {});
  } catch (err) {
    // Silently ignore tracking errors in offline/strict privacy browser modes
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GA4 Event Skipped/Error]', err);
    }
  }
}
