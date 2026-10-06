/**
 * Editorial Enhancements: Strict FAQ Accordions & Business Glossary Transformer
 * Strictly identifies FAQ and Glossary sections without touching preceding or following content.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

/**
 * Builds an interactive HTML Accordion card from Q&A pairs matching Requirement D
 */
export function buildFaqAccordionHtml(
  headingTitle: string,
  items: FaqItem[],
  headingId?: string
): string {
  if (!items || items.length === 0) return '';

  const accordionItemsHtml = items
    .map((faq, index) => {
      // Default state: Expand the first 2 questions and collapse the rest
      const isOpen = index < 2;
      const cleanQ = faq.question.replace(/^Q\d*[.:]\s*/i, '').trim();
      const cleanA = faq.answer.replace(/^A\d*[.:]\s*/i, '').trim();

      return `
        <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 mb-3 shadow-xs">
          <details class="group" ${isOpen ? 'open' : ''}>
            <summary class="w-full text-left p-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <span class="flex items-start gap-2 text-base sm:text-lg leading-snug">
                <span class="text-brand-red font-bold shrink-0 pt-0.5">Q:</span>
                <span>${cleanQ}</span>
              </span>
              <span class="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 text-xl" aria-hidden="true">
                expand_more
              </span>
            </summary>
            <div class="px-4 pb-4 pt-1 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 text-base">
              <p class="m-0"><strong class="text-slate-800 dark:text-slate-200">A:</strong> ${cleanA}</p>
            </div>
          </details>
        </div>
      `.trim();
    })
    .join('\n');

  return `
    <div class="my-10 rounded-2xl bg-surface-container-low/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-l-4 border-l-brand-red p-6 sm:p-8 not-prose shadow-xs">
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <span class="px-2.5 py-1 rounded bg-brand-red/10 text-brand-red text-xs font-bold uppercase tracking-wider font-label-sm">
          FAQ / Quick Answers
        </span>
        <h2 class="text-xl sm:text-2xl font-bold font-headline-lg text-slate-900 dark:text-white m-0 tracking-tight" ${
          headingId ? `id="${headingId}"` : ''
        }>
          ${headingTitle}
        </h2>
      </div>
      <div class="space-y-1">
        ${accordionItemsHtml}
      </div>
    </div>
  `.trim();
}

/**
 * Builds a 2-column styled card grid for Business Glossary terms
 */
export function buildGlossaryGridHtml(
  headingTitle: string,
  items: GlossaryItem[],
  headingId?: string
): string {
  if (!items || items.length === 0) return '';

  const cardsHtml = items
    .map((item) => {
      const cleanTerm = item.term.replace(/[:\-–—]+$/, '').trim();
      const cleanDef = item.definition.replace(/^[:\-–—\s]+/, '').trim();

      return `
        <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span class="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md inline-block mb-2">
            ${cleanTerm}
          </span>
          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
            ${cleanDef}
          </p>
        </div>
      `.trim();
    })
    .join('\n');

  return `
    <div class="my-10 not-prose">
      <div class="flex items-center gap-2.5 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-brand-red text-2xl shrink-0" aria-hidden="true">menu_book</span>
        <h2 class="text-xl sm:text-2xl font-bold font-headline-lg text-slate-900 dark:text-white uppercase tracking-tight m-0" ${
          headingId ? `id="${headingId}"` : ''
        }>
          ${headingTitle}
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${cardsHtml}
      </div>
    </div>
  `.trim();
}

/**
 * Strict Section Boundary FAQ Parsing:
 * - Starts ONLY immediately after an H2/H3 header containing FAQ or PEOPLE ALSO ASK.
 * - Leaves all content BEFORE this header 100% untouched.
 * - STOPS immediately at the next H2/H3/##/### header (e.g. BUSINESS GLOSSARY, CONCLUSION).
 * - Leaves all content AFTER the next header 100% untouched.
 * - Extracts question and answer cleanly and renders ALL parsed items.
 */
