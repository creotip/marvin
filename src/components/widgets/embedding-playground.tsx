'use client';

import { useMemo, useState } from 'react';

// Precomputed — same honesty pattern as the attention visualizer. These
// coordinates are hand-placed, not the output of a real embedding model
// (which would live in hundreds or thousands of dimensions, not two). But
// the similarity ranking you get when you click a point is a real cosine
// similarity computed live over those 2D coordinates, not a canned answer —
// each cluster sits in its own angular wedge from the plot's center
// specifically so that "angle from center" (what cosine similarity actually
// measures) lines up with the semantic grouping.

const SIZE = 320;
const CENTER = SIZE / 2;

interface Point {
  label: string;
  category: string;
  angleDeg: number;
  radius: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Animals: 'var(--color-sky-500)',
  Code: 'var(--color-amber-500)',
  Fruit: 'var(--color-emerald-500)',
  Emotion: 'var(--color-rose-500)',
};

// Evenly spaced 40°-wide clusters with 50° gaps between them, so the
// narrowest same-cluster angle (~36°, cos ≈ 0.81) always beats the widest
// cross-cluster angle (~50°, cos ≈ 0.64) — every query's top matches stay
// inside its own category, not just on average.
const POINTS: Point[] = [
  { label: 'elephant', category: 'Animals', angleDeg: 2, radius: 120 },
  { label: 'cat', category: 'Animals', angleDeg: 10, radius: 95 },
  { label: 'dog', category: 'Animals', angleDeg: 25, radius: 110 },
  { label: 'lion', category: 'Animals', angleDeg: 38, radius: 85 },

  { label: 'python', category: 'Code', angleDeg: 100, radius: 100 },
  { label: 'javascript', category: 'Code', angleDeg: 115, radius: 115 },
  { label: 'rust', category: 'Code', angleDeg: 128, radius: 90 },

  { label: 'apple', category: 'Fruit', angleDeg: 190, radius: 105 },
  { label: 'banana', category: 'Fruit', angleDeg: 205, radius: 90 },
  { label: 'mango', category: 'Fruit', angleDeg: 218, radius: 115 },

  { label: 'happy', category: 'Emotion', angleDeg: 280, radius: 95 },
  { label: 'sad', category: 'Emotion', angleDeg: 295, radius: 110 },
  { label: 'angry', category: 'Emotion', angleDeg: 308, radius: 85 },
];

function toVector(p: Point) {
  const rad = (p.angleDeg * Math.PI) / 180;
  return { x: p.radius * Math.cos(rad), y: p.radius * Math.sin(rad) };
}

function toScreen(v: { x: number; y: number }) {
  return { x: CENTER + v.x, y: CENTER - v.y };
}

function cosineSimilarity(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const dot = a.x * b.x + a.y * b.y;
  const normA = Math.hypot(a.x, a.y);
  const normB = Math.hypot(b.x, b.y);
  return dot / (normA * normB);
}

const VECTORS = POINTS.map(toVector);
// 2, not 3: each category has only 3 members, so a 3rd highlighted "neighbor"
// would always be a cross-category item filling the last slot, muddying the
// same-category-clusters-together point this widget exists to make.
const TOP_K = 2;

export function EmbeddingPlayground() {
  const [queryIndex, setQueryIndex] = useState<number | null>(null);

  const ranked = useMemo(() => {
    if (queryIndex === null) return null;
    return POINTS.map((p, i) => ({
      index: i,
      point: p,
      similarity: cosineSimilarity(VECTORS[queryIndex], VECTORS[i]),
    }))
      .filter((r) => r.index !== queryIndex)
      .sort((a, b) => b.similarity - a.similarity);
  }, [queryIndex]);

  const neighborIndexes = new Set(
    ranked?.slice(0, TOP_K).map((r) => r.index) ?? [],
  );

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          className="bg-fd-background shrink-0 rounded-lg border"
          role="img"
          aria-label={
            queryIndex === null
              ? 'Scatter plot of 13 example words. Click one to see its nearest neighbors by cosine similarity.'
              : `Nearest neighbors of "${POINTS[queryIndex].label}" highlighted.`
          }
        >
          {queryIndex !== null &&
            ranked?.slice(0, TOP_K).map((r) => {
              const from = toScreen(VECTORS[queryIndex]);
              const to = toScreen(VECTORS[r.index]);
              return (
                <line
                  key={r.index}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--color-fd-primary)"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                />
              );
            })}

          {POINTS.map((p, i) => {
            const { x, y } = toScreen(VECTORS[i]);
            const isQuery = i === queryIndex;
            const isNeighbor = neighborIndexes.has(i);
            const dim = queryIndex !== null && !isQuery && !isNeighbor;
            return (
              <g
                key={p.label}
                onClick={() => setQueryIndex(i)}
                className="cursor-pointer"
                opacity={dim ? 0.35 : 1}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isQuery ? 8 : 6}
                  fill={CATEGORY_COLORS[p.category]}
                  stroke={isQuery ? 'var(--color-fd-foreground)' : 'none'}
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={y - 11}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-fd-foreground select-none"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex-1 text-sm">
          <div className="mb-3 flex flex-wrap gap-3 text-xs">
            {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
              <span key={name} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: color }}
                />
                {name}
              </span>
            ))}
          </div>

          {queryIndex === null ? (
            <p className="text-fd-muted-foreground">
              Click any word to make it the query and rank every other word by
              cosine similarity to it.
            </p>
          ) : (
            <>
              <p className="text-fd-muted-foreground mb-2 text-xs">
                Nearest neighbors of{' '}
                <span className="text-fd-primary font-mono">
                  &quot;{POINTS[queryIndex].label}&quot;
                </span>
                :
              </p>
              <div className="flex flex-col gap-1">
                {ranked?.map((r) => (
                  <div
                    key={r.index}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={`w-20 shrink-0 truncate font-mono ${
                        neighborIndexes.has(r.index)
                          ? 'text-fd-foreground'
                          : 'text-fd-muted-foreground'
                      }`}
                    >
                      {r.point.label}
                    </span>
                    <div className="bg-fd-secondary h-3 flex-1 overflow-hidden rounded">
                      <div
                        className="bg-fd-primary h-full"
                        style={{
                          width: `${Math.max(0, r.similarity) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-fd-muted-foreground w-10 shrink-0 text-right font-mono">
                      {r.similarity.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
