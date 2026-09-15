export interface DensityEvaluation {
  density: number;
  matches: number;
  words: number;
  color: 'green' | 'yellow' | 'red' | 'gray';
  label: string;
  message: string;
}

export function escapeRegex(string: string): string {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function stripHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Exact keyword density calculation:
 * words = plainText.trim().split(/\s+/).length
 * matches = plainText.match(new RegExp(`\b${escapeRegex(keyword)}\b`, 'gi'))?.length ?? 0
 * density = (matches / words) * 100
 *
 * Thresholds:
 * - Green: 0.5%–2%
 * - Yellow: 2%–3% or under 0.5% but keyword present at least once
 * - Red: over 3%, or 0 occurrences with content over ~100 words
 */
export function calculateDensity(content: string, keyword: string): number {
  const plainText = stripHtml(content);
  const trimmed = plainText.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const cleanKeyword = (keyword || '').trim();
  if (!cleanKeyword || words === 0) return 0;

  try {
    const regex = new RegExp(`\\b${escapeRegex(cleanKeyword)}\\b`, 'gi');
    const matches = plainText.match(regex)?.length ?? 0;
    return (matches / words) * 100;
  } catch {
    return 0;
  }
}

export function evaluateDensity(content: string, keyword: string): DensityEvaluation {
  const plainText = stripHtml(content);
  const trimmed = plainText.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const cleanKeyword = (keyword || '').trim();

  if (!cleanKeyword) {
    return {
      density: 0,
      matches: 0,
      words,
      color: 'gray',
      label: 'No Keyword',
      message: 'Enter a focus keyword to track live keyword density.',
    };
  }

  if (words === 0) {
    return {
      density: 0,
      matches: 0,
      words: 0,
      color: 'gray',
      label: 'No Content',
      message: 'Write article content to measure keyword presence.',
    };
  }

  let matches = 0;
  try {
    const regex = new RegExp(`\\b${escapeRegex(cleanKeyword)}\\b`, 'gi');
    matches = content.match(regex)?.length ?? 0;
  } catch {
    matches = 0;
  }

  const rawDensity = (matches / words) * 100;
  const density = Math.round(rawDensity * 100) / 100;

  // Threshold rules:
  // Red: over 3%, or 0 occurrences with content over ~100 words
  // Green: 0.5%–2%
  // Yellow: 2%–3% or under 0.5% but keyword present at least once
  if (density > 3.0) {
    return {
      density,
      matches,
      words,
      color: 'red',
      label: 'High Density (>3%)',
      message: `Density is ${density}%. Risk of search engine keyword stuffing penalties.`,
    };
  }

  if (matches === 0 && words > 100) {
    return {
      density: 0,
      matches: 0,
      words,
      color: 'red',
      label: 'Missing Keyword',
      message: `0 occurrences in ${words} words. Focus keyword is missing from body content.`,
    };
  }

  if (density >= 0.5 && density <= 2.0) {
    return {
      density,
      matches,
      words,
      color: 'green',
      label: 'Optimal (0.5%–2%)',
      message: `Optimal density (${density}%). ${matches} mentions across ${words} words.`,
    };
  }

  if ((density > 2.0 && density <= 3.0) || (density < 0.5 && matches > 0)) {
    return {
      density,
      matches,
      words,
      color: 'yellow',
      label: density > 2.0 ? 'Elevated (2%–3%)' : 'Low (<0.5%)',
      message:
        density > 2.0
          ? `Density is ${density}%. Nearing the upper limit — avoid adding more.`
          : `Density is ${density}%. Mention the keyword a few more times for better rank impact.`,
    };
  }

  // 0 matches but words <= 100
  return {
    density: 0,
    matches: 0,
    words,
    color: 'yellow',
    label: '0 Mentions',
    message: 'Add the focus keyword naturally as you expand your draft.',
  };
}

/**
 * Slugify on blur: transforms title to url-safe kebab case
 */
export function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