export function transformFaqSections(html: string): string {
  if (!html) return '';

  // Strict regex: matches strictly a single <h2 or <h3 tag whose inner text mentions FAQ or PEOPLE ALSO ASK
  // [^<>]* ensures we NEVER cross tags or swallow earlier paragraphs
  const faqHeadingRegex = /<(h[23])(\s+[^>]*)?>([^<>]*(?:FAQ|PEOPLE ALSO ASK|Frequently Asked Questions|Questions & Answers)[^<>]*)<\/\1>/i;

  const headerMatch = html.match(faqHeadingRegex);
  if (!headerMatch || headerMatch.index === undefined) return html;

  const headerStartIndex = headerMatch.index;
  const headerEndIndex = headerStartIndex + headerMatch[0].length;
  const headingAttrs = headerMatch[2] || '';
  const headingTitle = headerMatch[3].replace(/<[^>]*>/g, '').trim();

  // Extract heading ID if present for anchor jump-links
  const idMatch = headingAttrs.match(/id=["']([^"']+)["']/i);
  const headingId = idMatch ? idMatch[1] : undefined;

  // Search for the section body: strictly from headerEndIndex up to the next heading (<h2, <h3, ##, ###)
  const afterHeader = html.slice(headerEndIndex);
  const nextHeadingRegex = /(?:<(?:h2|h3)\b|(?:\r?\n|^)#{2,3}\s)/i;
  const nextHeadingMatch = afterHeader.match(nextHeadingRegex);

  const sectionBody = nextHeadingMatch
    ? afterHeader.slice(0, nextHeadingMatch.index)
    : afterHeader;
  const afterSection = nextHeadingMatch
    ? afterHeader.slice(nextHeadingMatch.index)
    : '';

  // Parse Q&A items inside sectionBody
  const items: FaqItem[] = [];

  // Pattern 1: Paragraphs containing Q: and A:
  // e.g. <p><strong>Q: Why did the Color app startup fail?</strong> A: The Color app startup failure...</p>
  // or <p>Q: Why did ...? A: ...</p>
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(sectionBody)) !== null) {
    const rawP = pMatch[1];
    // Match Q: ... up to A: ...
    const qAndAPattern = /(?:Q\d*[:.]|\*\*Q\d*[:.]\*\*|<strong>Q\d*[:.]\s*<\/strong>)\s*([\s\S]*?)(?:A\d*[:.]|\*\*A\d*[:.]\*\*|<strong>A\d*[:.]\s*<\/strong>)\s*([\s\S]*)$/i;
    const m = rawP.match(qAndAPattern);
    if (m) {
      const q = m[1].replace(/<[^>]*>/g, '').trim();
      const a = m[2].replace(/<[^>]*>/g, '').trim();
      if (q && a) {
        items.push({ question: q, answer: a });
      }
    }
  }

  // Pattern 2: Separate paragraphs (P1 is Q:, P2 is A:)
  if (items.length === 0) {
    const sepQRegex = /<p[^>]*>\s*(?:<strong>)?\s*(?:Q\d*[:.]|\*\*Q\d*[:.]\*\*)\s*([\s\S]*?)(?:<\/strong>)?\s*<\/p>\s*<p[^>]*>\s*(?:<strong>)?\s*(?:A\d*[:.]|\*\*A\d*[:.]\*\*|Answer[:.]?)?\s*([\s\S]*?)(?:<\/strong>)?\s*<\/p>/gi;
    let sepMatch;
    while ((sepMatch = sepQRegex.exec(sectionBody)) !== null) {
      const q = sepMatch[1].replace(/<[^>]*>/g, '').trim();
      const a = sepMatch[2].replace(/<[^>]*>/g, '').trim();
      if (q && a) {
        items.push({ question: q, answer: a });
      }
    }
  }

  // Pattern 3: Line-based markdown fallback (Q: ... \n A: ...)
  if (items.length === 0) {
    const lines = sectionBody.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(?:Q\d*[:.]|\*\*Q\d*[:.]\*\*)/i.test(line)) {
        const nextLine = lines[i + 1] || '';
        const q = line.replace(/^(?:Q\d*[:.]|\*\*Q\d*[:.]\*\*)\s*/i, '').replace(/<[^>]*>/g, '').trim();
        const a = nextLine.replace(/^(?:A\d*[:.]|\*\*A\d*[:.]\*\*)\s*/i, '').replace(/<[^>]*>/g, '').trim();
        if (q && a) {
          items.push({ question: q, answer: a });
          i++;
        }
      }
    }
  }

  // If no Q&A could be reliably extracted, do not mutate anything!
  if (items.length === 0) {
    return html;
  }

  // Build the redesigned FAQ Accordion card
  const accordionHtml = buildFaqAccordionHtml(headingTitle, items, headingId);

  // Return: Everything BEFORE the FAQ header untouched + new accordion + remainder untouched
  return html.slice(0, headerStartIndex) + accordionHtml + afterSection;
}

