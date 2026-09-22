import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

interface MdastNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdastNode[];
  data?: { hProperties?: Record<string, string> };
}

export interface ReferenceTerm {
  /** The phrase to match in prose. */
  term: string;
  /** The reference page's own title, used as the preview heading. */
  title: string;
  url: string;
  /** Acronym terms ("RAG", "GPU") only match when the casing matches too. */
  caseSensitive: boolean;
  description?: string;
}

/**
 * Reference titles are written as `CNN (Convolutional Neural Network)`, which
 * nobody types verbatim in prose. Both halves have to be matchable or the page
 * is never linked at all.
 */
export function titleAliases(title: string): string[] {
  const parenthesised = /^(.+?)\s*\((.+)\)$/.exec(title);
  if (!parenthesised) return [title];

  return [
    ...new Set([parenthesised[1].trim(), parenthesised[2].trim()]),
  ].filter(Boolean);
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

export function readFrontmatterField(
  source: string,
  field: string,
): string | undefined {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!frontmatter) return undefined;

  // Values may wrap onto following indented lines.
  const value = new RegExp(`^${field}:\\s*(.+(?:\\n\\s+\\S.*)*)$`, 'm').exec(
    frontmatter[1],
  );
  return value?.[1]
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '');
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

    const source = readFileSync(filePath, 'utf8');
    const title = readFrontmatterField(source, 'title');
    if (!title) continue;

    const url = [baseUrl, ...segments].join('/');
    const description = readFrontmatterField(source, 'description');

    for (const term of titleAliases(title)) {
      terms.push({
        term,
        title,
        url,
        caseSensitive: /[A-Z]{2,}/.test(term),
        description,
      });
    }
  }

  // Longest first so "neural network" wins over "network" at the same position.
  return terms.sort((a, b) => b.term.length - a.term.length);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Acronyms have to match casing or "rag" links to RAG, but only the acronym
 * word does — prose writes "KV cache" where the page title says "KV Cache".
 */
function acronymCasingMatches(term: string, matched: string): boolean {
  const termWords = term.split(/\s+/);
  const matchedWords = matched.split(/\s+/);
  if (termWords.length !== matchedWords.length) return false;

  return termWords.every(
    (word, i) => !/[A-Z]{2,}/.test(word) || word === matchedWords[i],
  );
}

/**
 * Shared matching rules, so the auto-linker and the backlink scanner can never
 * disagree about what counts as a mention.
 */
export function createTermMatcher(terms: ReferenceTerm[]) {
  const byLowercase = new Map(
    terms.map((term) => [term.term.toLowerCase(), term]),
  );

  return {
    pattern: new RegExp(
      `\\b(${terms.map((term) => escapeRegExp(term.term)).join('|')})(s|es)?\\b`,
      'gi',
    ),
    resolve(match: RegExpExecArray): ReferenceTerm | undefined {
      const term = byLowercase.get(match[1].toLowerCase());
      if (!term) return undefined;
      if (term.caseSensitive && !acronymCasingMatches(term.term, match[1])) {
        return undefined;
      }
      return term;
    },
  };
}

function collectExistingLinks(node: MdastNode, into: Set<string>): void {
  if (node.type === 'link' && node.url) into.add(node.url);
  for (const child of node.children ?? []) collectExistingLinks(child, into);
}

/**
 * Annotates every link pointing at a reference page — hand-written ones as well
 * as the auto-generated ones — so the client can show a hover preview. Lives in
 * `data.hProperties`, which the markdown serialiser ignores.
 */
export function remarkReferencePreviews(terms: ReferenceTerm[]) {
  const byUrl = new Map(
    terms
      .filter((term) => term.description)
      .map((term) => [term.url, term] as const),
  );

  return function transform(tree: MdastNode): void {
    function walk(node: MdastNode): void {
      if (node.type === 'link' && node.url) {
        const term = byUrl.get(node.url);
        if (term) {
          node.data ??= {};
          node.data.hProperties = {
            ...node.data.hProperties,
            'data-preview-title': term.title,
            'data-preview': term.description!,
          };
        }
      }

      for (const child of node.children ?? []) walk(child);
    }

    walk(tree);
  };
}

export function remarkReferenceLinks(terms: ReferenceTerm[]) {
  const { pattern, resolve } = createTermMatcher(terms);

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
        const term = resolve(match);
        if (!term) continue;
        if (used.has(term.url)) continue;

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
