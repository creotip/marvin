import { ArrowUpRight } from 'lucide-react';

export function ReadPaper({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="border-fd-primary/40 text-fd-primary hover:bg-fd-primary/10 my-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold no-underline transition-colors"
    >
      Read the paper — {children}
      <ArrowUpRight className="size-4" />
    </a>
  );
}
