// Test script to explicitly verify:
// 1. A document with 3 distinct short H2 headings ("Introduction", "The Collapse", "Lessons Learned")
//    each followed by a paragraph of body text.
// 2. TOC generation logic extracts ONLY each heading's own clean short title.
// 3. Exactly 3 TOC links are generated, with no body text leakage or concatenation.
// 4. Edge case: Heading with hard break (<br>) only extracts the first line.

import assert from 'node:assert';

// Simulated ProseMirror / Tiptap Doc Model matching actual StarterKit schema
function createTestDocument() {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Introduction' }],
        textContent: 'Introduction',
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'This is the introduction paragraph with multiple sentences of background detail.' }],
        textContent: 'This is the introduction paragraph with multiple sentences of background detail.',
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'The Collapse' }],
        textContent: 'The Collapse',
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'This paragraph details the collapse of the startup, cash burn, and governance issues.' }],
        textContent: 'This paragraph details the collapse of the startup, cash burn, and governance issues.',
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Lessons Learned' }],
        textContent: 'Lessons Learned',
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Key takeaways and defensive playbooks for future founders and investors.' }],
        textContent: 'Key takeaways and defensive playbooks for future founders and investors.',
      },
    ],
  };
}

// Emulate ProseMirror doc.descendants
function walkDescendants(docNode, callback) {
  if (!docNode.content) return;
  for (let i = 0; i < docNode.content.length; i++) {
    const child = docNode.content[i];
    const shouldDescend = callback(child, i);
    if (shouldDescend !== false && child.content) {
      walkDescendants(child, callback);
    }
  }
}

// Exact TOC extraction algorithm used in TiptapEditor.tsx
function extractTocHeadings(doc) {
  const headings = [];
  const usedIds = new Set();

  walkDescendants(doc, (node) => {
    // 1. NEVER descend into existing TOC block
    if (node.type === 'tableOfContents') {
      return false;
    }

    // 2. Read ONLY real H2 or H3 heading nodes
    if (node.type === 'heading') {
      const level = node.attrs?.level;
      if (level === 2 || level === 3) {
        let headingText = '';

        if (node.content && node.content.length > 0) {
          for (let i = 0; i < node.content.length; i++) {
            const child = node.content[i];
            if (child.type === 'hardBreak') {
              break;
            }
            if ((child.type === 'text' || !child.type) && child.text) {
              headingText += child.text;
            }
          }
        }

        if (!headingText) {
          headingText = node.textContent || '';
        }

        const firstLine = headingText.split(/\r?\n/)[0].trim();
        const cleanText = firstLine.replace(/<[^>]*>/g, '').trim();

        if (cleanText) {
          let baseId = cleanText
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

          if (!baseId) {
            baseId = `heading-${headings.length + 1}`;
          }

          let uniqueId = baseId;
          let counter = 2;
          while (usedIds.has(uniqueId)) {
            uniqueId = `${baseId}-${counter}`;
            counter++;
          }
          usedIds.add(uniqueId);

          headings.push({ level, text: cleanText, id: uniqueId });
        }
      }
    }
  });

  return headings;
}

// Generate the TOC HTML block
function generateTocHtml(headings) {
  const itemsHtml = headings
    .map(
      (h) =>
        `<li class="${h.level === 3 ? 'ml-5 list-circle text-on-surface-variant' : 'list-disc font-medium'} my-1.5"><a href="#${h.id}" class="text-primary hover:underline">${h.text}</a></li>`
    )
    .join('');

  return `<div data-type="table-of-contents" class="toc-container my-6 p-5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 not-prose"><p class="text-xs font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px] text-primary">format_list_bulleted</span> Table of Contents (${headings.length} Sections)</p><ul class="space-y-1 text-sm pl-4">${itemsHtml}</ul></div><p></p>`;
}

console.log('=== TEST 1: Document with 3 distinct short H2 headings ===');
const doc = createTestDocument();
const headings = extractTocHeadings(doc);

console.log(`Found ${headings.length} headings:`);
headings.forEach((h, idx) => {
  console.log(`  [${idx + 1}] Level: H${h.level} | Title: "${h.text}" | ID: #${h.id}`);
});

// Assert exactly 3 headings
assert.strictEqual(headings.length, 3, 'Must have exactly 3 headings');
assert.strictEqual(headings[0].text, 'Introduction');
assert.strictEqual(headings[0].id, 'introduction');
assert.strictEqual(headings[1].text, 'The Collapse');
assert.strictEqual(headings[1].id, 'the-collapse');
assert.strictEqual(headings[2].text, 'Lessons Learned');
assert.strictEqual(headings[2].id, 'lessons-learned');

const tocHtml = generateTocHtml(headings);
console.log('\nGenerated TOC HTML:');
console.log(tocHtml);

// Confirm no body text leaked into TOC HTML
assert.ok(!tocHtml.includes('multiple sentences'), 'TOC must NOT contain introduction body text');
assert.ok(!tocHtml.includes('cash burn'), 'TOC must NOT contain collapse body text');
assert.ok(!tocHtml.includes('takeaways'), 'TOC must NOT contain lessons learned body text');

// Confirm exact links exist
assert.ok(tocHtml.includes('<a href="#introduction" class="text-primary hover:underline">Introduction</a>'));
assert.ok(tocHtml.includes('<a href="#the-collapse" class="text-primary hover:underline">The Collapse</a>'));
assert.ok(tocHtml.includes('<a href="#lessons-learned" class="text-primary hover:underline">Lessons Learned</a>'));
assert.ok(tocHtml.includes('Table of Contents (3 Sections)'));

console.log('\n=== TEST 2: Heading with hard break and trailing text ===');
const docWithHardBreak = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        { type: 'text', text: 'Introduction' },
        { type: 'hardBreak' },
        { type: 'text', text: 'Accidental multi-line body text placed inside heading node' },
      ],
      textContent: 'Introduction Accidental multi-line body text placed inside heading node',
    },
  ],
};
const headingsHardBreak = extractTocHeadings(docWithHardBreak);
assert.strictEqual(headingsHardBreak.length, 1);
assert.strictEqual(headingsHardBreak[0].text, 'Introduction', 'Must strictly truncate at hardBreak');
assert.strictEqual(headingsHardBreak[0].id, 'introduction');
console.log(`  HardBreak Test Passed: "${headingsHardBreak[0].text}" (ID: #${headingsHardBreak[0].id})`);

console.log('\n=== ALL TOC TESTS PASSED SUCCESSFULLY! ===');
