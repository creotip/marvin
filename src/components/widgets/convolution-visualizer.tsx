'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const IMG_SIZE = 10;
const KERNEL_SIZE = 3;
const OUT_SIZE = IMG_SIZE - KERNEL_SIZE + 1; // 8, valid convolution, stride 1
const CELL = 22;

// A hollow square — has both vertical edges (left/right sides) and
// horizontal edges (top/bottom sides), so every preset kernel below
// produces a visibly different, meaningful feature map.
const IMAGE: number[][] = Array.from({ length: IMG_SIZE }, (_, r) =>
  Array.from({ length: IMG_SIZE }, (_, c) => {
    const inRing = r >= 2 && r <= 7 && c >= 2 && c <= 7 && (r === 2 || r === 7 || c === 2 || c === 7);
    return inRing ? 1 : 0;
  }),
);

const KERNELS = {
  'Vertical edge': [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ],
  'Horizontal edge': [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ],
  Blur: [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
  ],
  Sharpen: [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ],
} as const;

type KernelName = keyof typeof KERNELS;

function convolveAt(row: number, col: number, kernel: readonly (readonly number[])[]) {
  let sum = 0;
  for (let kr = 0; kr < KERNEL_SIZE; kr++) {
    for (let kc = 0; kc < KERNEL_SIZE; kc++) {
      sum += IMAGE[row + kr][col + kc] * kernel[kr][kc];
    }
  }
  return sum;
}

function grayscale(v: number) {
  const g = Math.round(v * 255);
  return `rgb(${g},${g},${g})`;
}

function diverging(v: number, maxAbs: number) {
  if (maxAbs === 0) return 'rgb(60,60,70)';
  const t = Math.max(-1, Math.min(1, v / maxAbs));
  if (t >= 0) {
    const g = Math.round(255 * t);
    return `rgb(${g},${Math.round(g * 0.3)},${Math.round(60 * (1 - t))})`;
  }
  const g = Math.round(255 * -t);
  return `rgb(${Math.round(60 * (1 + t))},${Math.round(g * 0.4)},${g})`;
}

export function ConvolutionVisualizer() {
  const [kernelName, setKernelName] = useState<KernelName>('Vertical edge');
  const [position, setPosition] = useState(-1); // -1 = not started, 0..OUT_SIZE*OUT_SIZE-1
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const kernel = KERNELS[kernelName];
  const total = OUT_SIZE * OUT_SIZE;

  const output = useMemo(() => {
    const grid: (number | null)[][] = Array.from({ length: OUT_SIZE }, () => Array(OUT_SIZE).fill(null));
    for (let p = 0; p <= position; p++) {
      const r = Math.floor(p / OUT_SIZE);
      const c = p % OUT_SIZE;
      grid[r][c] = convolveAt(r, c, kernel);
    }
    return grid;
  }, [position, kernel]);

  const maxAbs = useMemo(() => {
    let m = 0;
    for (const row of output) for (const v of row) if (v !== null) m = Math.max(m, Math.abs(v));
    return m || 1;
  }, [output]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const step = useCallback(() => {
    setPosition((p) => {
      if (p + 1 >= total) {
        stop();
        return p;
      }
      return p + 1;
    });
  }, [stop, total]);

  const play = useCallback(() => {
    if (position + 1 >= total) return;
    setRunning(true);
    intervalRef.current = setInterval(step, 90);
  }, [step, position, total]);

  useEffect(() => stop, [stop]);

  const reset = useCallback(() => {
    stop();
    setPosition(-1);
  }, [stop]);

  const changeKernel = (name: KernelName) => {
    stop();
    setKernelName(name);
    setPosition(-1);
  };

  const curRow = position >= 0 ? Math.floor(position / OUT_SIZE) : -1;
  const curCol = position >= 0 ? position % OUT_SIZE : -1;
  const curValue = position >= 0 ? convolveAt(curRow, curCol, kernel) : null;

  return (
    <div className="not-prose my-6 rounded-xl border bg-fd-card p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(KERNELS) as KernelName[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => changeKernel(name)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
              name === kernelName ? 'border-fd-primary bg-fd-primary/15 text-fd-primary' : ''
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        <div>
          <p className="mb-1 text-xs text-fd-muted-foreground">Input image (10×10)</p>
          <div className="relative inline-block">
            <div
              className="grid overflow-hidden rounded-md border"
              style={{ gridTemplateColumns: `repeat(${IMG_SIZE}, ${CELL}px)` }}
            >
              {IMAGE.flatMap((row, r) =>
                row.map((v, c) => (
                  <div key={`${r}-${c}`} style={{ width: CELL, height: CELL, background: grayscale(v) }} />
                )),
              )}
            </div>
            {curRow >= 0 && (
              <div
                className="pointer-events-none absolute border-2 border-fd-primary"
                style={{
                  width: CELL * KERNEL_SIZE,
                  height: CELL * KERNEL_SIZE,
                  left: curCol * CELL,
                  top: curRow * CELL,
                }}
              />
            )}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs text-fd-muted-foreground">Kernel (3×3)</p>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(3, ${CELL}px)` }}>
            {kernel.flatMap((row, r) =>
              row.map((v, c) => (
                <div
                  key={`${r}-${c}`}
                  style={{ width: CELL, height: CELL }}
                  className="flex items-center justify-center rounded bg-fd-secondary font-mono text-[10px]"
                >
                  {Number.isInteger(v) ? v : v.toFixed(2)}
                </div>
              )),
            )}
          </div>

          {curValue !== null && (
            <p className="mt-3 max-w-[140px] font-mono text-xs text-fd-muted-foreground">
              output[{curRow}][{curCol}] = <span className="text-fd-primary">{curValue.toFixed(2)}</span>
            </p>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs text-fd-muted-foreground">Feature map (8×8)</p>
          <div
            className="grid overflow-hidden rounded-md border"
            style={{ gridTemplateColumns: `repeat(${OUT_SIZE}, ${CELL}px)` }}
          >
            {output.flatMap((row, r) =>
              row.map((v, c) => (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    background: v === null ? 'rgb(40,40,48)' : diverging(v, maxAbs),
                  }}
                />
              )),
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={running ? stop : play}
          disabled={position + 1 >= total}
          className="rounded-md bg-fd-primary px-3 py-1.5 font-medium text-fd-primary-foreground disabled:opacity-50"
        >
          {running ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={step}
          disabled={running || position + 1 >= total}
          className="rounded-md border px-3 py-1.5 font-medium disabled:opacity-50"
        >
          Step
        </button>
        <button type="button" onClick={reset} className="rounded-md border px-3 py-1.5 font-medium">
          Reset
        </button>
        <span className="ml-auto font-mono text-xs text-fd-muted-foreground">
          {position + 1} / {total}
        </span>
      </div>
    </div>
  );
}
