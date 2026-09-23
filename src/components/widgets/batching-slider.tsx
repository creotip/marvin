'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';

// Simulated by design — these are illustrative formulas, not measurements
// from a real GPU or server. They're built to reproduce the two specific,
// named claims from the lesson: per-step compute time stays roughly flat
// until the batch is large enough to become compute-bound (the
// Misconception callout), while latency mostly grows from queueing —
// waiting for a batch to fill — not from the step itself slowing down.

const BATCH_SIZES = [1, 2, 4, 8, 16, 32, 64, 128] as const;
const COMPUTE_BOUND_THRESHOLD = 32; // batch size where the GPU stops being memory-bandwidth-bound
const BASE_STEP_MS = 20; // per-step decode time while bandwidth-bound
const QUEUE_MS_PER_SLOT = 1.5; // average wait contributed by each additional batch slot

function stepTimeMs(batch: number) {
  const over = Math.max(0, batch - COMPUTE_BOUND_THRESHOLD);
  return BASE_STEP_MS * (1 + over / COMPUTE_BOUND_THRESHOLD);
}

function queueDelayMs(batch: number) {
  return batch * QUEUE_MS_PER_SLOT;
}

const MAX_LATENCY_MS = queueDelayMs(128) + stepTimeMs(128);
// Throughput plateaus once compute-bound — the achievable ceiling is the
// batch size at the threshold divided by the (flat) bandwidth-bound step
// time, not whatever the formula would extrapolate to at a larger batch.
const MAX_THROUGHPUT = (COMPUTE_BOUND_THRESHOLD * 1000) / BASE_STEP_MS;
const VISUAL_SLOT_CAP = 32;

export function BatchingSlider() {
  const [index, setIndex] = useState(2); // batch size 4

  const batch = BATCH_SIZES[index];
  const { step, queue, latency, throughput, computeBound } = useMemo(() => {
    const step = stepTimeMs(batch);
    const queue = queueDelayMs(batch);
    return {
      step,
      queue,
      latency: step + queue,
      throughput: (batch * 1000) / step,
      computeBound: batch > COMPUTE_BOUND_THRESHOLD,
    };
  }, [batch]);

  const visibleSlots = Math.min(batch, VISUAL_SLOT_CAP);
  const overflow = batch - visibleSlots;

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="flex justify-between">
          <span>Batch size — requests sharing one decode step</span>
          <span className="font-mono">{batch}</span>
        </span>
        <input
          type="range"
          min={0}
          max={BATCH_SIZES.length - 1}
          step={1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
        />
      </label>

      <div
        className="bg-fd-background mt-4 flex min-h-[52px] flex-wrap items-center gap-1 rounded-lg border p-2"
        role="img"
        aria-label={`${batch} requests batched into one decode step.`}
      >
        {Array.from({ length: visibleSlots }, (_, i) => (
          <span
            key={i}
            className="bg-fd-primary/70 size-3.5 shrink-0 rounded-sm"
          />
        ))}
        {overflow > 0 && (
          <span className="text-fd-muted-foreground ml-1 text-xs">
            +{overflow} more
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-fd-muted-foreground text-xs">
            Time per step
            {computeBound && (
              <span className="text-amber-600 dark:text-amber-400">
                {' '}
                — compute-bound
              </span>
            )}
          </p>
          <p
            className={cn(
              'font-mono text-lg',
              computeBound && 'text-amber-600 dark:text-amber-400',
            )}
          >
            {step.toFixed(0)} ms
          </p>
          <div className="bg-fd-secondary mt-1 h-2 overflow-hidden rounded">
            <div
              className={cn(
                'h-full',
                computeBound ? 'bg-amber-500' : 'bg-fd-primary',
              )}
              style={{
                width: `${Math.min(100, (step / stepTimeMs(128)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-fd-muted-foreground text-xs">
            Latency (queue + step)
          </p>
          <p className="font-mono text-lg">{latency.toFixed(0)} ms</p>
          <div className="bg-fd-secondary mt-1 h-2 overflow-hidden rounded">
            <div
              className="bg-fd-primary h-full"
              style={{
                width: `${Math.min(100, (latency / MAX_LATENCY_MS) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-fd-muted-foreground text-xs">
            Throughput (all users)
          </p>
          <p className="font-mono text-lg">
            {Math.round(throughput).toLocaleString('en-US')} tok/s
          </p>
          <div className="bg-fd-secondary mt-1 h-2 overflow-hidden rounded">
            <div
              className="bg-fd-primary h-full"
              style={{
                width: `${Math.min(100, (throughput / MAX_THROUGHPUT) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <p className="text-fd-muted-foreground mt-4 text-xs">
        {computeBound
          ? 'Batch large enough to be compute-bound: the step itself is now slower, and throughput stops climbing even as latency keeps rising.'
          : 'Still bandwidth-bound: the step barely slows down as batch size grows — almost all of the added latency is queueing, not compute.'}
      </p>
    </div>
  );
}
