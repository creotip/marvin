import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  collectReferenceBacklinks,
  type Backlink,
} from './reference-backlinks';
import type { ReferenceTerm } from './remark-reference-links';

const term = (
  text: string,
  url: string,
  caseSensitive = false,
): ReferenceTerm => ({ term: text, title: text, url, caseSensitive });

const terms: ReferenceTerm[] = [
  term('neural network', '/reference/neural-network'),
  term('GPU', '/reference/gpu', true),
  term('quantization', '/reference/quantization'),
  term('agent', '/reference/agent'),
].sort((a, b) => b.term.length - a.term.length);

describe('collectReferenceBacklinks', () => {
  let dir: string;
  let backlinks: Map<string, Backlink[]>;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'marvin-backlinks-'));
    mkdirSync(path.join(dir, '(foundations)'));

    const write = (file: string, body: string) =>
      writeFileSync(path.join(dir, file), body);

    write(
      '(foundations)/ml-fundamentals.mdx',
      `---
title: ML Fundamentals
description: How learning from data works.
---

import { Thing } from '@/components/thing';

A neural network learns from examples. Another neural network here.

## A GPU heading that should not count

<Mermaid chart={\`flowchart LR
  A[Train on a GPU] --> B[Done]
\`} />

\`\`\`py
# quantization in a code block
\`\`\`

Inline \`quantization\` too.

See the [agent page](/reference/agent) for more.
`,
    );
    write(
      'llms.mdx',
      `---
title: LLMs
description: Language models end to end.
---

Running on a GPU matters. Lowercase gpu should not count on its own.
`,
    );
    write('index.mdx', `---\ntitle: Docs\n---\n\nA neural network.\n`);

    backlinks = collectReferenceBacklinks(dir, '/docs', terms);
  });

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('maps a term to the lesson that mentions it', () => {
    expect(backlinks.get('/reference/neural-network')).toEqual([
      {
        title: 'ML Fundamentals',
        url: '/docs/ml-fundamentals',
        description: 'How learning from data works.',
      },
    ]);
  });

  it('lists a lesson once however many times it mentions the term', () => {
    expect(backlinks.get('/reference/neural-network')).toHaveLength(1);
  });

  it('strips (group) folders from the lesson url', () => {
    expect(backlinks.get('/reference/neural-network')?.[0].url).toBe(
      '/docs/ml-fundamentals',
    );
  });

  it('ignores mentions in headings, charts, code blocks, and inline code', () => {
    expect(backlinks.get('/reference/quantization')).toBeUndefined();
    // The only real GPU mention is in llms.mdx; ml-fundamentals has it in a
    // heading and a Mermaid chart.
    expect(backlinks.get('/reference/gpu')?.map((l) => l.title)).toEqual([
      'LLMs',
    ]);
  });

  it('counts the text of a hand-written link but not its target', () => {
    expect(backlinks.get('/reference/agent')?.map((l) => l.title)).toEqual([
      'ML Fundamentals',
    ]);
  });

  it('respects case sensitivity for acronyms', () => {
    expect(backlinks.get('/reference/gpu')).toHaveLength(1);
  });

  it('skips index pages', () => {
    const titles = [...backlinks.values()].flat().map((l) => l.title);
    expect(titles).not.toContain('Docs');
  });

  it('sorts lessons by title', () => {
    const many = collectReferenceBacklinks(dir, '/docs', [
      term('a', '/reference/a'),
    ]);
    const titles = many.get('/reference/a')?.map((l) => l.title) ?? [];
    expect(titles).toEqual([...titles].sort());
  });
});
