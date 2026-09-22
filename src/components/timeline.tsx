import type { ReactNode } from 'react';

export function Timeline({ children }: { children: ReactNode }) {
  return (
    <ol className="border-fd-border relative my-6 ml-1 list-none border-l-2 pl-6">
      {children}
    </ol>
  );
}

export function TimelineItem({
  era,
  title,
  children,
}: {
  era: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <li className="relative pb-8 last:pb-0">
      <span className="bg-fd-primary ring-fd-background absolute top-1 -left-[31px] size-3 rounded-full ring-4" />
      <p className="text-fd-muted-foreground text-sm font-medium">{era}</p>
      <h3 className="mt-0.5 mb-1 text-base font-semibold">{title}</h3>
      {children && (
        <div className="text-fd-muted-foreground text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      )}
    </li>
  );
}
