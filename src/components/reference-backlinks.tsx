import Link from 'next/link';

import {
  collectReferenceBacklinks,
  type Backlink,
} from '@/lib/reference-backlinks';
import { collectReferenceTerms } from '@/lib/remark-reference-links';
import type { Collection } from '@/lib/content';

const cache = new Map<string, Map<string, Backlink[]>>();

function backlinksFor(collection: Collection): Map<string, Backlink[]> {
  let forCollection = cache.get(collection.name);
  if (!forCollection) {
    forCollection = collectReferenceBacklinks(
      'content/docs',
      '/docs',
      collectReferenceTerms(collection.contentDir, collection.route),
    );
    cache.set(collection.name, forCollection);
  }
  return forCollection;
}

export function ReferenceBacklinks({
  collection,
  url,
}: {
  collection: Collection;
  url: string;
}) {
  const lessons = backlinksFor(collection).get(url);
  if (!lessons?.length) return null;

  return (
    <section className="mt-12 border-t pt-6">
      <h2 className="mb-1 text-sm font-medium">Mentioned in</h2>
      <p className="text-fd-muted-foreground mb-4 text-sm">
        Lessons where this comes up in context.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {lessons.map((lesson) => (
          <li key={lesson.url}>
            <Link
              href={lesson.url}
              className="bg-fd-card hover:bg-fd-accent block h-full rounded-lg border p-3 transition-colors"
            >
              <span className="block text-sm font-medium">{lesson.title}</span>
              {lesson.description && (
                <span className="text-fd-muted-foreground mt-1 line-clamp-2 block text-xs">
                  {lesson.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
