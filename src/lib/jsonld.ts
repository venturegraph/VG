/**
 * Structured data generators for Schema.org JSON-LD tags.
 */

export interface ArticleJsonLdParams {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  siteUrl: string;
  schemaType?: 'Article' | 'NewsArticle' | 'TechArticle' | 'FAQPage' | string | null;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateArticleJsonLd({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  updatedAt,
  siteUrl,
  schemaType,
}: ArticleJsonLdParams) {
  const chosenType = schemaType || 'Article';
  return {
    '@context': 'https://schema.org',
    '@type': chosenType,
    headline: title,
    description: description,
    image: imageUrl ? [imageUrl] : [`${siteUrl}/icon.png`],
    datePublished: publishedAt || undefined,
    dateModified: updatedAt || publishedAt || undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Organization',
      name: 'Venture Graph',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Venture Graph',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.png`,
      },
    },
  };
}

/**
 * Export alias for generateArticleJsonLd supporting dynamic Schema.org types
 */
export const generateArticleSchema = generateArticleJsonLd;

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Safely serializes JSON-LD by escaping '<' characters to prevent script injection
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
