import { JSONContent } from '@tiptap/react';

export interface RankMathCheck {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  tooltip: string;
  scoreWeight: number;
}

export interface ChecklistGroup {
  id: 'basic' | 'additional' | 'titleReadability' | 'contentReadability';
  title: string;
  checks: RankMathCheck[];
  passCount: number;
  totalCount: number;
  hasErrors: boolean;
}

export interface RankMathAnalysisResult {
  score: number; // 0 - 100
  scoreGrade: 'good' | 'average' | 'poor'; // green (80+), orange (50-79), red (<50)
  groups: {
    basic: ChecklistGroup;
    additional: ChecklistGroup;
    titleReadability: ChecklistGroup;
    contentReadability: ChecklistGroup;
  };
  metrics: {
    wordCount: number;
    keywordMatches: number;
    keywordDensity: number;
    headingCount: number;
    headingsWithKeyword: number;
    imageCount: number;
    imagesWithAltKeyword: number;
    internalLinkCount: number;
    externalLinkCount: number;
    paragraphCount: number;
    longParagraphCount: number;
    hasToc: boolean;
  };
}

export interface AnalysisInput {
  title: string;
  seoTitle?: string;
  slug: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords?: string[];
  doc: JSONContent | null;
  plainText?: string;
}

// Curated Power Words for Title Readability
const POWER_WORDS = [
  'ultimate', 'essential', 'proven', 'shocking', 'secret', 'definitive',
  'forensic', 'autopsy', 'brutal', 'uncovered', 'revealed', 'insider',
  'critical', 'catastrophic', 'untold', 'hidden', 'mastery', 'breakthrough',
  'collapse', 'lessons', 'playbook', 'disaster', 'warning', 'rules', 'truth'
];

// Sentiment Lexicon
const POSITIVE_SENTIMENT = [
  'best', 'top', 'growth', 'win', 'success', 'breakthrough', 'genius',
  'lead', 'profit', 'secret', 'mastery', 'great', 'revolution', 'scale',
  'billion', 'unicorn', 'masterclass', 'thrive'
];

const NEGATIVE_SENTIMENT = [
  'collapse', 'failure', 'crash', 'failed', 'died', 'ruin', 'bankruptcy',
  'scandal', 'loss', 'warning', 'dead', 'mistake', 'burn', 'downfall',
  'crisis', 'wreckage', 'meltdown', 'shutdown', 'fall'
];

/**
 * Traverses a Tiptap / ProseMirror JSONContent tree to collect structured document metrics.
 */
export function traverseTiptapDocument(doc: JSONContent | null) {
  let plainText = '';
  const headings: { level: number; text: string }[] = [];
  const images: { src: string; alt: string }[] = [];
  const links: { href: string; text: string; isInternal: boolean }[] = [];
  const paragraphs: { text: string; wordCount: number }[] = [];
  let hasToc = false;

  if (!doc) {
    return {
      plainText: '',
      headings,
      images,
      links,
      paragraphs,
      hasToc: false,
    };
  }

  function walk(node: JSONContent) {
    if (!node) return;

    // Check for TOC block
    if (
      node.attrs?.['data-type'] === 'table-of-contents' ||
      (typeof node.attrs?.class === 'string' && node.attrs.class.includes('toc-'))
    ) {
      hasToc = true;
    }

    // Node Type: Heading (H2, H3, H4)
    if (node.type === 'heading') {
      const level = node.attrs?.level || 2;
      const headingText = extractText(node);
      headings.push({ level, text: headingText });
    }

    // Node Type: Image
    if (node.type === 'image') {
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      images.push({ src, alt });
    }

    // Node Type: Paragraph
    if (node.type === 'paragraph') {
      const pText = extractText(node);
      const words = pText.trim() ? pText.trim().split(/\s+/).filter(Boolean).length : 0;
      paragraphs.push({ text: pText, wordCount: words });
    }

    // Check for Link Marks on text nodes
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'link' && mark.attrs?.href) {
          const href = mark.attrs.href.trim();
          const linkText = node.text || '';
          const isInternal = isInternalLink(href);
          links.push({ href, text: linkText, isInternal });
        }
      }
    }

    // Accumulate plain text
    if (node.text) {
      plainText += node.text;
    }

    // Recurse children
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child);
      }
      if (node.type === 'paragraph' || node.type === 'heading') {
        plainText += '\n';
      }
    }
  }

  walk(doc);

  return {
    plainText: plainText.trim(),
    headings,
    images,
    links,
    paragraphs,
    hasToc,
  };
}

