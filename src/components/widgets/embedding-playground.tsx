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
//
// One pair is deliberately NOT a clean cluster: "to Paris" / "from Paris"
// sit almost on top of each other on purpose, to demonstrate a real
// limitation named in the reference glossary — dense embeddings barely move
// for negation or direction, so near-opposite meanings can still end up
// nearly identical in vector space. That's not a toy artifact of this demo;
// it's the actual behavior of real embedding models too.

const SIZE = 320;
const CENTER = SIZE / 2;

interface Point {
  label: string;
  category: string;
  angleDeg: number;
  radius: number;
  note?: string;
  // Only needed when a point's dot sits close enough to a neighbor's that
  // the default "centered above the dot" label would overlap it.
  labelOffset?: { dx: number; dy: number };
}

const DEFAULT_LABEL_OFFSET = { dx: 0, dy: -11 };

const CATEGORY_COLORS: Record<string, string> = {
  Animals: 'var(--color-sky-500)',
  Code: 'var(--color-amber-500)',
  Fruit: 'var(--color-emerald-500)',
  Emotion: 'var(--color-rose-500)',
  Direction: 'var(--color-fuchsia-500)',
};

const PARIS_NOTE =
  'Blind spot: nearly identical to its opposite, despite meaning the reverse. Dense embeddings encode topic far more strongly than negation or direction, so real embedding models show this exact pattern — "flight to Paris" and "flight from Paris" land almost on top of each other. Similarity is not relevance.';

// Five wedges (four real categories, one deliberate trap). Gaps between
// wedges (~57-58°, cos ≈ 0.53-0.56) are deliberately much wider than
// within-wedge spread (~6-8°, cos ≈ 0.99), so an unrelated cross-wedge item
// tops out around 0.5 — clearly negligible next to a genuine match, not a
// deceptively-not-that-low number like an earlier version of this had
// ("angry" scored 0.72 against "to Paris" purely from the wedges sitting
// too close together, with no semantic meaning behind it at all).
const POINTS: Point[] = [
  { label: 'elephant', category: 'Animals', angleDeg: 0, radius: 120 },
  { label: 'cat', category: 'Animals', angleDeg: 7, radius: 95 },
  { label: 'dog', category: 'Animals', angleDeg: 14, radius: 110 },
  { label: 'lion', category: 'Animals', angleDeg: 20, radius: 85 },

  { label: 'python', category: 'Code', angleDeg: 78, radius: 100 },
  { label: 'javascript', category: 'Code', angleDeg: 86, radius: 115 },
  { label: 'rust', category: 'Code', angleDeg: 94, radius: 90 },

  { label: 'apple', category: 'Fruit', angleDeg: 152, radius: 105 },
  { label: 'banana', category: 'Fruit', angleDeg: 160, radius: 90 },
  { label: 'mango', category: 'Fruit', angleDeg: 168, radius: 115 },

  { label: 'happy', category: 'Emotion', angleDeg: 226, radius: 95 },
  { label: 'sad', category: 'Emotion', angleDeg: 234, radius: 110 },
  { label: 'angry', category: 'Emotion', angleDeg: 242, radius: 85 },

  {
    label: 'to Paris',
    category: 'Direction',
    angleDeg: 300,
    radius: 100,
    note: PARIS_NOTE,
    // The dots sit only 4° apart on purpose — that's the whole point — so
    // the labels are pushed to opposite sides instead of both defaulting
    // to dead center above an already-crowded pair of dots.
    labelOffset: { dx: -28, dy: -8 },
  },
  {
    label: 'from Paris',
    category: 'Direction',
    angleDeg: 304,
    radius: 108,
    note: PARIS_NOTE,
    labelOffset: { dx: 32, dy: 16 },
  },
];

function toVector(p: Point) {
  const rad = (p.angleDeg * Math.PI) / 180;
  return { x: p.radius * Math.cos(rad), y: p.radius * Math.sin(rad) };
}

// Rounded, not raw — Math.cos/Math.sin can differ in the last decimal place
// between server and client, which otherwise causes a hydration mismatch on
// the SVG coordinates (the server-rendered and client-rendered numbers
// stringify differently even though they're the "same" float).
function toScreen(v: { x: number; y: number }) {
  return {
    x: Math.round((CENTER + v.x) * 100) / 100,
    y: Math.round((CENTER - v.y) * 100) / 100,
  };
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
// Highlight up to 2 neighbors, but only ones that clear a real similarity
// bar — not just whichever 2 happen to score highest. Same-wedge matches
// score ≥0.98 here; incidental cross-wedge matches top out around 0.56. The
// 0.8 threshold sits well clear of both, which is also what makes the
// "to Paris" / "from Paris" pair land correctly: querying either highlights
// only the other (≈0.998), not a second, unrelated point padded in to fill
// a quota.
const TOP_K = 2;
const SIMILARITY_THRESHOLD = 0.8;

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

  const topNeighbors = ranked
    ?.filter((r) => r.similarity >= SIMILARITY_THRESHOLD)
    .slice(0, TOP_K);
  const neighborIndexes = new Set(topNeighbors?.map((r) => r.index) ?? []);

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
              ? 'Scatter plot of 15 example words. Click one to see its nearest neighbors by cosine similarity.'
              : `Nearest neighbors of "${POINTS[queryIndex].label}" highlighted.`
          }
        >
          {queryIndex !== null &&
            topNeighbors?.map((r) => {
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
                  x={x + (p.labelOffset?.dx ?? DEFAULT_LABEL_OFFSET.dx)}
                  y={y + (p.labelOffset?.dy ?? DEFAULT_LABEL_OFFSET.dy)}
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
              cosine similarity to it — including &quot;to Paris&quot; and
              &quot;from Paris&quot;, which aren&apos;t as different as they
              sound.
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
                      className={`w-24 shrink-0 truncate font-mono ${
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

              {POINTS[queryIndex].note && (
                <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2.5 text-xs text-amber-700 dark:text-amber-400">
                  {POINTS[queryIndex].note}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
