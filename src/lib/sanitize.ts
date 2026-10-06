import sanitizeHtml from 'sanitize-html';

/**
 * Shared sanitize-html configuration for server-side HTML sanitization.
 * Matches the previous isomorphic-dompurify settings:
 *   USE_PROFILES: { html: true }
 *   ADD_TAGS: ['iframe']
 *   ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'frameborder', 'data-type',
 *              'loading', 'style', 'width', 'height', 'id', 'class']
 */
export const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'iframe', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'figure', 'figcaption', 'video', 'source', 'picture',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'id', 'style', 'data-type'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'style'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'title', 'style'],
  },
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'www.google.com'],
};

/**
 * Sanitize an HTML string on the server side (no DOM/jsdom required).
 * Use this in server components, API routes, and anywhere `window` is unavailable.
 */
export function serverSanitizeHtml(dirty: string): string {
  return sanitizeHtml(dirty, SANITIZE_OPTIONS);
}

/**
 * Strips redundant embedded Table of Contents blocks from HTML content
 * (e.g. Tiptap tableOfContents nodes, WordPress ez-toc, wp-block-table-of-contents, rank-math-toc-block)
 * so that only the dedicated, interactive <ArticleTableOfContents /> component renders above the article body.
 */
export function stripEmbeddedTableOfContents(html: string): string {
  if (!html) return '';

  let cleaned = html;

  // Pattern matching start of TOC container
  const tocStartRegex = /<(div|nav|aside|section)[^>]*?(?:data-type=["']table-of-contents["']|class=["'][^"']*\b(?:toc-container|wp-block-table-of-contents|ez-toc-container|toc_container|rank-math-toc-block|schema-faq-toc)\b|id=["'](?:ez-toc-container|toc_container)["'])[^>]*>/i;

  let match = tocStartRegex.exec(cleaned);
  let iterations = 0;
  while (match && iterations < 50) {
    iterations++;
    const startIndex = match.index;
    const tag = match[1].toLowerCase();
    const openTag = `<${tag}`;
    const closeTag = `</${tag}>`;

    // Find matching close tag taking nesting into account
    let depth = 1;
    let currentIndex = startIndex + match[0].length;
    while (depth > 0 && currentIndex < cleaned.length) {
      const nextOpen = cleaned.toLowerCase().indexOf(openTag, currentIndex);
      const nextClose = cleaned.toLowerCase().indexOf(closeTag, currentIndex);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        currentIndex = nextOpen + openTag.length;
      } else {
        depth--;
        currentIndex = nextClose + closeTag.length;
      }
    }

    if (depth === 0) {
      // Also consume optional following empty <p></p>
      let endIndex = currentIndex;
      const afterMatch = cleaned.slice(endIndex);
      const emptyP = /^\s*<p>\s*<\/p>/i.exec(afterMatch);
      if (emptyP) {
        endIndex += emptyP[0].length;
      }
      cleaned = cleaned.slice(0, startIndex) + cleaned.slice(endIndex);
    } else {
      cleaned = cleaned.replace(match[0], '');
    }

    match = tocStartRegex.exec(cleaned);
  }

  return cleaned;
}

