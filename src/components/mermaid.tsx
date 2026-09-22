'use client';

import { useEffect, useId, useState } from 'react';

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function Mermaid({ chart }: { chart: string }) {
  const id = useId();
  const isDark = useIsDark();
  const [svg, setSvg] = useState<string>();

  useEffect(() => {
    let active = true;

    void (async () => {
      const { default: mermaid } = await import('mermaid');

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'inherit',
        theme: isDark ? 'dark' : 'default',
        themeVariables: {
          // Both themes default to an edge-label background that leaves the
          // label text just under the 4.5:1 contrast minimum.
          edgeLabelBackground: isDark ? '#27272a' : '#f4f4f5',
        },
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
  }, [chart, id, isDark]);

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
