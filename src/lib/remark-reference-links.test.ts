import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  collectReferenceTerms,
  remarkReferenceLinks,
  remarkReferencePreviews,
  type ReferenceTerm,
} from './remark-reference-links';

type Node = {
  type: string;
  value?: string;
  url?: string;
  children?: Node[];
  data?: { hProperties?: Record<string, string> };
};

const text = (value: string): Node => ({ type: 'text', value });
const paragraph = (...children: Node[]): Node => ({
  type: 'paragraph',
  children,
});
const root = (...children: Node[]): Node => ({ type: 'root', children });

/** Flattens a tree into `text` / `link(url)` tokens so assertions stay legible. */
function tokens(node: Node): string[] {
  if (node.type === 'link') return [`link(${node.url})`];
  if (node.type === 'text') return [node.value ?? ''];
  return (node.children ?? []).flatMap(tokens);
}

function linkedText(node: Node): string[] {
  if (node.type === 'link') return [(node.children ?? []).map(tokens).join('')];
  return (node.children ?? []).flatMap(linkedText);
}

/** All text in the tree, ignoring node types entirely. */
function rawText(node: Node): string {
  return node.type === 'text'
    ? (node.value ?? '')
    : (node.children ?? []).map(rawText).join('');
}

function countLinks(node: Node): number {
  return (
    (node.type === 'link' ? 1 : 0) +
    (node.children ?? []).reduce((sum, child) => sum + countLinks(child), 0)
  );
}

describe('collectReferenceTerms', () => {
  let dir: string;
  let terms: ReferenceTerm[];

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'marvin-reference-'));
    mkdirSync(path.join(dir, '(foundations)'));

    const write = (file: string, body: string) =>
      writeFileSync(path.join(dir, file), body);

    write(
      '(foundations)/neural-network.mdx',
      `---
title: Neural network
description: A stack of layers that maps inputs to outputs.
---

Body.
`,
    );
    write(
      '(foundations)/rag.mdx',
      `---
title: RAG
description: Retrieval-augmented generation.
---
`,
    );
    write(
      '(foundations)/gpu.mdx',
      `---
title: "GPU"
description:
  A processor built for the wide parallel arithmetic
  that training needs.
---
`,
    );
    // Neither of these should become a term.
    write('index.mdx', `---\ntitle: Reference\n---\n`);
    write('untitled.mdx', `---\ndescription: No title here.\n---\n`);
    write('not-mdx.md', `---\ntitle: Ignored\n---\n`);

    terms = collectReferenceTerms(dir, '/reference');
  });

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('skips index pages, untitled pages, and non-mdx files', () => {
    expect(terms.map((t) => t.term).sort()).toEqual([
      'GPU',
      'Neural network',
      'RAG',
    ]);
  });

  it('strips (group) folders from the url', () => {
    expect(terms.find((t) => t.term === 'RAG')?.url).toBe('/reference/rag');
  });

  it('collapses wrapped descriptions and strips quotes from values', () => {
    const gpu = terms.find((t) => t.term === 'GPU');
    expect(gpu?.description).toBe(
      'A processor built for the wide parallel arithmetic that training needs.',
    );
  });

  it('marks acronym titles case-sensitive and ordinary titles not', () => {
    expect(terms.find((t) => t.term === 'RAG')?.caseSensitive).toBe(true);
    expect(terms.find((t) => t.term === 'Neural network')?.caseSensitive).toBe(
      false,
    );
  });

  it('sorts longest term first so specific terms win', () => {
    const lengths = terms.map((t) => t.term.length);
    expect(lengths).toEqual([...lengths].sort((a, b) => b - a));
  });
});

