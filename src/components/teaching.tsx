import type { ReactNode } from 'react';
import { AlertTriangle, Calculator } from 'lucide-react';

export function NapkinMath({
  title = 'Napkin math',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <figure className="bg-fd-muted/40 my-6 rounded-lg border border-dashed px-4 py-3">
      <figcaption className="text-fd-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
        <Calculator className="size-4" />
        {title}
      </figcaption>
      <div className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </figure>
  );
}

export function Misconception({
  claim,
  children,
}: {
  claim: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-6 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3">
      <p className="mb-2 flex items-start gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>You might think: {claim}</span>
      </p>
      <div className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
