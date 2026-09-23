'use client';

import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/docs', label: 'Docs' },
  { href: '/reference', label: 'Reference' },
  { href: '/people', label: 'People' },
] as const;

export function TopNavTabs() {
  const pathname = usePathname();

  return (
    <div className="bg-fd-secondary/50 flex items-center gap-0.5 rounded-full border p-1">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              active
                ? 'bg-fd-background text-fd-foreground shadow-sm'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
