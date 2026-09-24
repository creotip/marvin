import Link from 'next/link';
import type { ReactNode } from 'react';

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Renders a `faq-data.ts` answer string, turning `[label](/url)` into real links. */
export function renderFaqAnswer(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, label, href] = match;
    const index = match.index;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    parts.push(
      <Link
        key={key++}
        href={href}
        className="text-fd-primary underline underline-offset-2"
      >
        {label}
      </Link>,
    );
    lastIndex = index + full.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts;
}

/** Strips `[label](/url)` down to plain `label` text, for the FAQPage JSON-LD schema. */
export function stripFaqLinks(text: string): string {
  return text.replace(LINK_PATTERN, '$1');
}
