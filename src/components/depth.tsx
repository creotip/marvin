'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { ChevronDown, Sigma } from 'lucide-react';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'marvin:show-depth';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useExpanded(): [boolean, () => void] {
  const expanded = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY) === 'true',
    () => false,
  );

  const toggle = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEY,
      String(localStorage.getItem(STORAGE_KEY) !== 'true'),
    );
    for (const listener of listeners) listener();
  }, []);

  return [expanded, toggle];
}

const DeeperCountContext = createContext<{
  count: number;
  register: () => () => void;
} | null>(null);

export function DepthProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const register = useCallback(() => {
    setCount((previous) => previous + 1);
    return () => setCount((previous) => previous - 1);
  }, []);

  return (
    <DeeperCountContext value={{ count, register }}>
      {children}
    </DeeperCountContext>
  );
}

export function DepthToggle() {
  const [expanded, toggle] = useExpanded();
  const count = useContext(DeeperCountContext)?.count ?? 0;

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={expanded}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors',
        expanded
          ? 'border-fd-primary/40 bg-fd-primary/10 text-fd-primary'
          : 'text-fd-muted-foreground hover:bg-fd-accent',
      )}
    >
      <Sigma className="size-4" />
      {expanded
        ? 'Hide deep dives'
        : `Show ${count} deep dive${count === 1 ? '' : 's'}`}
    </button>
  );
}

/**
 * Advanced material stays in the DOM when collapsed so it remains searchable
 * and indexable.
 */
export function Deeper({
  title = 'Under the hood',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const [globallyExpanded] = useExpanded();
  const [locallyOpen, setLocallyOpen] = useState(false);
  const expanded = locallyOpen || globallyExpanded;

  const register = useContext(DeeperCountContext)?.register;
  useEffect(() => register?.(), [register]);

  return (
    <div className="border-fd-primary/25 bg-fd-primary/[0.03] my-6 overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setLocallyOpen(!expanded)}
        aria-expanded={expanded}
        className="hover:bg-fd-primary/5 flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium"
      >
        <Sigma className="text-fd-primary size-4 shrink-0" />
        <span className="flex-1">{title}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>
      <div
        hidden={!expanded}
        className="border-t px-4 pb-1 [&>*:first-child]:mt-3"
      >
        {children}
      </div>
    </div>
  );
}
