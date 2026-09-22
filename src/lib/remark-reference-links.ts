import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

interface MdastNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdastNode[];
}

export interface ReferenceTerm {
  term: string;
  url: string;
  /** Acronym titles ("RAG", "GPU") only match when the casing matches too. */
  caseSensitive: boolean;
}

/** Node types whose text must never be rewritten into a link. */
const SKIPPED = new Set([
  'code',
  'definition',
  'heading',
  'html',
  'image',
  'imageReference',
  'inlineCode',
  'link',
  'linkReference',
  'mdxFlowExpression',
  'mdxTextExpression',
  'mdxjsEsm',
  'yaml',
]);

function readFrontmatterTitle(source: string): string | undefined {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!frontmatter) return undefined;

  const title = /^title:\s*(.+)$/m.exec(frontmatter[1]);
  return title?.[1].trim().replace(/^["']|["']$/g, '');
}

export function collectReferenceTerms(
  dir: string,
  baseUrl: string,
): ReferenceTerm[] {
  const terms: ReferenceTerm[] = [];

  for (const entry of readdirSync(dir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;

    const filePath = path.join(entry.parentPath, entry.name);
    const segments = path
      .relative(dir, filePath)
      .split(path.sep)
      // Fumadocs treats `(group)` folders as organisational only.
      .filter((segment) => !/^\(.*\)$/.test(segment))
      .map((segment) => segment.replace(/\.mdx$/, ''));

    if (segments.at(-1) === 'index') continue;

    const title = readFrontmatterTitle(readFileSync(filePath, 'utf8'));
    if (!title) continue;

    terms.push({
      term: title,
      url: [baseUrl, ...segments].join('/'),
      caseSensitive: /[A-Z]{2,}/.test(title),
    });
  }

  // Longest first so "neural network" wins over "network" at the same position.
  return terms.sort((a, b) => b.term.length - a.term.length);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectExistingLinks(node: MdastNode, into: Set<string>): void {
  if (node.type === 'link' && node.url) into.add(node.url);
  for (const child of node.children ?? []) collectExistingLinks(child, into);
}

export function remarkReferenceLinks(terms: ReferenceTerm[]) {
  const byLowercase = new Map(
    terms.map((term) => [term.term.toLowerCase(), term]),
  );
  const pattern = new RegExp(
    `\\b(${terms.map((term) => escapeRegExp(term.term)).join('|')})(s|es)?\\b`,
    'gi',
  );

  return function transform(tree: MdastNode): void {
    const used = new Set<string>();
    collectExistingLinks(tree, used);

    function linkText(node: MdastNode): MdastNode[] | undefined {
      const value = node.value ?? '';
      const replacement: MdastNode[] = [];
      let cursor = 0;

      pattern.lastIndex = 0;
      for (
        let match = pattern.exec(value);
        match !== null;
        match = pattern.exec(value)
      ) {
        const term = byLowercase.get(match[1].toLowerCase());
        if (!term) continue;
        if (used.has(term.url)) continue;
        if (term.caseSensitive && match[1] !== term.term) continue;

        used.add(term.url);
        if (match.index > cursor) {
          replacement.push({
            type: 'text',
            value: value.slice(cursor, match.index),
          });
        }
        replacement.push({
          type: 'link',
          url: term.url,
          children: [{ type: 'text', value: match[0] }],
        });
        cursor = match.index + match[0].length;
      }

      if (replacement.length === 0) return undefined;
      if (cursor < value.length) {
        replacement.push({ type: 'text', value: value.slice(cursor) });
      }
      return replacement;
    }

    function walk(node: MdastNode): void {
      if (!node.children) return;

      const children: MdastNode[] = [];
      for (const child of node.children) {
        if (SKIPPED.has(child.type)) {
          children.push(child);
          continue;
        }

        if (child.type === 'text') {
          const linked = linkText(child);
          if (linked) {
            children.push(...linked);
            continue;
          }
          children.push(child);
          continue;
        }

        walk(child);
        children.push(child);
      }

      node.children = children;
    }

    walk(tree);
  };
}
