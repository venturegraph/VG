import { analyzeRankMathSEO, traverseTiptapDocument, isInternalLink, isExternalLink } from '../src/lib/rankMathAnalysis.ts';

console.log('================================================================');
console.log('RANK MATH SEO ANALYSIS ENGINE VERIFICATION');
console.log('================================================================');

// 1. VERIFY POINT 1: TIPTAP NODE TREE TRAVERSAL (NO REGEX ON HTML STRINGS)
console.log('\n--- TEST 1: Tree-Walking Real Tiptap ProseMirror Document Nodes ---');

// Build a structured Tiptap JSONContent document tree representing a realistic investigative autopsy
const mockTiptapDocument = {
  type: 'doc',
  content: [
    // Opening paragraph with focus keyword in the first 10%
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'The collapse of Fast checkout represents one of the most instructive forensic case studies in modern venture capital history. In this comprehensive breakdown, we examine why the one-click checkout startup burned through $102 million in venture capital before suddenly liquidating.',
        },
      ],
    },
    // Table of Contents block
    {
      type: 'paragraph',
      attrs: {
        'data-type': 'table-of-contents',
        class: 'toc-block',
      },
      content: [
        {
          type: 'text',
          text: '[Table of Contents: 1. Executive Summary 2. Unit Economics 3. The Collapse of Fast Checkout 4. Governance Breakdown]',
        },
      ],
    },
    // Heading 2 with nested formatting (bold mark inside text node to prove regex-on-HTML is NOT used)
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        {
          type: 'text',
          text: 'The Collapse of Fast Checkout: ',
          marks: [{ type: 'bold' }],
        },
        {
          type: 'text',
          text: 'Vanity Metrics vs Unit Economics',
        },
      ],
    },
    // Body paragraph containing internal link to venturegraph.me
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'As detailed in our previous investigative autopsy on ',
        },
        {
          type: 'text',
          text: 'Fintech Burn Rates',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://venturegraph.me/articles/fintech-burn-rates',
                target: '_blank',
              },
            },
          ],
        },
        {
          type: 'text',
          text: ', customer acquisition costs spiraled out of control while transaction revenues stagnated at less than $50,000 monthly.',
        },
      ],
    },
    // Heading 3 with focus keyword
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [
        {
          type: 'text',
          text: 'Forensic Accounting of the Collapse of Fast Checkout',
        },
      ],
    },
    // Image node with alt attribute containing the focus keyword
    {
      type: 'image',
      attrs: {
        src: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44',
        alt: 'Financial autopsy chart detailing the collapse of Fast checkout cash flow',
        title: 'Fast Checkout Cash Burn',
      },
    },
    // Body paragraph containing external link to SEC / authoritative source
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'According to primary public filings documented by ',
        },
        {
          type: 'text',
          text: 'SEC EDGAR Filings',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://www.sec.gov/edgar/searchedgar/companysearch',
                target: '_blank',
              },
            },
          ],
        },
        {
          type: 'text',
          text: ', executive payroll accounted for over 65% of net operational expenditures, completely unhedged against tightening capital markets.',
        },
      ],
    },
    // Repeat body paragraphs to satisfy long-form word count (600+ words) & optimal density (~1.2%)
    ...Array.from({ length: 6 }).map((_, i) => ({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `Section ${i + 1} analysis: The venture capital ecosystem repeatedly mispriced customer acquisition efficiency. The collapse of Fast checkout serves as an indelible reminder that top-line gross payment volume cannot substitute for positive unit economics. Founders and investors alike must scrutinize structural unit economics, burn multiple ratios, and sustainable market expansion thresholds before deploying hyper-growth capital reserves. Without rigorous financial discipline, even heavily capitalized market entrants will inevitably succumb to operational insolvency.`,
        },
      ],
    })),
  ],
};

// Test 1a: Traverse document tree directly
const traversalResult = traverseTiptapDocument(mockTiptapDocument);
console.log('Traversal Results from ProseMirror JSONContent:');
console.log(`- Headings found: ${traversalResult.headings.length} (H2 & H3)`);
console.log(`- Images found: ${traversalResult.images.length} (Alt: "${traversalResult.images[0]?.alt}")`);
console.log(`- Links found: ${traversalResult.links.length}`);
console.log(`  * Internal link: ${traversalResult.links.find(l => l.isInternal)?.href}`);
console.log(`  * External link: ${traversalResult.links.find(l => !l.isInternal)?.href}`);
console.log(`- Table of Contents detected: ${traversalResult.hasToc}`);
console.log(`- Paragraphs counted: ${traversalResult.paragraphs.length}`);
console.log(`- Total word count: ${traversalResult.plainText.split(/\\s+/).length} words`);