/**
 * Strict Section Boundary Glossary Parsing:
 * - Starts ONLY immediately after an H2/H3 header containing Business Glossary or Glossary.
 * - Leaves all content BEFORE this header 100% untouched.
 * - STOPS immediately at the next H2/H3/##/### header.
 * - Leaves all content AFTER the next header 100% untouched.
 */
export function transformGlossarySections(html: string): string {
  if (!html) return '';

  const glossaryHeadingRegex = /<(h[23])(\s+[^>]*)?>([^<>]*(?:Business Glossary|Glossary|Key Terms|Key Terminology)[^<>]*)<\/\1>/i;

  const headerMatch = html.match(glossaryHeadingRegex);
  if (!headerMatch || headerMatch.index === undefined) return html;

  const headerStartIndex = headerMatch.index;
  const headerEndIndex = headerStartIndex + headerMatch[0].length;
  const headingAttrs = headerMatch[2] || '';
  const headingTitle = headerMatch[3].replace(/<[^>]*>/g, '').trim();

  const idMatch = headingAttrs.match(/id=["']([^"']+)["']/i);
  const headingId = idMatch ? idMatch[1] : undefined;

  const afterHeader = html.slice(headerEndIndex);
  const nextHeadingRegex = /(?:<(?:h2|h3)\b|(?:\r?\n|^)#{2,3}\s)/i;
  const nextHeadingMatch = afterHeader.match(nextHeadingRegex);

  const sectionBody = nextHeadingMatch
    ? afterHeader.slice(0, nextHeadingMatch.index)
    : afterHeader;
  const afterSection = nextHeadingMatch
    ? afterHeader.slice(nextHeadingMatch.index)
    : '';

  const items: GlossaryItem[] = [];

  // Pattern 1: Paragraphs with <strong>Term:?</strong> Definition
  // e.g. <p><strong>Pre-launch funding round</strong> — Venture capital raised...</p>
  const pTermRegex = /<p[^>]*>\s*<strong>\s*([^<:]+):?\s*<\/strong>\s*(?:&nbsp;|\s)*[-–—:]?\s*([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pTermRegex.exec(sectionBody)) !== null) {
    const term = pMatch[1].replace(/<[^>]*>/g, '').trim();
    const def = pMatch[2].replace(/<[^>]*>/g, '').trim();
    if (term && def) {
      items.push({ term, definition: def });
    }
  }

  // Pattern 2: List items with <li><strong>Term:?</strong> Definition</li>
  if (items.length === 0) {
    const liTermRegex = /<li[^>]*>\s*<strong>\s*([^<:]+):?\s*<\/strong>\s*(?:&nbsp;|\s)*[-–—:]?\s*([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liTermRegex.exec(sectionBody)) !== null) {
      const term = liMatch[1].replace(/<[^>]*>/g, '').trim();
      const def = liMatch[2].replace(/<[^>]*>/g, '').trim();
      if (term && def) {
        items.push({ term, definition: def });
      }
    }
  }

  // Pattern 3: Definition lists <dt>Term</dt><dd>Definition</dd>
  if (items.length === 0) {
    const dlTermRegex = /<dt[^>]*>\s*([\s\S]*?)\s*<\/dt>\s*<dd[^>]*>\s*([\s\S]*?)\s*<\/dd>/gi;
    let dlMatch;
    while ((dlMatch = dlTermRegex.exec(sectionBody)) !== null) {
      const term = dlMatch[1].replace(/<[^>]*>/g, '').trim();
      const def = dlMatch[2].replace(/<[^>]*>/g, '').trim();
      if (term && def) {
        items.push({ term, definition: def });
      }
    }
  }

  if (items.length === 0) {
    return html;
  }

  const glossaryHtml = buildGlossaryGridHtml(headingTitle, items, headingId);
  return html.slice(0, headerStartIndex) + glossaryHtml + afterSection;
}

/**
 * Full enhancement pipeline applied to article body HTML.
 */
export function enhanceArticleHtml(html: string): string {
  if (!html) return '';
  let enhanced = transformFaqSections(html);
  enhanced = transformGlossarySections(enhanced);
  return enhanced;
}
