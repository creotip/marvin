'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Simulated, not measured — see the lesson's own caveat on why this is
// illustrative rather than real hardware timing. The point is the shape
// of the two curves (linear vs quadratic total cost), not exact numbers.
const BASE_COST = 2;
const RECOMPUTE_COST_PER_TOKEN = 1.2; // without KV cache: redo attention over everything so far
const CACHE_READ_COST_PER_TOKEN = 0.15; // with KV cache: just read the growing cache

function noCacheStepCost(step: number) {
  return BASE_COST + step * RECOMPUTE_COST_PER_TOKEN;
}
function cachedStepCost(step: number) {
  return BASE_COST + step * CACHE_READ_COST_PER_TOKEN;
}

export function KVCacheSimulator() {
  const [totalTokens, setTotalTokens] = useState(30);
  const [generated, setGenerated] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const step = useCallback(() => {
    setGenerated((g) => {
      if (g + 1 >= totalTokens) {
        stop();
        return totalTokens;
      }
      return g + 1;
    });
  }, [stop, totalTokens]);

  const play = useCallback(() => {
    if (generated >= totalTokens) return;
    setRunning(true);
    intervalRef.current = setInterval(step, 60);
  }, [step, generated, totalTokens]);

  useEffect(() => stop, [stop]);

  const reset = useCallback(
    (newTotal?: number) => {
      stop();
      setGenerated(0);
      if (newTotal !== undefined) setTotalTokens(newTotal);
    },
    [stop],
  );

  const { noCacheCosts, cachedCosts, noCacheTotal, cachedTotal } = useMemo(() => {
    const noCache: number[] = [];
    const cached: number[] = [];
    let noCacheSum = 0;
    let cachedSum = 0;
    for (let i = 0; i < generated; i++) {
      const nc = noCacheStepCost(i);
      const c = cachedStepCost(i);
      noCache.push(nc);
      cached.push(c);
      noCacheSum += nc;
      cachedSum += c;
    }
    return { noCacheCosts: noCache, cachedCosts: cached, noCacheTotal: noCacheSum, cachedTotal: cachedSum };
  }, [generated]);

  const maxCost = Math.max(noCacheStepCost(totalTokens - 1), 1);
  const speedup = cachedTotal > 0 ? noCacheTotal / cachedTotal : 1;
  const done = generated >= totalTokens;

  const Bars = ({ costs, color }: { costs: number[]; color: string }) => (
    <div className="flex h-24 items-end gap-px overflow-hidden rounded-md border bg-fd-background p-1">
      {costs.map((c, i) => (
        <div
          key={i}
          style={{ height: `${Math.min(100, (c / maxCost) * 100)}%`, backgroundColor: color, width: 4 }}
          className="shrink-0 rounded-t-sm"
        />
      ))}
    </div>
  );

  return (
    <div className="not-prose my-6 rounded-xl border bg-fd-card p-4">
      <label className="mb-3 flex flex-col gap-1 text-sm">
        <span className="flex justify-between">
          <span>Tokens to generate</span>
          <span className="font-mono">{totalTokens}</span>
        </span>
        <input
          type="range"
          min={10}
          max={60}
          step={5}
          value={totalTokens}
          onChange={(e) => reset(Number(e.target.value))}
          className="w-full"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 flex justify-between text-xs text-fd-muted-foreground">
            <span>Without KV cache (recompute every step)</span>
            <span className="font-mono text-red-500">{noCacheTotal.toFixed(0)} ms</span>
          </p>
          <Bars costs={noCacheCosts} color="var(--color-red-500)" />
        </div>
        <div>
          <p className="mb-1 flex justify-between text-xs text-fd-muted-foreground">
            <span>With KV cache</span>
            <span className="font-mono text-fd-primary">{cachedTotal.toFixed(0)} ms</span>
          </p>
          <Bars costs={cachedCosts} color="var(--color-fd-primary)" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={running ? stop : play}
          disabled={done}
          className="rounded-md bg-fd-primary px-3 py-1.5 font-medium text-fd-primary-foreground disabled:opacity-50"
        >
          {running ? 'Pause' : 'Generate'}
        </button>
        <button
          type="button"
          onClick={step}
          disabled={running || done}
          className="rounded-md border px-3 py-1.5 font-medium disabled:opacity-50"
        >
          Step
        </button>
        <button type="button" onClick={() => reset()} className="rounded-md border px-3 py-1.5 font-medium">
          Reset
        </button>
        <span className="font-mono text-xs text-fd-muted-foreground">
          {generated} / {totalTokens} tokens
        </span>
        {generated > 0 && (
          <span className="ml-auto font-mono text-sm text-fd-primary">{speedup.toFixed(1)}x faster so far</span>
        )}
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        Simulated costs, not measured hardware timing — the point is the
        shape: without caching, each step redoes work proportional to
        everything generated so far (quadratic total cost); with caching,
        each step is roughly constant work (linear total cost). The
        speedup grows the longer the generation runs.
      </p>
    </div>
  );
}