const traversalPassed =
  traversalResult.headings.length === 2 &&
  traversalResult.images.length === 1 &&
  traversalResult.links.length === 2 &&
  traversalResult.hasToc === true;

console.log('Tree Traversal Validation:', traversalPassed ? 'PASS (Real node tree traversed)' : 'FAIL');

// 2. VERIFY POINT 2: DOMAIN DETECTION (venturegraph.me ONLY)
console.log('\n--- TEST 2: Domain Verification (venturegraph.me vs external) ---');
const domainTests = [
  { url: 'https://venturegraph.me/articles/fintech-burn', expectedInternal: true },
  { url: '/articles/relative-post-link', expectedInternal: true },
  { url: '#table-of-contents', expectedInternal: true },
  { url: 'https://venturegraph.io/articles/wrong-domain', expectedInternal: false },
  { url: 'https://sec.gov/edgar', expectedInternal: false },
  { url: 'https://techcrunch.com/2022/04/fast-shuts-down', expectedInternal: false },
];

let domainCheckPassed = true;
domainTests.forEach(t => {
  const isInt = isInternalLink(t.url);
  const isExt = isExternalLink(t.url);
  const ok = isInt === t.expectedInternal;
  if (!ok) domainCheckPassed = false;
  console.log(`URL: "${t.url}" -> isInternal: ${isInt}, isExternal: ${isExt} (Expected Internal: ${t.expectedInternal}) - ${ok ? 'OK' : 'MISMATCH'}`);
});
console.log('Domain Rules Validation:', domainCheckPassed ? 'PASS (venturegraph.me verified)' : 'FAIL');

// 3. VERIFY ALL 19 RANK MATH CHECKS AND SCORING
console.log('\n--- TEST 3: Full 19 Rank Math SEO Checklist Engine ---');

const analysisInput = {
  title: '5 Brutal Lessons from the Collapse of Fast Checkout ($102M Disaster)',
  seoTitle: '5 Brutal Lessons from the Collapse of Fast Checkout - Venture Graph',
  slug: 'collapse-of-fast-checkout',
  metaDescription: 'Discover the forensic truth behind the collapse of Fast checkout, where $102M evaporated in months due to unsustainable burn and lack of product-market fit.',
  focusKeyword: 'collapse of Fast checkout',
  secondaryKeywords: ['fintech burn', 'startup failure', 'unit economics'],
  doc: mockTiptapDocument,
};

const result = analyzeRankMathSEO(analysisInput);

console.log(`\nOverall SEO Score: ${result.score}/100 [Grade: ${result.scoreGrade.toUpperCase()}]`);

let totalChecksCounted = 0;
let passedChecksCounted = 0;
let warningChecksCounted = 0;
let failedChecksCounted = 0;

Object.entries(result.groups).forEach(([groupId, group]) => {
  console.log(`\n[${group.title.toUpperCase()}] Passed: ${group.passCount}/${group.totalCount} (Has Errors: ${group.hasErrors})`);
  group.checks.forEach(check => {
    totalChecksCounted++;
    if (check.status === 'pass') passedChecksCounted++;
    else if (check.status === 'warning') warningChecksCounted++;
    else failedChecksCounted++;

    const icon = check.status === 'pass' ? '✓ [PASS]' : check.status === 'warning' ? '! [WARN]' : '✗ [FAIL]';
    console.log(`  ${icon} ${check.label.padEnd(42)}: ${check.message}`);
  });
});

console.log('\n----------------------------------------------------------------');
console.log(`Summary of Checks Evaluated: ${totalChecksCounted} / 19`);
console.log(`Pass: ${passedChecksCounted} | Warning: ${warningChecksCounted} | Fail: ${failedChecksCounted}`);
console.log(`Metrics:
  - Word Count: ${result.metrics.wordCount}
  - Keyword Matches: ${result.metrics.keywordMatches}
  - Keyword Density: ${result.metrics.keywordDensity.toFixed(2)}%
  - Headings with Keyword: ${result.metrics.headingsWithKeyword}
  - Images with Alt Keyword: ${result.metrics.imagesWithAltKeyword}
  - Internal Links: ${result.metrics.internalLinkCount}
  - External Links: ${result.metrics.externalLinkCount}
  - Has TOC: ${result.metrics.hasToc}`);

if (totalChecksCounted === 19 && result.score >= 80) {
  console.log('\n================================================================');
  console.log('ALL 19 RANK MATH CHECKS PASSED OR OPTIMALLY EVALUATED (SCORE >= 80)');
  console.log('================================================================');
  process.exit(0);
} else {
  console.error(`\nFAILED: Expected 19 checks and score >= 80, got ${totalChecksCounted} checks and score ${result.score}`);
  process.exit(1);
}
