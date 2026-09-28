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
