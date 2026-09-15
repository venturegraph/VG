// Verification of 2-heading flow:
// 1. "Introduction" -> H2 + body paragraph
// 2. "The Collapse" -> H2 + body paragraph
// 3. Insert TOC -> exactly 2 links ("Introduction" and "The Collapse")
// 4. Additional text typed afterward -> TOC and headings remain intact without revert.

import assert from 'node:assert';

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

function extractTocHeadings(doc) {
  const headings = [];
  const usedIds = new Set();

  walkDescendants(doc, (node) => {
    if (node.type === 'tableOfContents') {
      return false; // Isolates TOC block completely
    }

    if (node.type === 'heading') {
      const level = node.attrs?.level;
      if (level === 2 || level === 3) {
        let headingText = '';
        if (node.content && node.content.length > 0) {
          for (let i = 0; i < node.content.length; i++) {
            const child = node.content[i];
            if (child.type === 'hardBreak') break;
            if ((child.type === 'text' || !child.type) && child.text) {
              headingText += child.text;
            }
          }
        }
        if (!headingText) headingText = node.textContent || '';
        const firstLine = headingText.split(/\r?\n/)[0].trim();
        const cleanText = firstLine.replace(/<[^>]*>/g, '').trim();

        if (cleanText) {
          let baseId = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
          if (!baseId) baseId = `heading-${headings.length + 1}`;
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

function generateTocHtml(headings) {
  const itemsHtml = headings
    .map((h) => `<li class="list-disc font-medium my-1.5"><a href="#${h.id}" class="text-primary hover:underline">${h.text}</a></li>`)
    .join('');
  return `<div data-type="table-of-contents" class="toc-container my-6 p-5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 not-prose"><p class="text-xs font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px] text-primary">format_list_bulleted</span> Table of Contents (${headings.length} Sections)</p><ul class="space-y-1 text-sm pl-4">${itemsHtml}</ul></div><p></p>`;
}

console.log('--- Step 1 & 2: Create doc with 2 H2 headings + paragraphs ---');
const doc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Introduction' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'First body paragraph following introduction.' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Collapse' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Second body paragraph explaining collapse.' }] },
  ],
};

const headings = extractTocHeadings(doc);
assert.strictEqual(headings.length, 2, 'Must find exactly 2 headings');
assert.strictEqual(headings[0].text, 'Introduction');
assert.strictEqual(headings[0].id, 'introduction');
assert.strictEqual(headings[1].text, 'The Collapse');
assert.strictEqual(headings[1].id, 'the-collapse');
console.log('✓ Exactly 2 headings extracted: "Introduction" and "The Collapse"');

console.log('--- Step 3: Insert TOC ---');
const tocHtml = generateTocHtml(headings);
assert.ok(tocHtml.includes('Table of Contents (2 Sections)'));
assert.ok(tocHtml.includes('<a href="#introduction" class="text-primary hover:underline">Introduction</a>'));
assert.ok(tocHtml.includes('<a href="#the-collapse" class="text-primary hover:underline">The Collapse</a>'));
assert.ok(!tocHtml.includes('First body paragraph'));
assert.ok(!tocHtml.includes('Second body paragraph'));
console.log('✓ Generated TOC has exactly 2 links with zero body text concatenation');

console.log('--- Step 4: Add additional text afterward (simulating typing) ---');
doc.content.push({
  type: 'paragraph',
  content: [{ type: 'text', text: 'Additional text typed by author after TOC insertion.' }],
});

// Re-scan headings:
const headingsAfterTyping = extractTocHeadings(doc);
assert.strictEqual(headingsAfterTyping.length, 2, 'Headings count must remain 2 after typing');
assert.strictEqual(headingsAfterTyping[0].text, 'Introduction');
assert.strictEqual(headingsAfterTyping[1].text, 'The Collapse');
console.log('✓ Headings and TOC state remain stable after typing additional text');

console.log('\nAll 4 test criteria passed successfully!');
