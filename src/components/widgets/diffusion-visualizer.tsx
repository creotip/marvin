'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Forward direction is Live: x_t = sqrt(ᾱ_t)·x0 + sqrt(1-ᾱ_t)·ε is the exact
// closed-form equation from the lesson's own derivation, computed here for
// real on every slider move. The reverse direction is explicitly synthetic —
// there's no trained denoising network running in the browser, so "reverse"
// just replays the same known frames backward. A real diffusion model never
// gets to see x0; it has to predict the noise at each step from x_t alone.

const IMG_SIZE = 10;
const CELL = 22;
const T = 24; // total diffusion steps in this toy schedule

// Same hollow-square test image the convolution visualizer uses.
const IMAGE: number[][] = Array.from({ length: IMG_SIZE }, (_, r) =>
  Array.from({ length: IMG_SIZE }, (_, c) => {
    const inRing =
      r >= 2 &&
      r <= 7 &&
      c >= 2 &&
      c <= 7 &&
      (r === 2 || r === 7 || c === 2 || c === 7);
    return inRing ? 1 : 0;
  }),
);

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

function gaussian(random: () => number) {
  const u1 = Math.max(random(), 1e-9);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// One fixed noise draw, reused at every t — exactly what the closed-form
// equation does: a single ε sample determines the whole trajectory from
// x0 to x_T, not an independent random image at each step.
const NOISE: number[][] = (() => {
  const random = mulberry32(9);
  return Array.from({ length: IMG_SIZE }, () =>
    Array.from({ length: IMG_SIZE }, () => gaussian(random)),
  );
})();

// Cosine schedule (Nichol & Dhariwal) — ᾱ_0 ≈ 1, ᾱ_T ≈ 0, smoother than a
// linear β schedule at both ends.
function alphaBar(t: number) {
  const s = 0.008;
  const f = (x: number) =>
    Math.cos(((x / T + s) / (1 + s)) * (Math.PI / 2)) ** 2;
  return f(t) / f(0);
}

function grayscale(v: number) {
  const g = Math.round(Math.min(1, Math.max(0, v)) * 255);
  return `rgb(${g},${g},${g})`;
}

function frameAt(t: number): number[][] {
  const ab = alphaBar(t);
  const signal = Math.sqrt(ab);
  const noise = Math.sqrt(1 - ab);
  return IMAGE.map((row, r) =>
    row.map((v, c) => signal * v + noise * NOISE[r][c]),
  );
}

const ANIMATE_DELAY_MS = 150;

export function DiffusionVisualizer() {
  const [t, setT] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'reverse' | null>(
    null,
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const stopAnimating = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setDirection(null);
  }, []);

  const animate = (dir: 'forward' | 'reverse') => {
    setDirection(dir);
    const step = dir === 'forward' ? 1 : -1;
    const tick = (current: number) => {
      const next = current + step;
      if (next < 0 || next > T) {
        stopAnimating();
        return;
      }
      setT(next);
      timeoutRef.current = setTimeout(() => tick(next), ANIMATE_DELAY_MS);
    };
    timeoutRef.current = setTimeout(() => tick(t), ANIMATE_DELAY_MS);
  };

  const reset = () => {
    stopAnimating();
    setT(0);
  };

  const frame = useMemo(() => frameAt(t), [t]);
  const ab = alphaBar(t);

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className="grid shrink-0 overflow-hidden rounded-md border"
          style={{ gridTemplateColumns: `repeat(${IMG_SIZE}, ${CELL}px)` }}
          role="img"
          aria-label={`Noised image at step ${t} of ${T}. ${
            t === 0
              ? 'The clean image.'
              : t === T
                ? 'Indistinguishable from pure noise.'
                : `${Math.round(ab * 100)}% signal remaining.`
          }`}
        >
          {frame.flatMap((row, r) =>
            row.map((v, c) => (
              <div
                key={`${r}-${c}`}
                style={{ width: CELL, height: CELL, background: grayscale(v) }}
              />
            )),
          )}
        </div>

        <div className="flex w-full flex-1 flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="flex justify-between">
              <span>Noise level — step t</span>
              <span className="font-mono">
                t={t}/{T}, ᾱ_t={ab.toFixed(2)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={T}
              step={1}
              value={t}
              onChange={(e) => {
                stopAnimating();
                setT(Number(e.target.value));
              }}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                direction === 'forward' ? stopAnimating() : animate('forward')
              }
              disabled={t >= T && direction === null}
              className="bg-fd-primary text-fd-primary-foreground rounded-md px-3 py-1.5 font-medium disabled:opacity-50"
            >
              {direction === 'forward' ? 'Pause' : 'Animate forward →'}
            </button>
            <button
              type="button"
              onClick={() =>
                direction === 'reverse' ? stopAnimating() : animate('reverse')
              }
              disabled={t <= 0 && direction === null}
              className="rounded-md border px-3 py-1.5 font-medium disabled:opacity-50"
            >
              {direction === 'reverse'
                ? 'Pause'
                : '← Animate reverse (simulated)'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border px-3 py-1.5 font-medium"
            >
              Reset
            </button>
          </div>

          <p className="text-fd-muted-foreground text-xs">
            <strong className="text-fd-foreground">Forward</strong> is the real
            closed-form equation from the lesson —{' '}
            <code>x_t = √ᾱ_t · x0 + √(1-ᾱ_t) · ε</code> — computed fresh at
            every position of the slider.{' '}
            <strong className="text-fd-foreground">Reverse</strong> is
            simulated: there&apos;s no trained network here to actually predict
            and remove noise, so it just replays the same known frames backward.
            A real diffusion model never gets to see the clean image — it has to
            guess the noise at each step from x_t alone.
          </p>
        </div>
      </div>
    </div>
  );
}
