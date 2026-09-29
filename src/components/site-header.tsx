'use client';

import { useState, type ReactNode } from 'react';
import Link from 'fumadocs-core/link';
import { Sidebar as SidebarIcon, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'fumadocs-ui/components/ui/collapsible';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import {
  FullSearchTrigger,
  SearchTrigger,
} from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import {
  SidebarTrigger,
  SidebarCollapseTrigger,
} from 'fumadocs-ui/layouts/notebook/slots/sidebar';
import { cn } from '@/lib/cn';
import { TopNavTabs } from '@/components/top-nav-tabs';
import { Wordmark } from '@/components/wordmark';
import { gitConfig } from '@/lib/shared';

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

function GithubIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/**
 * One header, shared by every page (home + all 4 collections) via fumadocs'
 * `slots.header` override — see `layout.shared.tsx`. Replaces both of
 * fumadocs' own header implementations (`home` and `notebook`), which
 * independently hardcoded different search-bar shapes/sizes/positions and
 * caused the homepage nav to look inconsistent with every other page.
 *
 * `sidebarDrawerTrigger`/`sidebarCollapseTrigger` are only passed by
 * `DocsSiteHeader` (pages with a real sidebar) — the homepage has neither.
 */
function HeaderChrome({
  sidebarDrawerTrigger,
  sidebarCollapseTrigger,
}: {
  sidebarDrawerTrigger?: ReactNode;
  sidebarCollapseTrigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      render={
        <header
          id="site-header"
          className="bg-fd-background/80 sticky top-(--fd-docs-row-1) z-40 border-b backdrop-blur-lg [--fd-header-height:--spacing(14)] [grid-area:header]"
        />
      }
    >
      <div className="mx-auto flex h-14 w-full max-w-[var(--fd-layout-width,1400px)] items-center gap-3 px-4 md:px-6">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2.5 font-semibold"
        >
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          <TopNavTabs />
          <Link
            href="/faq"
            className="text-fd-muted-foreground hover:text-fd-accent-foreground text-sm transition-colors"
          >
            FAQ
          </Link>
        </div>

        <FullSearchTrigger
          hideIfDisabled
          className="my-auto hidden w-full max-w-sm rounded-xl ps-2.5 lg:inline-flex"
        />

        <div className="ms-auto flex items-center gap-1">
          <SearchTrigger hideIfDisabled className="p-2 lg:hidden" />
          <div className="hidden items-center gap-1.5 lg:flex">
            <ThemeSwitch />
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className={cn(
                buttonVariants({ size: 'icon-sm', variant: 'ghost' }),
                'text-fd-muted-foreground',
              )}
            >
              <GithubIcon className="size-4" />
            </a>
            {sidebarCollapseTrigger}
          </div>
          {sidebarDrawerTrigger}
          <CollapsibleTrigger
            aria-label="Toggle Menu"
            className={cn(
              buttonVariants({ size: 'icon-sm', variant: 'ghost' }),
              'lg:hidden',
            )}
          >
            <ChevronDown
              className={cn('transition-transform', open && 'rotate-180')}
            />
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="lg:hidden">
        <div className="mx-auto flex max-w-[var(--fd-layout-width,1400px)] flex-col gap-4 border-t px-4 py-4">
          <TopNavTabs />
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            className="text-fd-muted-foreground hover:text-fd-accent-foreground text-sm transition-colors"
          >
            FAQ
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className={cn(
                buttonVariants({ size: 'icon-sm', variant: 'ghost' }),
                'text-fd-muted-foreground',
              )}
            >
              <GithubIcon className="size-4" />
            </a>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SiteHeader() {
  return <HeaderChrome />;
}

export function DocsSiteHeader() {
  return (
    <HeaderChrome
      sidebarDrawerTrigger={
        <SidebarTrigger
          className={cn(
            buttonVariants({ size: 'icon-sm', variant: 'ghost' }),
            'md:hidden',
          )}
          aria-label="Toggle Sidebar"
        >
          <SidebarIcon />
        </SidebarTrigger>
      }
      sidebarCollapseTrigger={
        <SidebarCollapseTrigger
          className={cn(
            buttonVariants({ size: 'icon-sm', variant: 'secondary' }),
            'text-fd-muted-foreground rounded-full max-md:hidden',
          )}
        >
          <SidebarIcon />
        </SidebarCollapseTrigger>
      }
    />
  );
}