function extractText(node: JSONContent): string {
  let str = '';
  if (node.text) {
    str += node.text;
  }
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      str += extractText(child);
    }
  }
  return str.trim();
}

/**
 * Domain check: venturegraph.me is the internal domain.
 * Internal links: relative paths, anchor hashes, or venturegraph.me domains.
 */
export function isInternalLink(href: string): boolean {
  if (!href) return false;
  const clean = href.trim().toLowerCase();
  if (clean.startsWith('/') || clean.startsWith('#')) return true;
  if (clean.includes('venturegraph.me')) return true;
  return false;
}

export function isExternalLink(href: string): boolean {
  if (!href) return false;
  const clean = href.trim().toLowerCase();
  if (isInternalLink(clean)) return false;
  return clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('//');
}

/**
 * Main Rank Math SEO Analysis Function.
 * Runs 19 distinct tests across 4 categories and computes an aggregate score (0-100).
 */
export function analyzeRankMathSEO(input: AnalysisInput): RankMathAnalysisResult {
  const {
    title = '',
    seoTitle = '',
    slug = '',
    metaDescription = '',
    focusKeyword = '',
    doc = null,
  } = input;

  // 1. Traverse document structure
  const traversal = traverseTiptapDocument(doc);
  const plainText = input.plainText || traversal.plainText;
  const words = plainText.trim() ? plainText.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const effectiveTitle = (seoTitle || title || '').trim();
  const cleanKeyword = focusKeyword.trim().toLowerCase();
  const keywordRegex = cleanKeyword ? new RegExp(`\\b${cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') : null;

  // Keyword match counts
  let keywordMatches = 0;
  if (keywordRegex && plainText) {
    const matched = plainText.match(new RegExp(keywordRegex, 'gi'));
    keywordMatches = matched ? matched.length : 0;
  }

  const keywordDensity = wordCount > 0 ? (keywordMatches / wordCount) * 100 : 0;

  // ---------------------------------------------------------------------------
  // GROUP 1: BASIC SEO (6 Checks)
  // ---------------------------------------------------------------------------
  const basicChecks: RankMathCheck[] = [];

  // 1.1 Focus keyword in SEO Title
  const hasKwInTitle = cleanKeyword && effectiveTitle ? keywordRegex!.test(effectiveTitle) : false;
  basicChecks.push({
    id: 'basic-kw-in-title',
    label: 'Focus Keyword in SEO Title',
    status: !cleanKeyword ? 'fail' : hasKwInTitle ? 'pass' : 'fail',
    message: !cleanKeyword
      ? 'Add a focus keyword to evaluate title optimization.'
      : hasKwInTitle
      ? 'Focus keyword appears in the SEO title.'
      : 'Focus keyword does not appear in the SEO title.',
    tooltip: 'Search engines give significant weight to pages with the target keyword in the HTML title.',
    scoreWeight: 10,
  });

  // 1.2 Focus keyword in Meta Description
  const hasKwInMeta = cleanKeyword && metaDescription ? keywordRegex!.test(metaDescription) : false;
  basicChecks.push({
    id: 'basic-kw-in-meta',
    label: 'Focus Keyword in Meta Description',
    status: !cleanKeyword ? 'fail' : hasKwInMeta ? 'pass' : 'fail',
    message: !cleanKeyword
      ? 'Add a focus keyword to evaluate meta description.'
      : hasKwInMeta
      ? 'Focus keyword appears in the meta description snippet.'
      : 'Focus keyword is missing from the meta description snippet.',
    tooltip: 'A matching focus keyword is bolded in Google search snippets, improving organic click-through rate.',
    scoreWeight: 8,
  });

  // 1.3 Focus keyword in URL / Slug
  const cleanSlug = slug.toLowerCase();
  const keywordSlug = cleanKeyword.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const hasKwInSlug = cleanKeyword && cleanSlug ? (cleanSlug.includes(keywordSlug) || (keywordRegex ? keywordRegex.test(cleanSlug.replace(/-/g, ' ')) : false)) : false;
  basicChecks.push({
    id: 'basic-kw-in-slug',
    label: 'Focus Keyword in Permalink (URL)',
    status: !cleanKeyword ? 'fail' : hasKwInSlug ? 'pass' : 'fail',
    message: !cleanKeyword
      ? 'Add a focus keyword to check permalink.'
      : hasKwInSlug
      ? 'Focus keyword is used in the URL slug.'
      : 'Focus keyword is missing from the URL slug.',
    tooltip: 'Short, keyword-relevant URLs perform better in search rankings and user trust.',
    scoreWeight: 8,
  });

  // 1.4 Focus keyword in the first 10% of content
  const first10PercentWordLimit = Math.max(25, Math.ceil(wordCount * 0.1));
  const first10PercentText = words.slice(0, first10PercentWordLimit).join(' ');
  const hasKwInFirst10 = cleanKeyword && first10PercentText ? keywordRegex!.test(first10PercentText) : false;
  basicChecks.push({
    id: 'basic-kw-in-intro',
    label: 'Focus Keyword in the first 10% of content',
    status: !cleanKeyword ? 'fail' : hasKwInFirst10 ? 'pass' : 'fail',
    message: !cleanKeyword
      ? 'Set focus keyword to test introduction.'
      : hasKwInFirst10
      ? 'Focus keyword appears in the first 10% of your article.'
      : 'Focus keyword does not appear in the first 10% of content.',
    tooltip: 'Search spiders expect the core topic to be introduced immediately in the opening paragraphs.',
    scoreWeight: 7,
  });

  // 1.5 Focus keyword found in content at least once
  const hasKwInBody = keywordMatches > 0;
  basicChecks.push({
    id: 'basic-kw-in-content',
    label: 'Focus Keyword in content body',
    status: !cleanKeyword ? 'fail' : hasKwInBody ? 'pass' : 'fail',
    message: !cleanKeyword
      ? 'Add a focus keyword to test body occurrences.'
      : hasKwInBody
      ? `Focus keyword found ${keywordMatches} time${keywordMatches === 1 ? '' : 's'} in content.`
      : 'Focus keyword was not found anywhere in the body text.',
    tooltip: 'Your target keyword must appear in the text to signal topical relevance to search algorithms.',
    scoreWeight: 7,
  });

  // 1.6 Content word count check (600+ words optimal)
  const isWordCountOptimal = wordCount >= 600;
  const isWordCountAverage = wordCount >= 300 && wordCount < 600;
  basicChecks.push({
    id: 'basic-word-count',
    label: 'Content Word Count',
    status: isWordCountOptimal ? 'pass' : isWordCountAverage ? 'warning' : 'fail',
    message: isWordCountOptimal
      ? `Good job! Content is ${wordCount} words long.`
      : isWordCountAverage
      ? `Acceptable length (${wordCount} words). 600+ words recommended for detailed autopsies.`
      : `Content is only ${wordCount} words. We recommend at least 600 words for competitive indexing.`,
    tooltip: 'Comprehensive long-form analysis correlates with higher search visibility and user dwell time.',
    scoreWeight: 8,
  });

  // ---------------------------------------------------------------------------
  // GROUP 2: ADDITIONAL (6 Checks)
  // ---------------------------------------------------------------------------
  const additionalChecks: RankMathCheck[] = [];

  // 2.1 Focus keyword in subheadings (H2, H3, H4)
  const headingsWithKeyword = traversal.headings.filter((h) =>
    cleanKeyword ? (keywordRegex ? keywordRegex.test(h.text) : false) : false
  ).length;
  const hasKwInSubheading = headingsWithKeyword > 0;
  additionalChecks.push({
    id: 'add-kw-in-subheadings',
    label: 'Focus Keyword in Subheadings',
    status: !cleanKeyword ? 'fail' : hasKwInSubheading ? 'pass' : 'fail',
    message: !cleanKeyword
      ? 'Set focus keyword to check subheadings.'
      : hasKwInSubheading
      ? `Focus keyword found in ${headingsWithKeyword} subheading${headingsWithKeyword === 1 ? '' : 's'}.`
      : 'Focus keyword not found in any H2, H3, or H4 subheading.',
    tooltip: 'Subheadings structure your autopsy and help search engines understand core topical sub-themes.',
    scoreWeight: 6,
  });

  // 2.2 Focus keyword in Image Alt attribute
  const imagesWithAltKeyword = traversal.images.filter((img) =>
    cleanKeyword ? (keywordRegex ? keywordRegex.test(img.alt) : false) : false
  ).length;
  const hasKwInImageAlt = imagesWithAltKeyword > 0;
  additionalChecks.push({
    id: 'add-kw-in-image-alt',
    label: 'Focus Keyword in Image Alt Attribute',
    status: traversal.images.length === 0 ? 'warning' : hasKwInImageAlt ? 'pass' : 'fail',
    message: traversal.images.length === 0
      ? 'No images detected. Add an image with keyword in alt text.'
      : hasKwInImageAlt
      ? `Focus keyword found in ${imagesWithAltKeyword} image alt text${imagesWithAltKeyword === 1 ? '' : 's'}.`
      : 'Focus keyword missing from all image alt attributes.',
    tooltip: 'Accessible alt text containing the focus keyword helps image search and accessibility compliance.',
    scoreWeight: 5,
  });

  // 2.3 Keyword Density check (~1% to 2.5%)
  let densityStatus: 'pass' | 'warning' | 'fail' = 'fail';
  let densityMessage = '';
  if (keywordDensity >= 1.0 && keywordDensity <= 2.5) {
    densityStatus = 'pass';
    densityMessage = `Optimal density: ${keywordDensity.toFixed(2)}% (${keywordMatches} matches in ${wordCount} words).`;
  } else if ((keywordDensity >= 0.5 && keywordDensity < 1.0) || (keywordDensity > 2.5 && keywordDensity <= 3.0)) {
    densityStatus = 'warning';
    densityMessage = `Density is ${keywordDensity.toFixed(2)}%. Target range is 1.0%–2.5%.`;
  } else if (keywordDensity > 3.0) {
    densityStatus = 'fail';
    densityMessage = `Density is ${keywordDensity.toFixed(2)}% (too high). Risk of keyword stuffing penalty.`;
  } else {
    densityStatus = 'fail';
    densityMessage = `Density is ${keywordDensity.toFixed(2)}%. Target keyword occurs too rarely.`;
  }
  additionalChecks.push({
    id: 'add-keyword-density',
    label: 'Keyword Density',
    status: densityStatus,
    message: densityMessage,
    tooltip: 'Keyword density between 1% and 2.5% signals strong relevance without triggering spam filters.',
    scoreWeight: 7,
  });

  // 2.4 URL / Slug Length check (<= 75 chars)
  const isSlugLengthOptimal = cleanSlug.length <= 75;
  additionalChecks.push({
    id: 'add-slug-length',
    label: 'Permalink Length (URL)',
    status: isSlugLengthOptimal ? 'pass' : 'warning',
    message: isSlugLengthOptimal
      ? `Slug is ${cleanSlug.length} characters (optimal).`
      : `Slug is ${cleanSlug.length} characters long. We recommend under 75 characters.`,
    tooltip: 'Concise permalinks are easier to read, share, and index across desktop and mobile SERPs.',
    scoreWeight: 5,
  });

  // 2.5 External Link present (outside venturegraph.me)
  const externalLinks = traversal.links.filter((l) => isExternalLink(l.href));
  const hasExternalLink = externalLinks.length > 0;
  additionalChecks.push({
    id: 'add-external-links',
    label: 'External Links to Authoritative Sources',
    status: hasExternalLink ? 'pass' : 'fail',
    message: hasExternalLink
      ? `Found ${externalLinks.length} external citation link${externalLinks.length === 1 ? '' : 's'}.`
      : 'Add at least one external link to cite primary SEC or news sources.',
    tooltip: 'Citing external primary sources enhances content authority and E-E-A-T trustworthiness.',
    scoreWeight: 6,
  });

  // 2.6 Internal Link present (pointing to venturegraph.me)
  const internalLinks = traversal.links.filter((l) => l.isInternal);
  const hasInternalLink = internalLinks.length > 0;
  additionalChecks.push({
    id: 'add-internal-links',
    label: 'Internal Links to Venture Graph Intelligence',
    status: hasInternalLink ? 'pass' : 'fail',
    message: hasInternalLink
      ? `Found ${internalLinks.length} internal link${internalLinks.length === 1 ? '' : 's'} to venturegraph.me content.`
      : 'Add at least one internal link connecting this dispatch to related case studies.',
    tooltip: 'Internal links distribute link equity across your domain and decrease bounce rates.',
    scoreWeight: 6,
  });

  // ---------------------------------------------------------------------------
  // GROUP 3: TITLE READABILITY (4 Checks)
  // ---------------------------------------------------------------------------
  const titleChecks: RankMathCheck[] = [];

  // 3.1 Focus keyword used at the beginning of SEO title
  let hasKwAtTitleStart = false;
  if (cleanKeyword && effectiveTitle) {
    const titleLower = effectiveTitle.toLowerCase();
    const index = titleLower.indexOf(cleanKeyword);
    hasKwAtTitleStart = index >= 0 && index <= 18;
  }
  titleChecks.push({
    id: 'title-kw-at-start',
    label: 'Focus Keyword at Beginning of Title',
    status: !cleanKeyword ? 'fail' : hasKwAtTitleStart ? 'pass' : 'warning',
    message: !cleanKeyword
      ? 'Add focus keyword to evaluate.'
      : hasKwAtTitleStart
      ? 'Focus keyword appears near the beginning of the title.'
      : 'Consider moving the focus keyword closer to the beginning of the title.',
    tooltip: 'Users read titles left-to-right; placing the target keyword upfront increases CTR.',
    scoreWeight: 5,
  });

  // 3.2 Title expresses sentiment (positive or negative)
  const titleWords = effectiveTitle.toLowerCase().split(/\W+/).filter(Boolean);
  const hasPositiveSentiment = titleWords.some((w) => POSITIVE_SENTIMENT.includes(w));
  const hasNegativeSentiment = titleWords.some((w) => NEGATIVE_SENTIMENT.includes(w));
  const hasSentiment = hasPositiveSentiment || hasNegativeSentiment;
  titleChecks.push({
    id: 'title-sentiment',
    label: 'Title Sentiment Expression',
    status: hasSentiment ? 'pass' : 'warning',
    message: hasSentiment
      ? `Title evokes emotional engagement (${hasNegativeSentiment ? 'forensic/critical' : 'positive'}).`
      : 'Title lacks emotional sentiment. Add compelling words like "Collapse", "Failure", or "Genius".',
    tooltip: 'Headlines with clear emotional resonance earn substantially higher click-through rates.',
    scoreWeight: 4,
  });

  // 3.3 Title contains a Power Word
  const detectedPowerWord = titleWords.find((w) => POWER_WORDS.includes(w));
  const hasPowerWord = !!detectedPowerWord;
  titleChecks.push({
    id: 'title-power-word',
    label: 'Title Contains a Power Word',
    status: hasPowerWord ? 'pass' : 'warning',
    message: hasPowerWord
      ? `Power word detected: "${detectedPowerWord}".`
      : 'Add a power word (e.g. "Ultimate", "Forensic", "Autopsy", "Shocking", "Definitive").',
    tooltip: 'Power words make headlines irresistible and drive social and search engagement.',
    scoreWeight: 4,
  });

  // 3.4 Title contains a Number
  const hasNumber = /\d+/.test(effectiveTitle);
  titleChecks.push({
    id: 'title-number',
    label: 'Title Contains a Number',
    status: hasNumber ? 'pass' : 'warning',
    message: hasNumber
      ? 'Title contains numeric data (e.g. $102M, 5 Lessons, 2024).'
      : 'Consider adding a number or dollar amount (e.g. "$102M Collapse", "5 Lessons") to boost CTR.',
    tooltip: 'Numbers in titles increase click-through rates by up to 36% in search results.',
    scoreWeight: 4,
  });

  // ---------------------------------------------------------------------------
  // GROUP 4: CONTENT READABILITY (3 Checks)
  // ---------------------------------------------------------------------------
  const contentChecks: RankMathCheck[] = [];

  // 4.1 Table of Contents block detected
  const hasToc = traversal.hasToc;
  contentChecks.push({
    id: 'content-toc-present',
    label: 'Table of Contents Present',
    status: hasToc ? 'pass' : 'warning',
    message: hasToc
      ? 'Table of Contents detected in content.'
      : 'Add a Table of Contents using the editor toolbar button for reader navigation.',
    tooltip: 'Google often displays site-links and quick-jump anchors for posts with a Table of Contents.',
    scoreWeight: 5,
  });

  // 4.2 Paragraph length check (<= 150 words)
  const longParagraphs = traversal.paragraphs.filter((p) => p.wordCount > 150);
  const isParagraphLengthGood = longParagraphs.length === 0;
  contentChecks.push({
    id: 'content-paragraph-length',
    label: 'Concise Paragraph Length',
    status: isParagraphLengthGood ? 'pass' : 'warning',
    message: isParagraphLengthGood
      ? 'All paragraphs are concise and well-paced (under 150 words).'
      : `${longParagraphs.length} paragraph${longParagraphs.length === 1 ? '' : 's'} exceed 150 words. Break them up for mobile readability.`,
    tooltip: 'Short paragraphs (2-4 sentences) are easier to read and scan on mobile screens.',
    scoreWeight: 4,
  });

  // 4.3 Subheading distribution check
  const needsSubheadings = wordCount > 300 && traversal.headings.length === 0;
  contentChecks.push({
    id: 'content-subheading-distribution',
    label: 'Subheading Structure & Hierarchy',
    status: needsSubheadings ? 'fail' : traversal.headings.length > 0 ? 'pass' : 'warning',
    message: needsSubheadings
      ? 'Post has over 300 words but no H2 or H3 subheadings. Add subheadings to structure your post.'
      : traversal.headings.length > 0
      ? `Structured with ${traversal.headings.length} subheading${traversal.headings.length === 1 ? '' : 's'}.`
      : 'Add H2 and H3 subheadings as your article grows.',
    tooltip: 'Well-structured subheadings make long articles scannable and satisfy search intent.',
    scoreWeight: 5,
  });

  // ---------------------------------------------------------------------------
  // AGGREGATE SCORE CALCULATION (0 - 100)
  // ---------------------------------------------------------------------------
  const allChecks = [...basicChecks, ...additionalChecks, ...titleChecks, ...contentChecks];
  let earnedScore = 0;
  let maxPossibleScore = 0;

  for (const check of allChecks) {
    maxPossibleScore += check.scoreWeight;
    if (check.status === 'pass') {
      earnedScore += check.scoreWeight;
    } else if (check.status === 'warning') {
      earnedScore += check.scoreWeight * 0.45; // Partial credit for warnings
    }
  }

  const rawScore = maxPossibleScore > 0 ? Math.round((earnedScore / maxPossibleScore) * 100) : 0;
  const score = Math.max(0, Math.min(100, rawScore));

  const scoreGrade: 'good' | 'average' | 'poor' =
    score >= 80 ? 'good' : score >= 50 ? 'average' : 'poor';

  function createGroup(
    id: 'basic' | 'additional' | 'titleReadability' | 'contentReadability',
    title: string,
    checks: RankMathCheck[]
  ): ChecklistGroup {
    const passCount = checks.filter((c) => c.status === 'pass').length;
    const hasErrors = checks.some((c) => c.status === 'fail');
    return {
      id,
      title,
      checks,
      passCount,
      totalCount: checks.length,
      hasErrors,
    };
  }

  return {
    score,
    scoreGrade,
    groups: {
      basic: createGroup('basic', 'Basic SEO', basicChecks),
      additional: createGroup('additional', 'Additional', additionalChecks),
      titleReadability: createGroup('titleReadability', 'Title Readability', titleChecks),
      contentReadability: createGroup('contentReadability', 'Content Readability', contentChecks),
    },
    metrics: {
      wordCount,
      keywordMatches,
      keywordDensity,
      headingCount: traversal.headings.length,
      headingsWithKeyword,
      imageCount: traversal.images.length,
      imagesWithAltKeyword,
      internalLinkCount: internalLinks.length,
      externalLinkCount: externalLinks.length,
      paragraphCount: traversal.paragraphs.length,
      longParagraphCount: longParagraphs.length,
      hasToc,
    },
  };
}
