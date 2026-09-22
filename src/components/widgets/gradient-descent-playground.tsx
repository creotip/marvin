'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Loss surface: f(x, y) = x^2 + 2y^2 — an elliptical bowl.
// Anisotropic curvature (steeper along y) makes it a good teaching example:
// a learning rate that's stable along x can overshoot/zig-zag along y.
function loss(x: number, y: number) {
  return x * x + 2 * y * y;
}

function gradient(x: number, y: number) {
  return { gx: 2 * x, gy: 4 * y };
}

const SIZE = 320;
const RANGE = 3; // data coordinates span [-RANGE, RANGE] on both axes
const MAX_STEPS = 200;
const NUDGE = 0.1; // arrow-key step for the starting point, in data coordinates
const CONVERGE_THRESHOLD = 0.001;

function toScreen(x: number, y: number) {
  return {
    sx: (x / RANGE) * (SIZE / 2) + SIZE / 2,
    sy: SIZE / 2 - (y / RANGE) * (SIZE / 2),
  };
}

function toData(sx: number, sy: number) {
  return {
    x: ((sx - SIZE / 2) / (SIZE / 2)) * RANGE,
    y: ((SIZE / 2 - sy) / (SIZE / 2)) * RANGE,
  };
}

const CONTOUR_LEVELS = [0.5, 1.5, 3, 5, 8, 12, 17];

