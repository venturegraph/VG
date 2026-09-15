import { Schema } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { DOMParser } from '@tiptap/pm/model';
import { JSDOM } from 'jsdom';
import { analyzeRankMathSEO, traverseTiptapDocument } from '../src/lib/rankMathAnalysis.ts';

console.log('================================================================');
console.log('TESTING RANK MATH ANALYSIS ON REAL PASTED WORDPRESS CONTENT');
console.log('================================================================');

// 1. Setup DOM environment for ProseMirror DOMParser
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;

// 2. Build Tiptap ProseMirror Schema matching our TiptapEditor configuration
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      attrs: { 'data-type': { default: null }, class: { default: null } },
      parseDOM: [
        {
          tag: 'p',
          getAttrs: (dom) => ({
            'data-type': dom.getAttribute('data-type'),
            class: dom.getAttribute('class'),
          }),
        },
        {
          tag: 'div[data-type="table-of-contents"]',
          getAttrs: (dom) => ({
            'data-type': 'table-of-contents',
            class: dom.getAttribute('class'),
          }),
        },
      ],
      toDOM: (node) => ['p', node.attrs, 0],
    },
    heading: {
      group: 'block',
      content: 'inline*',
      attrs: { level: { default: 2 } },
      parseDOM: [
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } },
        { tag: 'h4', attrs: { level: 4 } },
      ],
      toDOM: (node) => [`h${node.attrs.level}`, 0],
    },
    image: {
      inline: false,
      group: 'block',
      attrs: { src: {}, alt: { default: '' }, title: { default: '' } },
      parseDOM: [{
        tag: 'img[src]',
        getAttrs: (dom) => ({
          src: dom.getAttribute('src'),
          alt: dom.getAttribute('alt') || '',
          title: dom.getAttribute('title') || '',
        }),
      }],
      toDOM: (node) => ['img', node.attrs],
    },
    text: { group: 'inline' },
    blockquote: { group: 'block', content: 'block+', parseDOM: [{ tag: 'blockquote' }], toDOM: () => ['blockquote', 0] },
    bulletList: { group: 'block', content: 'listItem+', parseDOM: [{ tag: 'ul' }], toDOM: () => ['ul', 0] },
    orderedList: { group: 'block', content: 'listItem+', parseDOM: [{ tag: 'ol' }], toDOM: () => ['ol', 0] },
    listItem: { content: 'paragraph block*', parseDOM: [{ tag: 'li' }], toDOM: () => ['li', 0] },
  },
  marks: {
    bold: { parseDOM: [{ tag: 'strong' }, { tag: 'b' }], toDOM: () => ['strong', 0] },
    italic: { parseDOM: [{ tag: 'em' }, { tag: 'i' }], toDOM: () => ['em', 0] },
    link: {
      attrs: { href: {}, target: { default: null }, rel: { default: null } },
      inclusive: false,
      parseDOM: [{
        tag: 'a[href]',
        getAttrs: (dom) => ({
          href: dom.getAttribute('href'),
          target: dom.getAttribute('target'),
          rel: dom.getAttribute('rel'),
        }),
      }],
      toDOM: (node) => ['a', node.attrs, 0],
    },
  },
});

// 3. Real WordPress exported HTML from a post
const realWordPressPasteHtml = `
<!-- wp:paragraph -->
<p>The <strong>Fast checkout failure</strong> remains an essential case study in fintech overexpansion. In this forensic investigation, we reconstruct the collapse of Fast checkout from primary investor disclosures and regulatory filings.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>The Anatomy of Fast Checkout Failure</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Fast burst onto the Silicon Valley scene in 2019 promising one-click payments. For context on burn acceleration, see our previous intelligence on <a href="https://venturegraph.me/articles/fintech-burn-multiples" target="_blank" rel="noopener">Fintech Burn Multiples</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44" alt="Fast checkout failure chart showing cash depletion" /></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":3} -->
<h3>Forensic Evidence from SEC and Court Filings</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Verified bankruptcy court records cited by <a href="https://www.sec.gov/edgar/searchedgar/companysearch" target="_blank" rel="noopener">SEC Public Disclosures</a> show the company spent $10M per month while generating only $50,000 in monthly processing fees.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
  <li>Annualized burn reached $120 million by late 2021.</li>
  <li>Merchant acquisition cost exceeded lifetime transaction revenue by 14x.</li>
  <li>Failure to close a Series C bridge financing forced immediate liquidation.</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<div data-type="table-of-contents" class="toc-container"><p>Table of Contents</p></div>
<!-- /wp:paragraph -->

<!-- Additional paragraphs to simulate full long-form content -->
<p>Analyzing the broader venture landscape: Top-tier funds frequently over-indexed on top-line vanity metrics rather than durable unit economics. The Fast checkout failure proves that subsidized consumer adoption cannot overcome deeply negative gross margins. Founders must construct sustainable cash conversion cycles and maintain tight runway buffers.</p>
<p>Governance breakdown: Board oversight deteriorated as monthly burn escalated unchecked. The Fast checkout failure illustrates how governance voids lead to sudden operational insolvency when macro liquidity contracts.</p>
<p>Long term implications: Today's enterprise fintech ecosystem requires verifiable gross margin contribution before capital expansion. Learnings from this failure continue to reshape venture due diligence across modern payment infrastructure.</p>
`;

