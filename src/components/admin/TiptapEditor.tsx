'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Mark, Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import DOMPurify from 'isomorphic-dompurify';

export const IconSpan = Mark.create({
  name: 'iconSpan',
  addAttributes() {
    return {
      class: {
        default: 'material-symbols-outlined',
        parseHTML: (element) => element.getAttribute('class') || 'material-symbols-outlined',
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
          const cls = (element as HTMLElement).getAttribute('class') || '';
          return cls.includes('material-symbols-outlined') ? {} : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

export const TableOfContentsBlock = Node.create({
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
        default: 'toc-container my-6 p-5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 not-prose',
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

interface TiptapEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  postId?: string; // Stable post identifier (e.g. initialPost?.id || 'new') to prevent race conditions during active editing
  onDocumentChange?: (doc: any) => void;
  onPlainTextChange?: (text: string) => void;
  onWordCountChange?: (words: number) => void;
  isDarkMode?: boolean;
  minHeight?: number;
  placeholder?: string;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value,
  onChange,
  postId = 'new',
  onDocumentChange,
  onPlainTextChange,
  onWordCountChange,
  isDarkMode = false,
  minHeight = 480,
  placeholder = 'Type your article here, or paste formatted content from WordPress...',
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [headingCount, setHeadingCount] = useState(0);
  const [tocNotice, setTocNotice] = useState<{ message: string; type: 'info' | 'warn' | 'success' } | null>(null);

  // Setup Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Strictly allow H2, H3, H4. No H1 — the post title field IS the H1
        heading: {
          levels: [2, 3, 4],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary pl-4 py-1 my-4 italic text-secondary bg-surface-container-low/40 rounded-r-lg',
          },
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-primary underline font-medium hover:text-primary-container transition-colors',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-5 border border-outline-variant/30 shadow-xs block mx-auto',
        },
      }),
      IconSpan,
      TableOfContentsBlock,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        'data-tiptap-editor': 'true',
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-hidden min-h-[${minHeight}px] px-6 py-5 text-on-surface selection:bg-primary-container selection:text-on-primary`,
        style: `min-height: ${minHeight}px;`,
      },
      // Tiptap's HTML parser naturally parses pasted WordPress / Google Docs HTML:
      // Preserves h2, h3, h4, strong, em, a, ul, ol, blockquote, img as real nodes
      transformPastedHTML(html) {
        // Basic normalization if needed; Tiptap schema parser handles the rest
        return html;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();

      // Clean & sanitize HTML before emitting
      const cleanHtml = DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'frameborder', 'data-type'],
      });

      onChange(cleanHtml);

      if (onPlainTextChange) {
        onPlainTextChange(text);
      }

      if (onDocumentChange) {
        onDocumentChange(editor.getJSON());
      }

      // Count H2 and H3 headings for TOC support (ignoring any existing TOC block)
      let hCount = 0;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'tableOfContents') return false;
        if (node.type.name === 'heading') {
          const level = node.attrs.level;
          if (level === 2 || level === 3) hCount++;
        }
      });
      setHeadingCount(hCount);

      // Compute word count
      const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      if (onWordCountChange) {
        onWordCountChange(words);
      }
    },
  });

  // Stable post identifier tracking to prevent race conditions during active editing
  const lastLoadedPostIdRef = useRef<string | null>(null);

  // Sync external value changes ONLY when loading a genuinely different post
  // (e.g. initial mount or navigating between /admin/edit/[id] routes),
  // NEVER on every keystroke/render or toolbar button blur!
  useEffect(() => {
    if (!editor) return;

    if (lastLoadedPostIdRef.current !== postId) {
      lastLoadedPostIdRef.current = postId;
      const currentHtml = editor.getHTML();
      if (value && value !== currentHtml) {
        editor.commands.setContent(value, { emitUpdate: false });
      }

      if (onDocumentChange) {
        onDocumentChange(editor.getJSON());
      }
    }

    // Initial heading count scan (ignoring any existing TOC block)
    let hCount = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'tableOfContents') return false;
      if (node.type.name === 'heading') {
        const level = node.attrs.level;
        if (level === 2 || level === 3) hCount++;
      }
    });
    setHeadingCount(hCount);
  }, [postId, editor]);

  // Compute live metrics from editor
  const textContent = editor?.getText() || '';
  const wordCount = useMemo(() => {
    return textContent.trim() ? textContent.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [textContent]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 225));
  }, [wordCount]);

  // ============================================================
  // FIX #1: Heading/paragraph toggles now always collapse the
  // selection down to a single cursor position BEFORE applying
  // the block command, so a heading toggle can only ever affect
  // the ONE block the selection started in — never an adjacent
  // line, even if the browser selection visually spanned into it.
  // ============================================================
  const applyBlockType = useCallback(
    (action: (chain: ReturnType<typeof editor.chain>) => ReturnType<typeof editor.chain>) => {
      if (!editor) return;
      const { from } = editor.state.selection;
      const chain = editor.chain().focus().setTextSelection(from);
      action(chain).run();
    },
    [editor]
  );

  const setParagraphSafe = useCallback(() => {
    if (!editor) return;
    const { from } = editor.state.selection;
    editor.chain().focus().setTextSelection(from).setParagraph().run();
  }, [editor]);

  const toggleHeadingSafe = useCallback(
    (level: 2 | 3 | 4) => {
      if (!editor) return;
      const { from } = editor.state.selection;
      editor.chain().focus().setTextSelection(from).toggleHeading({ level }).run();
    },
    [editor]
  );

  // Handle Link Dialog Submit
  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let formattedUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('/') && !formattedUrl.startsWith('#')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: formattedUrl })
        .run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  // Handle Image Dialog Submit
  const handleSetImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || undefined }).run();
    setIsImageModalOpen(false);
    setImageUrl('');
    setImageAlt('');
  }, [editor, imageUrl, imageAlt]);

  // Table of Contents insert helper
  const handleInsertTOC = useCallback(() => {
    if (!editor) return;

    // Scan for real H2 and H3 headings in the document
    const headings: { level: number; text: string; id: string }[] = [];
    const usedIds = new Set<string>();

    editor.state.doc.descendants((node) => {
      // 1. NEVER descend into existing TOC block
      if (node.type.name === 'tableOfContents') {
        return false;
      }

      // 2. Read ONLY real H2 or H3 heading nodes
      if (node.type.name === 'heading') {
        const level = node.attrs.level;
        if (level === 2 || level === 3) {
          // Extract text strictly from this specific heading node's own inline content
          let headingText = '';

          if (node.content && node.content.size > 0) {
            for (let i = 0; i < node.content.childCount; i++) {
              const child = node.content.child(i);
              // Stop reading at any hard break (<br>) so body text below <br> is never pulled
              if (child.type.name === 'hardBreak') {
                break;
              }
              if (child.isText && child.text) {
                headingText += child.text;
              }
            }
          }

          if (!headingText) {
            headingText = node.textContent || '';
          }

          // Strictly extract ONLY the first single line of this heading
          const firstLine = headingText.split(/\r?\n/)[0].trim();
          const cleanText = firstLine.replace(/<[^>]*>/g, '').trim();

          if (cleanText) {
            // Generate clean anchor slug
            let baseId = cleanText
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-');

            if (!baseId) {
              baseId = `heading-${headings.length + 1}`;
            }

            // Ensure unique ID in case of duplicate heading titles
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

    // If no headings exist, do NOT insert any placeholder block
    if (headings.length === 0) {
      setTocNotice({
        message: 'Cannot insert Table of Contents: No H2 or H3 headings exist in this document. Add at least one heading first.',
        type: 'warn',
      });
      setTimeout(() => setTocNotice(null), 5000);
      return;
    }

    const itemsHtml = headings
      .map(
        (h) =>
          `<li class="${h.level === 3 ? 'ml-5 list-circle text-on-surface-variant' : 'list-disc font-medium'} my-1.5"><a href="#${h.id}" class="text-primary hover:underline">${h.text}</a></li>`
      )
      .join('');

    const tocHtml = `<div data-type="table-of-contents" class="toc-container my-6 p-5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 not-prose"><p class="text-xs font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-1.5"><span class="material-symbols-outlined text-[18px] text-primary">format_list_bulleted</span> Table of Contents (${headings.length} Sections)</p><ul class="space-y-1 text-sm pl-4">${itemsHtml}</ul></div><p></p>`;

    // Check if an existing TOC block already exists in the document
    let existingTocPos: number | null = null;
    let existingTocSize = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableOfContents') {
        existingTocPos = pos;
        existingTocSize = node.nodeSize;
        return false;
      }
    });

    if (existingTocPos !== null) {
      // Cleanly replace existing TOC in-place to avoid duplicates
      editor
        .chain()
        .focus()
        .deleteRange({ from: existingTocPos, to: existingTocPos + existingTocSize })
        .insertContentAt(existingTocPos, tocHtml)
        .run();
    } else {
      // ============================================================
      // FIX #2: Insert the TOC at the very start of the document
      // (position 0) instead of at the current selection.
      // `insertContent()` at a selection REPLACES whatever text is
      // currently selected — this was the cause of Insert TOC
      // deleting existing heading lines. insertContentAt(0, ...)
      // always inserts before the first block, never touching or
      // replacing any existing content, and matches where a real
      // table of contents normally belongs in an article.
      // ============================================================
      editor.chain().focus().insertContentAt(0, tocHtml).run();
    }

    setTocNotice({
      message: `Table of Contents inserted successfully with ${headings.length} clickable heading link${headings.length === 1 ? '' : 's'}.`,
      type: 'success',
    });
    setTimeout(() => setTocNotice(null), 4000);
  }, [editor]);

  if (!editor) {
    return (
      <div className="w-full h-96 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-secondary text-xs gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Initializing block editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Editor Header Label & Live Stats */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
          <span>Article Body (Block Editor)</span>
          <span className="text-error">*</span>
        </label>
        <div className="flex items-center gap-3 text-xs text-secondary font-mono">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>~{readingTimeMinutes} min read</span>
        </div>
      </div>

      {/* Main Block Editor Card */}
      <div
        className={`w-full rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-lowest focus-within:border-primary transition-all shadow-xs ${isDarkMode ? 'dark' : ''
          }`}
      >
        {/* Gutenberg / Rank Math Styled Toolbar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-surface-container-low border-b border-outline-variant/30 backdrop-blur-md">
          {/* Block Type Dropdown / Selectors: Normal, H2, H3, H4 */}
          <div className="flex items-center gap-0.5 bg-surface-container rounded-lg p-0.5 border border-outline-variant/30">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={setParagraphSafe}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${editor.isActive('paragraph') && !editor.isActive('heading')
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-container-high'
                }`}
              title="Paragraph / Body text"
            >
              P
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleHeadingSafe(2)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${editor.isActive('heading', { level: 2 })
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-container-high'
                }`}
              title="Heading 2 (Main section)"
            >
              H2
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleHeadingSafe(3)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${editor.isActive('heading', { level: 3 })
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-container-high'
                }`}
              title="Heading 3 (Subsection)"
            >
              H3
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggleHeadingSafe(4)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${editor.isActive('heading', { level: 4 })
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-container-high'
                }`}
              title="Heading 4 (Minor subsection)"
            >
              H4
            </button>
          </div>

          <div className="w-[1px] h-5 bg-outline-variant/30 mx-1" />

          {/* Inline formatting: Bold, Italic */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${editor.isActive('bold')
                ? 'bg-primary/15 text-primary font-bold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            title="Bold (Ctrl+B)"
          >
            <span className="material-symbols-outlined text-[17px]">format_bold</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${editor.isActive('italic')
                ? 'bg-primary/15 text-primary font-bold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            title="Italic (Ctrl+I)"
          >
            <span className="material-symbols-outlined text-[17px]">format_italic</span>
          </button>

          {/* Link Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href || '';
              setLinkUrl(previousUrl);
              setIsLinkModalOpen(true);
            }}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${editor.isActive('link')
                ? 'bg-primary/15 text-primary font-bold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            title="Insert or Edit Link"
          >
            <span className="material-symbols-outlined text-[17px]">link</span>
          </button>

          <div className="w-[1px] h-5 bg-outline-variant/30 mx-1" />

          {/* Lists: Bullet, Numbered */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${editor.isActive('bulletList')
                ? 'bg-primary/15 text-primary font-bold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            title="Bullet List"
          >
            <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${editor.isActive('orderedList')
                ? 'bg-primary/15 text-primary font-bold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            title="Numbered List"
          >
            <span className="material-symbols-outlined text-[17px]">format_list_numbered</span>
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${editor.isActive('blockquote')
                ? 'bg-primary/15 text-primary font-bold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            title="Blockquote / Callout"
          >
            <span className="material-symbols-outlined text-[17px]">format_quote</span>
          </button>

          {/* Image Insert */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsImageModalOpen(true)}
            className="p-1.5 rounded-lg text-xs text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Insert Inline Image"
          >
            <span className="material-symbols-outlined text-[17px]">image</span>
          </button>

          <div className="w-[1px] h-5 bg-outline-variant/30 mx-1" />

          {/* Table of Contents Insert Button */}
          <div className="relative flex items-center">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleInsertTOC}
              disabled={headingCount === 0}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${headingCount > 0
                  ? 'text-primary bg-primary/10 hover:bg-primary/20 border-primary/30 cursor-pointer shadow-xs font-semibold'
                  : 'text-secondary/50 bg-surface-container/40 border-outline-variant/20 cursor-not-allowed opacity-60'
                }`}
              title={
                headingCount > 0
                  ? `Insert Table of Contents generated from ${headingCount} heading${headingCount === 1 ? '' : 's'}`
                  : 'Cannot insert TOC: No H2 or H3 headings found in document yet. Add headings first.'
              }
            >
              <span className="material-symbols-outlined text-[16px]">toc</span>
              <span className="text-[11px]">Insert TOC</span>
              {headingCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[10px] font-mono font-bold leading-tight">
                  {headingCount}
                </span>
              ) : (
                <span className="text-[10px] text-secondary/70 font-mono">(0)</span>
              )}
            </button>
          </div>

          <div className="grow" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <span className="material-symbols-outlined text-[17px]">undo</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <span className="material-symbols-outlined text-[17px]">redo</span>
            </button>
          </div>
        </div>

        {/* TOC Notification Banner */}
        {tocNotice && (
          <div
            className={`px-4 py-2 text-xs flex items-center justify-between border-b transition-colors ${tocNotice.type === 'warn'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                {tocNotice.type === 'warn' ? 'warning' : 'check_circle'}
              </span>
              <span className="font-medium">{tocNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setTocNotice(null)}
              className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}

        {/* Tiptap Editable Area */}
        <div className="relative cursor-text">
          <EditorContent editor={editor} />
          {editor.isEmpty && (
            <div className="absolute top-5 left-6 text-secondary/50 pointer-events-none text-sm select-none">
              {placeholder}
            </div>
          )}
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between text-[11px] text-secondary">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
          <span>WordPress Gutenberg HTML paste fully supported. Headings (H2–H4), bold, lists, and links preserved.</span>
        </span>
        <span>H1 reserved for article title</span>
      </div>

      {/* Link Insertion Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">link</span>
                <span>Insert or Edit Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary">Destination URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://venturegraph.me/articles/... or external URL"
                className="w-full h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSetLink();
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {editor.isActive('link') ? (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setIsLinkModalOpen(false);
                  }}
                  className="text-xs text-error hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">link_off</span>
                  <span>Remove Link</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-secondary hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSetLink}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer shadow-xs"
                >
                  Apply Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Insertion Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">image</span>
                <span>Insert Inline Image</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... image link or Supabase storage URL"
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-secondary">Alt Text (Accessibility &amp; SEO)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe image for SEO and screen readers"
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-hidden focus:border-primary transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSetImage();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-secondary hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetImage}
                disabled={!imageUrl.trim()}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};