'use client';

import dynamic from 'next/dynamic';

// The cl100k rank table is ~2 MB, so it must not sit in the shared chunk that
// every docs page loads.
const Impl = dynamic(
  () =>
    import('./tokenizer-playground-impl').then((m) => m.TokenizerPlayground),
  {
    ssr: false,
    loading: () => (
      <div
        className="not-prose bg-fd-card my-6 h-64 animate-pulse rounded-xl border"
        aria-label="Loading tokenizer"
      />
    ),
  },
);

export function TokenizerPlayground() {
  return <Impl />;
}