// Parse HTML string into real ProseMirror Document Node Tree
const container = dom.window.document.createElement('div');
container.innerHTML = realWordPressPasteHtml;
const prosemirrorDoc = DOMParser.fromSchema(schema).parse(container);
const tiptapJsonDoc = prosemirrorDoc.toJSON();

console.log('\n--- 1. Pasted WordPress HTML Parsed into ProseMirror Node Tree ---');
const traversal = traverseTiptapDocument(tiptapJsonDoc);
console.log(`Document Node Type: ${tiptapJsonDoc.type}`);
console.log(`Child Node Count: ${tiptapJsonDoc.content.length}`);
console.log(`Detected Headings: ${traversal.headings.length} ->`, traversal.headings.map(h => `[H${h.level}] ${h.text}`));
console.log(`Detected Images: ${traversal.images.length} -> Alt: "${traversal.images[0]?.alt}"`);
console.log(`Detected Links: ${traversal.links.length}`);
traversal.links.forEach(l => console.log(`  - [${l.isInternal ? 'INTERNAL' : 'EXTERNAL'}] ${l.href} (${l.text})`));
console.log(`Detected Table of Contents: ${traversal.hasToc}`);
console.log(`Total Word Count in Traversal: ${traversal.plainText.split(/\s+/).filter(Boolean).length}`);

// 4. Run Rank Math Analysis with Focus Keyword "Fast checkout failure"
console.log('\n--- 2. Evaluating Rank Math Analysis Engine on Real Pasted Document ---');
const analysisInput = {
  title: 'Fast Checkout Failure: 5 Fatal Mistakes Behind the $102M Disaster',
  seoTitle: 'Fast Checkout Failure: 5 Fatal Mistakes Behind $102M Collapse - Venture Graph',
  slug: 'fast-checkout-failure',
  metaDescription: 'An investigative autopsy of the Fast checkout failure, examining how $102M in venture funding evaporated in months due to unsustainable burn.',
  focusKeyword: 'Fast checkout failure',
  secondaryKeywords: ['fintech collapse', 'unit economics'],
  doc: tiptapJsonDoc,
};

const fullResult = analyzeRankMathSEO(analysisInput);

console.log(`\nOverall SEO Score: ${fullResult.score}/100 [Grade: ${fullResult.scoreGrade.toUpperCase()}]`);

// Validate every group and ensure values reflect real document metrics
console.log('\nGroup Breakdown:');
Object.values(fullResult.groups).forEach(grp => {
  console.log(`\n${grp.title} (Passed: ${grp.passCount}/${grp.totalCount}):`);
  grp.checks.forEach(chk => {
    console.log(`  ${chk.status === 'pass' ? '✓' : chk.status === 'warning' ? '!' : '✗'} [${chk.status.toUpperCase()}] ${chk.label}: ${chk.message}`);
  });
});

// 5. Dynamic Reactivity Test: Prove numbers change when content changes
console.log('\n--- 3. Dynamic Reactivity Test (Proving Non-Static/Non-Placeholder Behavior) ---');

// Test A: Analysis with keyword that does NOT exist in the document
const missingKwResult = analyzeRankMathSEO({
  ...analysisInput,
  focusKeyword: 'cryptocurrency mining hardware',
});

console.log(`Score with matching keyword ("Fast checkout failure"): ${fullResult.score}/100`);
console.log(`Score with non-matching keyword ("cryptocurrency mining hardware"): ${missingKwResult.score}/100`);

const kwInTitleCheck = missingKwResult.groups.basic.checks.find(c => c.id === 'basic-kw-in-title');
const kwInSubheadingCheck = missingKwResult.groups.additional.checks.find(c => c.id === 'add-kw-in-subheadings');
const kwInImageCheck = missingKwResult.groups.additional.checks.find(c => c.id === 'add-kw-in-image-alt');

console.log(`Missing Keyword Checks -> Title: ${kwInTitleCheck.status}, Subheading: ${kwInSubheadingCheck.status}, Image Alt: ${kwInImageCheck.status}`);

const isDynamic = fullResult.score !== missingKwResult.score &&
  fullResult.score >= 80 &&
  missingKwResult.score < 50 &&
  kwInTitleCheck.status === 'fail' &&
  kwInSubheadingCheck.status === 'fail';

if (isDynamic) {
  console.log('\n================================================================');
  console.log('REAL WORDPRESS PASTED CONTENT TEST: FULL PASS');
  console.log('All checks dynamically compute real metrics from Tiptap document tree.');
  console.log('================================================================');
  process.exit(0);
} else {
  console.error('FAILED: Checks or scores appear static.');
  process.exit(1);
}
