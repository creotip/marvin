'use client';

import { useEffect, useId, useState } from 'react';

// Mermaid's theme engine parses several of these values with its own color
// library (to derive lighter/darker shades), so a raw `var(--color-fd-*)`
// reference throws ("Unsupported color format") — it needs an actual
// resolved color, not a CSS variable. `resolveColor` asks the browser to
// resolve it instead, so diagrams still track the site's real palette in
// light mode, dark mode, and any future theme swap — just resolved once per
// render instead of left as a live var().
//
// The theme's tokens are defined in oklch(), and `getComputedStyle` can
// serialize a resolved oklch() color back out as `lab(...)` (observed on
// Chrome/Turbopack) — a format Mermaid's own color library can't parse.
// Painting onto a 1x1 canvas and reading the pixel back sidesteps that: the
// canvas 2D context accepts any valid CSS color as `fillStyle` and always
// returns plain 8-bit sRGB from `getImageData`, which Mermaid can parse.
function resolveColor(cssVar: string): string {
  const probe = document.createElement('div');
  probe.style.color = `var(${cssVar})`;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return computed;

  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a === 255
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

function useThemeVariables() {
  const [vars, setVars] = useState<Record<string, string>>();

  useEffect(() => {
    const compute = () => {
      const c = resolveColor;
      setVars({
        background: c('--color-fd-card'),

        primaryColor: c('--color-fd-secondary'),
        primaryTextColor: c('--color-fd-foreground'),
        primaryBorderColor: c('--color-fd-primary'),

        secondaryColor: c('--color-fd-muted'),
        secondaryTextColor: c('--color-fd-foreground'),
        secondaryBorderColor: c('--color-fd-border'),

        tertiaryColor: c('--color-fd-accent'),
        tertiaryTextColor: c('--color-fd-accent-foreground'),
        tertiaryBorderColor: c('--color-fd-border'),

        lineColor: c('--color-fd-muted-foreground'),
        textColor: c('--color-fd-foreground'),
        // Both of Mermaid's own themes default to an edge-label background
        // that leaves the label text just under the 4.5:1 contrast minimum.
        edgeLabelBackground: c('--color-fd-card'),

        mainBkg: c('--color-fd-secondary'),
        nodeBorder: c('--color-fd-primary'),
        clusterBkg: c('--color-fd-muted'),
        clusterBorder: c('--color-fd-border'),

        actorBkg: c('--color-fd-secondary'),
        actorBorder: c('--color-fd-primary'),
        actorTextColor: c('--color-fd-foreground'),
        signalColor: c('--color-fd-foreground'),
        signalTextColor: c('--color-fd-foreground'),

        labelBoxBkgColor: c('--color-fd-secondary'),
        labelBoxBorderColor: c('--color-fd-border'),
        labelTextColor: c('--color-fd-foreground'),
        loopTextColor: c('--color-fd-foreground'),
        noteBkgColor: c('--color-fd-accent'),
        noteTextColor: c('--color-fd-accent-foreground'),
        noteBorderColor: c('--color-fd-border'),
      });
    };

    compute();
    // Re-resolve when the site's light/dark class flips.
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return vars;
}

export function Mermaid({ chart }: { chart: string }) {
  const id = useId();
  const themeVariables = useThemeVariables();
  const [svg, setSvg] = useState<string>();

  useEffect(() => {
    if (!themeVariables) return;
    let active = true;

    void (async () => {
      const { default: mermaid } = await import('mermaid');

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'inherit',
        theme: 'base',
        themeVariables,
      });

      // `useId` produces colons, which are invalid in the selectors Mermaid generates.
      const rendered = await mermaid.render(
        `mermaid${id.replace(/[^a-zA-Z0-9]/g, '')}`,
        chart,
      );
      if (active) setSvg(rendered.svg);
    })();

    return () => {
      active = false;
    };
  }, [chart, id, themeVariables]);

  if (!svg) {
    return <div className="bg-fd-muted my-6 h-40 animate-pulse rounded-lg" />;
  }

  return (
    <figure
      className="bg-fd-card my-6 flex justify-center overflow-x-auto rounded-lg border p-4"
      // Charts are trusted content authored in MDX, and Mermaid runs at securityLevel 'strict'.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
