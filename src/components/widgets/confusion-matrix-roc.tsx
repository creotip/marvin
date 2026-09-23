'use client';

import { useMemo, useState } from 'react';

// Live — every number here (the confusion matrix, precision/recall/F1, the
// ROC curve, AUC) is computed in the browser from a fixed synthetic set of
// 300 scored examples. The examples themselves are synthetic, drawn once
// from a seeded generator for a reproducible demo — not a real dataset —
// but nothing about the arithmetic on them is precomputed or faked.

const SIZE = 200;
const N_PER_CLASS = 150;
const THRESHOLD_STEPS = 100;

function mulberry32(seed: number) {
  let s = seed;
  return function random() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number, mean: number, std: number) {
  const u1 = Math.max(random(), 1e-9);
  const u2 = random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

interface Example {
  label: 0 | 1;
  score: number;
}

function buildExamples(): Example[] {
  const random = mulberry32(20240521); // fixed seed — same demo every load
  const examples: Example[] = [];
  for (let i = 0; i < N_PER_CLASS; i++) {
    examples.push({ label: 1, score: clamp01(gaussian(random, 0.63, 0.16)) });
  }
  for (let i = 0; i < N_PER_CLASS; i++) {
    examples.push({ label: 0, score: clamp01(gaussian(random, 0.37, 0.16)) });
  }
  return examples;
}

const EXAMPLES = buildExamples();
const TOTAL_POSITIVE = EXAMPLES.filter((e) => e.label === 1).length;
const TOTAL_NEGATIVE = EXAMPLES.length - TOTAL_POSITIVE;

function confusionAt(threshold: number) {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (const e of EXAMPLES) {
    const predicted = e.score >= threshold ? 1 : 0;
    if (e.label === 1 && predicted === 1) tp++;
    else if (e.label === 0 && predicted === 1) fp++;
    else if (e.label === 0 && predicted === 0) tn++;
    else fn++;
  }
  return { tp, fp, tn, fn };
}

const ROC_POINTS = Array.from({ length: THRESHOLD_STEPS + 1 }, (_, i) => {
  const t = i / THRESHOLD_STEPS;
  const { tp, fp } = confusionAt(t);
  return { t, fpr: fp / TOTAL_NEGATIVE, tpr: tp / TOTAL_POSITIVE };
});

const AUC = ROC_POINTS.slice(1).reduce((area, p, i) => {
  const prev = ROC_POINTS[i];
  return area + (prev.fpr - p.fpr) * ((prev.tpr + p.tpr) / 2);
}, 0);

const toScreen = (fpr: number, tpr: number) => ({
  x: fpr * SIZE,
  y: SIZE - tpr * SIZE,
});

const rocPath = ROC_POINTS.map((p, i) => {
  const { x, y } = toScreen(p.fpr, p.tpr);
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join('');

function formatPercent(x: number) {
  return Number.isFinite(x) ? `${(x * 100).toFixed(1)}%` : '—';
}

export function ConfusionMatrixRoc() {
  const [threshold, setThreshold] = useState(0.5);

  const { tp, fp, tn, fn } = useMemo(() => confusionAt(threshold), [threshold]);
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const f1 = (2 * precision * recall) / (precision + recall);

  const nearestPoint = ROC_POINTS[Math.round(threshold * THRESHOLD_STEPS)];
  const marker = toScreen(nearestPoint.fpr, nearestPoint.tpr);

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="flex justify-between">
          <span>Decision threshold — predict positive when score ≥</span>
          <span className="font-mono">{threshold.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
      </label>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row">
        <div className="flex-1">
          <p className="text-fd-muted-foreground mb-2 text-xs">
            Confusion matrix, {EXAMPLES.length} scored examples
          </p>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center text-xs">
            <div />
            <div className="text-fd-muted-foreground pb-1">Predicted +</div>
            <div className="text-fd-muted-foreground pb-1">Predicted −</div>

            <div className="text-fd-muted-foreground flex items-center pr-1">
              Actual +
            </div>
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/15 py-3 font-mono text-base font-medium">
              {tp}
            </div>
            <div className="rounded-md border border-red-500/40 bg-red-500/15 py-3 font-mono text-base font-medium">
              {fn}
            </div>

            <div className="text-fd-muted-foreground flex items-center pr-1">
              Actual −
            </div>
            <div className="rounded-md border border-red-500/40 bg-red-500/15 py-3 font-mono text-base font-medium">
              {fp}
            </div>
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/15 py-3 font-mono text-base font-medium">
              {tn}
            </div>
          </div>

          <div className="text-fd-muted-foreground mt-4 grid grid-cols-3 gap-2 font-mono text-xs">
            <span>
              precision
              <br />
              <span className="text-fd-foreground text-sm">
                {formatPercent(precision)}
              </span>
            </span>
            <span>
              recall
              <br />
              <span className="text-fd-foreground text-sm">
                {formatPercent(recall)}
              </span>
            </span>
            <span>
              F1
              <br />
              <span className="text-fd-foreground text-sm">
                {formatPercent(f1)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            role="img"
            aria-label={`ROC curve. Current threshold ${threshold.toFixed(2)} gives a true positive rate of ${formatPercent(nearestPoint.tpr)} and a false positive rate of ${formatPercent(nearestPoint.fpr)}.`}
            className="bg-fd-background shrink-0 rounded-lg border"
          >
            <line
              x1={0}
              y1={SIZE}
              x2={SIZE}
              y2={0}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeDasharray="4 4"
              className="text-fd-foreground"
            />
            <path
              d={rocPath}
              fill="none"
              stroke="var(--color-fd-primary)"
              strokeWidth={2}
            />
            <line
              x1={marker.x}
              y1={marker.y}
              x2={marker.x}
              y2={SIZE}
              stroke="var(--color-fd-primary)"
              strokeOpacity={0.3}
            />
            <line
              x1={0}
              y1={marker.y}
              x2={marker.x}
              y2={marker.y}
              stroke="var(--color-fd-primary)"
              strokeOpacity={0.3}
            />
            <circle
              cx={marker.x}
              cy={marker.y}
              r={4}
              fill="var(--color-fd-primary)"
            />
          </svg>
          <div className="text-fd-muted-foreground mt-2 flex justify-between gap-4 font-mono text-xs">
            <span>FPR {formatPercent(nearestPoint.fpr)}</span>
            <span>TPR {formatPercent(nearestPoint.tpr)}</span>
            <span>AUC {AUC.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p className="text-fd-muted-foreground mt-4 text-xs">
        Drag the threshold down and both true and false positives rise together
        — the dot slides up the curve. The curve itself doesn&apos;t move; only
        the threshold changes where on it you&apos;re standing.
      </p>
    </div>
  );
}
