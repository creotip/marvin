'use client';

import { useMemo, useState } from 'react';

// Precomputed, hand-crafted attention weights — not a live model (see
// Inference & Serving / the lesson's own note on why: shipping a real
// transformer client-side is unnecessary complexity for what this widget
// needs to teach). Every row sums to ~1, like a real softmax output.
// Most rows use a plausible "mostly local" baseline; the pedagogically
// interesting row for each sentence is hand-specified to show a real
// long-range dependency, matching the kind of thing attention heads
// actually learn to track (coreference, subject-verb agreement).

function gaussianRow(n: number, center: number, sigma = 1.3) {
  const raw = Array.from({ length: n }, (_, j) =>
    Math.exp(-((j - center) ** 2) / (2 * sigma * sigma)),
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / sum);
}

interface Example {
  text: string;
  tokens: string[];
  special: Record<number, number[]>;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    text: "The trophy didn't fit in the suitcase because it was too big.",
    tokens: [
      'The',
      'trophy',
      "didn't",
      'fit',
      'in',
      'the',
      'suitcase',
      'because',
      'it',
      'was',
      'too',
      'big',
    ],
    special: {
      8: [
        0.02, 0.52, 0.02, 0.02, 0.01, 0.01, 0.08, 0.02, 0.14, 0.12, 0.01, 0.03,
      ],
    },
    note: 'Click "it" — coreference resolution, exactly the lesson\'s own example.',
  },
  {
    text: 'The dog chased the cat because it was scared.',
    tokens: [
      'The',
      'dog',
      'chased',
      'the',
      'cat',
      'because',
      'it',
      'was',
      'scared',
    ],
    special: {
      6: [0.02, 0.1, 0.02, 0.02, 0.55, 0.02, 0.15, 0.09, 0.03],
    },
    note: 'Click "it" — a different sentence, a different antecedent.',
  },
  {
    text: 'The keys to the cabinet are on the table.',
    tokens: [
      'The',
      'keys',
      'to',
      'the',
      'cabinet',
      'are',
      'on',
      'the',
      'table',
    ],
    special: {
      5: [0.02, 0.5, 0.02, 0.02, 0.1, 0.15, 0.09, 0.02, 0.08],
    },
    note: 'Click "are" — subject-verb agreement, skipping right past "cabinet".',
  },
];

function getRow(example: Example, i: number): number[] {
  return example.special[i] ?? gaussianRow(example.tokens.length, i);
}

function weightColor(w: number) {
  // 0 -> transparent, 1 -> full primary-colored highlight
  const alpha = Math.min(1, w * 1.8);
  return `color-mix(in oklab, var(--color-fd-primary) ${(alpha * 100).toFixed(0)}%, transparent)`;
}

export function AttentionVisualizer() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);

  const example = EXAMPLES[exampleIndex];
  const weights = useMemo(
    () => (focus !== null ? getRow(example, focus) : null),
    [example, focus],
  );

  const changeExample = (i: number) => {
    setExampleIndex(i);
    setFocus(null);
  };

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.text}
            type="button"
            onClick={() => changeExample(i)}
            aria-pressed={i === exampleIndex}
            className={`focus-visible:ring-fd-ring rounded-md border px-2.5 py-1 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none ${
              i === exampleIndex
                ? 'border-fd-primary bg-fd-primary/15 text-fd-primary'
                : ''
            }`}
          >
            Example {i + 1}
          </button>
        ))}
      </div>

      <p className="text-fd-muted-foreground mb-3 text-xs">{example.note}</p>

      <div className="flex flex-wrap gap-1.5">
        {example.tokens.map((tok, i) => {
          const w = weights ? weights[i] : 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setFocus(i)}
              aria-pressed={focus === i}
              aria-label={`Attend from "${tok}"`}
              style={{
                backgroundColor: focus !== null ? weightColor(w) : undefined,
              }}
              className={`focus-visible:ring-fd-ring rounded-md border px-2 py-1.5 font-mono text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                focus === i ? 'border-fd-primary' : 'border-fd-border'
              }`}
            >
              {tok}
            </button>
          );
        })}
      </div>

      {focus !== null && weights ? (
        <div className="mt-4">
          <p className="text-fd-muted-foreground mb-2 text-xs">
            Attention weights from{' '}
            <span className="text-fd-primary font-mono">
              &quot;{example.tokens[focus]}&quot;
            </span>{' '}
            to every token (this is one row of the softmax(Q·Kᵀ) matrix):
          </p>
          <div className="flex flex-col gap-1">
            {example.tokens.map((tok, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-fd-muted-foreground w-20 shrink-0 truncate font-mono">
                  {tok}
                </span>
                <div className="bg-fd-secondary h-3 flex-1 overflow-hidden rounded">
                  <div
                    className="bg-fd-primary h-full"
                    style={{ width: `${Math.min(100, weights[i] * 100)}%` }}
                  />
                </div>
                <span className="text-fd-muted-foreground w-10 shrink-0 text-right font-mono">
                  {weights[i].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-fd-muted-foreground mt-4 text-sm">
          Click any token above to see what it attends to.
        </p>
      )}
    </div>
  );
}