describe('remarkReferenceLinks', () => {
  const terms: ReferenceTerm[] = [
    { term: 'neural network', url: '/reference/neural-network', caseSensitive: false }, // prettier-ignore
    { term: 'network', url: '/reference/network', caseSensitive: false },
    { term: 'RAG', url: '/reference/rag', caseSensitive: true },
  ].sort((a, b) => b.term.length - a.term.length);

  const run = (tree: Node) => {
    remarkReferenceLinks(terms)(tree);
    return tree;
  };

  it('links a term and keeps the surrounding text intact', () => {
    const tree = run(root(paragraph(text('A neural network learns.'))));
    expect(tokens(tree)).toEqual([
      'A ',
      'link(/reference/neural-network)',
      ' learns.',
    ]);
  });

  it('links each term at most once per page', () => {
    const tree = run(
      root(
        paragraph(text('A neural network is a thing.')),
        paragraph(text('Another neural network.')),
      ),
    );
    expect(tokens(tree).filter((t) => t.startsWith('link('))).toHaveLength(1);
  });

  it('matches plurals and keeps the plural in the link text', () => {
    const tree = run(root(paragraph(text('Two neural networks.'))));
    expect(linkedText(tree)).toEqual(['neural networks']);
  });

  it('prefers the longest term at the same position', () => {
    const tree = run(root(paragraph(text('The neural network here.'))));
    expect(tokens(tree)).toContain('link(/reference/neural-network)');
    expect(tokens(tree)).not.toContain('link(/reference/network)');
  });

  it('matches ordinary terms regardless of case', () => {
    const tree = run(root(paragraph(text('Neural Network basics.'))));
    expect(tokens(tree)).toContain('link(/reference/neural-network)');
  });

  it('only matches acronyms when the casing matches', () => {
    expect(tokens(run(root(paragraph(text('Use rag for this.')))))).toEqual([
      'Use rag for this.',
    ]);
    expect(tokens(run(root(paragraph(text('Use RAG for this.')))))).toContain(
      'link(/reference/rag)',
    );
  });

  it.each([
    ['code', 0],
    ['heading', 0],
    ['inlineCode', 0],
    ['mdxTextExpression', 0],
    ['yaml', 0],
    // Already a link, so it keeps its own and gains none.
    ['link', 1],
  ])('never rewrites text inside a %s node', (type, expectedLinks) => {
    const tree = run(
      root({ type, url: '/elsewhere', children: [text('A neural network here.')] }), // prettier-ignore
    );
    expect(rawText(tree)).toBe('A neural network here.');
    expect(countLinks(tree)).toBe(expectedLinks);
  });

  it('leaves a term alone when the page already links to it by hand', () => {
    const tree = run(
      root(
        paragraph({
          type: 'link',
          url: '/reference/neural-network',
          children: [text('see this')],
        }),
        paragraph(text('A neural network learns.')),
      ),
    );
    expect(tokens(tree)).toEqual([
      'link(/reference/neural-network)',
      'A neural network learns.',
    ]);
  });

  it('leaves text with no matching term untouched', () => {
    const tree = run(root(paragraph(text('Nothing to link here.'))));
    expect(tokens(tree)).toEqual(['Nothing to link here.']);
  });
});

describe('remarkReferencePreviews', () => {
  const terms: ReferenceTerm[] = [
    {
      term: 'Neural network',
      url: '/reference/neural-network',
      caseSensitive: false,
      description: 'A stack of layers.',
    },
    { term: 'GPU', url: '/reference/gpu', caseSensitive: true },
  ];

  const link = (url: string, data?: Node['data']): Node => ({
    type: 'link',
    url,
    data,
    children: [text('x')],
  });

  const run = (tree: Node) => {
    remarkReferencePreviews(terms)(tree);
    return tree;
  };

  it('annotates links that point at a described reference page', () => {
    const node = link('/reference/neural-network');
    run(root(paragraph(node)));
    expect(node.data?.hProperties).toEqual({
      'data-preview-title': 'Neural network',
      'data-preview': 'A stack of layers.',
    });
  });

  it('ignores terms that have no description', () => {
    const node = link('/reference/gpu');
    run(root(paragraph(node)));
    expect(node.data?.hProperties).toBeUndefined();
  });

  it('ignores links that point somewhere else', () => {
    const node = link('/docs/llms');
    run(root(paragraph(node)));
    expect(node.data?.hProperties).toBeUndefined();
  });

  it('preserves hProperties that are already set', () => {
    const node = link('/reference/neural-network', {
      hProperties: { rel: 'nofollow' },
    });
    run(root(paragraph(node)));
    expect(node.data?.hProperties?.rel).toBe('nofollow');
    expect(node.data?.hProperties?.['data-preview-title']).toBe(
      'Neural network',
    );
  });
});
