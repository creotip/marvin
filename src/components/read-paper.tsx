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
      className="bg-fd-primary text-fd-primary-foreground my-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold no-underline transition-opacity hover:opacity-90"
    >
      Read the paper — {children}
      <ArrowUpRight className="size-4" />
    </a>
  );
}