function contourPath(level: number) {
  // x^2 + 2y^2 = level -> ellipse with semi-axes sqrt(level) and sqrt(level/2)
  const a = Math.sqrt(level);
  const b = Math.sqrt(level / 2);
  const points: string[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const { sx, sy } = toScreen(a * Math.cos(theta), b * Math.sin(theta));
    points.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
}

export function GradientDescentPlayground() {
  const [learningRate, setLearningRate] = useState(0.3);
  const [start, setStart] = useState({ x: 2.4, y: 1.6 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([
    { x: 2.4, y: 1.6 },
  ]);
  const [running, setRunning] = useState(false);
  const [diverged, setDiverged] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = path[path.length - 1];
  const currentLoss = loss(current.x, current.y);
  const converged = currentLoss < CONVERGE_THRESHOLD;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const step = useCallback(() => {
    setPath((prev) => {
      const last = prev[prev.length - 1];
      const { gx, gy } = gradient(last.x, last.y);
      const next = {
        x: last.x - learningRate * gx,
        y: last.y - learningRate * gy,
      };
      if (Math.abs(next.x) > RANGE * 3 || Math.abs(next.y) > RANGE * 3) {
        setDiverged(true);
        stop();
        return prev;
      }
      if (
        prev.length >= MAX_STEPS ||
        loss(next.x, next.y) < CONVERGE_THRESHOLD
      ) {
        stop();
        return [...prev, next];
      }
      return [...prev, next];
    });
  }, [learningRate, stop]);

  const play = useCallback(() => {
    if (converged || diverged) return;
    setRunning(true);
    intervalRef.current = setInterval(step, 120);
  }, [step, converged, diverged]);

  useEffect(() => stop, [stop]);

  const reset = useCallback(
    (point?: { x: number; y: number }) => {
      stop();
      setDiverged(false);
      const p = point ?? start;
      setStart(p);
      setPath([p]);
    },
    [start, stop],
  );

  const moveStart = useCallback(
    (x: number, y: number) => {
      reset({
        x: Math.max(-RANGE, Math.min(RANGE, x)),
        y: Math.max(-RANGE, Math.min(RANGE, y)),
      });
    },
    [reset],
  );

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * SIZE;
      const sy = ((e.clientY - rect.top) / rect.height) * SIZE;
      const { x, y } = toData(sx, sy);
      moveStart(x, y);
    },
    [moveStart],
  );

  const handleSvgKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGSVGElement>) => {
      const nudge = e.shiftKey ? NUDGE * 5 : NUDGE;
      const delta = {
        ArrowLeft: [-nudge, 0],
        ArrowRight: [nudge, 0],
        ArrowUp: [0, nudge],
        ArrowDown: [0, -nudge],
      }[e.key];
      if (!delta) return;
      e.preventDefault();
      moveStart(start.x + delta[0], start.y + delta[1]);
    },
    [moveStart, start],
  );

  const pathPoints = useMemo(() => path.map((p) => toScreen(p.x, p.y)), [path]);
  const pathD = pathPoints
    .map(
      (p, i) => `${i === 0 ? 'M' : 'L'}${p.sx.toFixed(2)},${p.sy.toFixed(2)}`,
    )
    .join('');
  const minimum = toScreen(0, 0);

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          className="bg-fd-background focus-visible:ring-fd-ring shrink-0 cursor-crosshair rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
          onClick={handleSvgClick}
          onKeyDown={handleSvgKeyDown}
          tabIndex={0}
          role="img"
          aria-label={`Loss surface of f(x, y) = x² + 2y². Starting point x ${start.x.toFixed(2)}, y ${start.y.toFixed(2)}. Click, or use the arrow keys, to move it.`}
        >
          {CONTOUR_LEVELS.map((level) => (
            <path
              key={level}
              d={contourPath(level)}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.15}
              className="text-fd-foreground"
            />
          ))}
          {/* axes */}
          <line
            x1={0}
            y1={SIZE / 2}
            x2={SIZE}
            y2={SIZE / 2}
            stroke="currentColor"
            strokeOpacity={0.1}
          />
          <line
            x1={SIZE / 2}
            y1={0}
            x2={SIZE / 2}
            y2={SIZE}
            stroke="currentColor"
            strokeOpacity={0.1}
          />
          {/* minimum marker */}
          <circle
            cx={minimum.sx}
            cy={minimum.sy}
            r={4}
            className="fill-fd-primary"
          />
          {/* descent path */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-fd-primary"
          />
          {pathPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.sx}
              cy={p.sy}
              r={i === pathPoints.length - 1 ? 5 : 2.5}
              className={
                i === pathPoints.length - 1
                  ? 'fill-fd-primary'
                  : 'fill-fd-primary/50'
              }
            />
          ))}
        </svg>

        <div className="flex flex-1 flex-col gap-3 text-sm">
          <p className="text-fd-muted-foreground">
            Click anywhere on the surface to drop a starting point, then run
            gradient descent on <code>f(x, y) = x² + 2y²</code>. Watch how the
            learning rate changes the path.
          </p>

          <label className="flex flex-col gap-1">
            <span className="flex justify-between">
              <span>Learning rate</span>
              <span className="font-mono">{learningRate.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0.02}
              max={0.55}
              step={0.01}
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={running ? stop : play}
              disabled={converged || diverged}
              className="bg-fd-primary text-fd-primary-foreground rounded-md px-3 py-1.5 font-medium disabled:opacity-50"
            >
              {running ? 'Pause' : 'Run'}
            </button>
            <button
              type="button"
              onClick={step}
              disabled={running || converged || diverged}
              className="rounded-md border px-3 py-1.5 font-medium disabled:opacity-50"
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-md border px-3 py-1.5 font-medium"
            >
              Reset
            </button>
          </div>

          <div
            className="text-fd-muted-foreground grid grid-cols-2 gap-2 font-mono text-xs"
            aria-live="polite"
          >
            <span>step: {path.length - 1}</span>
            <span>loss: {currentLoss.toFixed(4)}</span>
            <span>x: {current.x.toFixed(3)}</span>
            <span>y: {current.y.toFixed(3)}</span>
          </div>

          {converged && (
            <p className="text-fd-primary">
              Converged — loss is effectively zero.
            </p>
          )}
          {diverged && (
            <p className="text-red-500">
              Diverged — the learning rate is too large for this curvature.
              Lower it and reset.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
