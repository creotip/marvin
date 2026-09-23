import Link from 'next/link';
import { reference } from '@/lib/content';

export function GlossaryIndex() {
  const pages = reference.source
    .getPages()
    .filter(
      (page) => page.url !== reference.route && page.slugs.join('/') !== 'a-z',
    )
    .sort((a, b) => a.data.title.localeCompare(b.data.title));

  const groups = new Map<string, typeof pages>();
  for (const page of pages) {
    const first = page.data.title[0]?.toUpperCase() ?? '#';
    const letter = /[A-Z]/.test(first) ? first : '#';
    groups.set(letter, [...(groups.get(letter) ?? []), page]);
  }
  const letters = [...groups.keys()].sort();

  return (
    <div className="not-prose my-6">
      <nav
        aria-label="Jump to letter"
        className="mb-8 flex flex-wrap gap-1 text-sm"
      >
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground flex size-7 items-center justify-center rounded-md transition-colors"
          >
            {letter}
          </a>
        ))}
      </nav>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`}>
            <h3 className="text-fd-muted-foreground mb-2 border-b pb-1 text-sm font-semibold">
              {letter}
            </h3>
            <ul className="space-y-1.5">
              {groups.get(letter)!.map((page) => (
                <li key={page.url}>
                  <Link
                    href={page.url}
                    className="hover:text-fd-primary text-sm font-medium"
                  >
                    {page.data.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
