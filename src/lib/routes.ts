/**
 * Centralized canonical path resolver for published posts.
 */
/**
 * Returns the URL path prefix segment (without slashes) for a given content type.
 */
export function getRoutePrefix(contentType: string | null | undefined): string {
  if (contentType === 'case_study') {
    return 'articles';
  }
  if (contentType === 'lessons_hub' || contentType === 'lessons') {
    return 'lessons';
  }
  return 'news';
}

export function getCanonicalPostPath(
  contentType: string | null | undefined,
  slug: string
): string {
  const prefix = getRoutePrefix(contentType);
  const cleanSlug = slug.replace(/^\/+/, '');
  return `/${prefix}/${cleanSlug}`;
}

export function isCaseStudy(contentType: string | null | undefined): boolean {
  return contentType === 'case_study';
}

export function isLesson(contentType: string | null | undefined): boolean {
  return contentType === 'lessons_hub' || contentType === 'lessons';
}

export function isNews(contentType: string | null | undefined): boolean {
  return !isCaseStudy(contentType) && !isLesson(contentType);
}
