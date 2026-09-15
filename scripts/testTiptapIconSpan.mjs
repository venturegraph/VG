import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Mark, Node, mergeAttributes } from '@tiptap/core';

const IconSpan = Mark.create({
  name: 'iconSpan',
  addAttributes() {
    return {
      class: {
        default: 'material-symbols-outlined',
        parseHTML: (element) => element.getAttribute('class'),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span.material-symbols-outlined',
      },
      {
        tag: 'span',
        getAttrs: (element) => {
          const cls = element.getAttribute('class') || '';
          return cls.includes('material-symbols-outlined') ? {} : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const TableOfContentsBlock = Node.create({
  name: 'tableOfContents',
  group: 'block',
  content: 'block*',
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      'data-type': {
        default: 'table-of-contents',
        parseHTML: (element) => element.getAttribute('data-type') || 'table-of-contents',
      },
      class: {
        default: 'toc-container my-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 not-prose',
        parseHTML: (element) => element.getAttribute('class'),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="table-of-contents"]',
      },
      {
        tag: 'div.toc-container',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'table-of-contents' }), 0];
  },
});

const editor = new Editor({
  extensions: [StarterKit, IconSpan, TableOfContentsBlock],
  content: `
    <h2>First Major Section</h2>
    <p>Some paragraph text</p>
    <div data-type="table-of-contents" class="toc-container my-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 not-prose">
      <p><span class="material-symbols-outlined text-[16px] text-primary">format_list_bulleted</span> Table of Contents</p>
      <ul>
        <li><a href="#first-major-section">First Major Section</a></li>
        <li><a href="#second-major-section">Second Major Section</a></li>
      </ul>
    </div>
    <h2>Second Major Section</h2>
    <p>Another paragraph</p>
  `,
});

console.log('--- OUTPUT HTML ---');
console.log(editor.getHTML());
console.log('\n--- OUTPUT JSON ---');
console.log(JSON.stringify(editor.getJSON(), null, 2));
