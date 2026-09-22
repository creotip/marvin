'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const OPEN_DELAY_MS = 180;
const CLOSE_DELAY_MS = 120;
const CARD_WIDTH = 288;

/**
 * Hover/focus preview for links into the reference glossary, so a reader can
 * check a term without leaving the lesson. Mouse and keyboard only — on touch
 * the tap should just follow the link.
 */
export function ReferencePreview({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const schedule = useCallback((next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (next) {
        const rect = anchorRef.current?.getBoundingClientRect();
        if (rect) setAlignEnd(rect.left + CARD_WIDTH > window.innerWidth - 16);
      }
      setOpen(next);
    }, delay);
  }, []);

  return (
    <span
      ref={anchorRef}
      className="relative inline-block"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') schedule(true, OPEN_DELAY_MS);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') schedule(false, CLOSE_DELAY_MS);
      }}
      onFocusCapture={() => schedule(true, 0)}
      onBlurCapture={() => schedule(false, 0)}
    >
      {children}
      <span
        role="tooltip"
        hidden={!open}
        className={cn(
          'bg-fd-popover text-fd-popover-foreground absolute top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border p-3 text-sm leading-relaxed font-normal shadow-lg',
          alignEnd ? 'right-0' : 'left-0',
        )}
      >
        <span className="mb-1 block font-medium">{title}</span>
        <span className="text-fd-muted-foreground block">{description}</span>
      </span>
    </span>
  );
}
