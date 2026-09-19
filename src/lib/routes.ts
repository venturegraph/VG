/**
 * Centralized canonical path resolver for published posts.
 */
export function getCanonicalPostPath(
  contentType: string | null | undefined,
  slug: string
): string {
  if (contentType === 'case_study') {
    return `/articles/${slug}`;
  }
  if (contentType === 'lessons_hub' || contentType === 'lessons') {
    return `/lessons/${slug}`;
  }
  return `/news/${slug}`;
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
