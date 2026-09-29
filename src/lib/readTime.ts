import { stripHtml } from './seo';

/**
 * Calculates estimated read time from HTML or markdown text content.
 * Formula: Math.max(1, Math.round(words / 200))
 * Returns `${minutes} min read`.
 * Falls back to fallback string only if content is empty or contains no words.
 */
export function calculateReadTime(
  content: string | null | undefined,
  fallback: string = '5 min read'
): string {
  if (!content) return fallback;
  const plainText = stripHtml(content);
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return fallback;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
