import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  createTermMatcher,
  readFrontmatterField,
  type ReferenceTerm,
} from './remark-reference-links';

export interface Backlink {
  title: string;
  url: string;
  description?: string;
}

/**
 * Strips everything a reader would not count as prose, so a term appearing in a
 * Mermaid chart, an import, or a code sample does not manufacture a backlink.
 */
function proseOnly(source: string): string {
  return (
    source
      .replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
      .replace(/```[\s\S]*?```/g, ' ')
      // Mermaid charts and other JSX props are template literals.
      .replace(/`[^`]*`/g, ' ')
      .replace(/^import\s.+$/gm, ' ')
      // Keeps the link text, drops the target.
      .replace(/\]\([^)]*\)/g, '] ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/^#{1,6}\s.*$/gm, ' ')
  );
}

/**
 * Maps each reference page url to the lessons that mention it, giving the
 * glossary a way back into the curriculum.
 */
export function collectReferenceBacklinks(
  dir: string,
  baseUrl: string,
  terms: ReferenceTerm[],
): Map<string, Backlink[]> {
  const { pattern, resolve } = createTermMatcher(terms);
  const backlinks = new Map<string, Backlink[]>();

  for (const entry of readdirSync(dir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;

    const filePath = path.join(entry.parentPath, entry.name);
    const segments = path
      .relative(dir, filePath)
      .split(path.sep)
      .filter((segment) => !/^\(.*\)$/.test(segment))
      .map((segment) => segment.replace(/\.mdx$/, ''));

    if (segments.at(-1) === 'index') continue;

    const source = readFileSync(filePath, 'utf8');
    const title = readFrontmatterField(source, 'title');
    if (!title) continue;

    const lesson: Backlink = {
      title,
      url: [baseUrl, ...segments].join('/'),
      description: readFrontmatterField(source, 'description'),
    };

    const mentioned = new Set<string>();
    const prose = proseOnly(source);

    pattern.lastIndex = 0;
    for (
      let match = pattern.exec(prose);
      match !== null;
      match = pattern.exec(prose)
    ) {
      const term = resolve(match);
      if (term) mentioned.add(term.url);
    }

    for (const url of mentioned) {
      backlinks.set(url, [...(backlinks.get(url) ?? []), lesson]);
    }
  }

  for (const lessons of backlinks.values()) {
    lessons.sort((a, b) => a.title.localeCompare(b.title));
  }

  return backlinks;
}
