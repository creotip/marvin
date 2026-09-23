'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  Bot,
  FastForward,
  Flag,
  Play,
  RotateCcw,
  Skull,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// Live — tabular Q-learning, trained in the browser on every click. No
// precomputed policy and no canned trajectory: the grid reflects exactly
// what this run has learned so far, and re-training from scratch can
// converge on a visibly different (but still correct) route.

const SIZE = 5;
const START = { row: 4, col: 0 };
const GOAL = { row: 0, col: 4 };
const TRAP = { row: 2, col: 2 };
const STEP_REWARD = -0.02;
const GOAL_REWARD = 1;
const TRAP_REWARD = -1;
const ALPHA = 0.5; // learning rate
const GAMMA = 0.9; // discount factor
const MAX_STEPS = 60;
const WATCH_DELAY_MS = 350;

type Cell = { row: number; col: number };

const ACTIONS = [
  { dr: -1, dc: 0 }, // up
  { dr: 0, dc: 1 }, // right
  { dr: 1, dc: 0 }, // down
  { dr: 0, dc: -1 }, // left
];

const sameCell = (a: Cell, b: Cell) => a.row === b.row && a.col === b.col;
const stateIndex = (cell: Cell) => cell.row * SIZE + cell.col;
const createQTable = (): number[][] =>
  Array.from({ length: SIZE * SIZE }, () => [0, 0, 0, 0]);

function step(cell: Cell, actionIndex: number) {
  const { dr, dc } = ACTIONS[actionIndex];
  const next: Cell = {
    row: Math.min(SIZE - 1, Math.max(0, cell.row + dr)),
    col: Math.min(SIZE - 1, Math.max(0, cell.col + dc)),
  };
  if (sameCell(next, GOAL)) return { next, reward: GOAL_REWARD, done: true };
  if (sameCell(next, TRAP)) return { next, reward: TRAP_REWARD, done: true };
  return { next, reward: STEP_REWARD, done: false };
}

// Decays from full exploration to mostly-greedy over ~150 episodes.
const epsilonForEpisode = (episode: number) =>
  Math.max(0.05, 1 - episode / 150);

function bestAction(q: number[][], cell: Cell): number {
  const values = q[stateIndex(cell)];
  let best = 0;
  for (let a = 1; a < values.length; a++)
    if (values[a] > values[best]) best = a;
  return best;
}

function chooseAction(q: number[][], cell: Cell, epsilon: number) {
  if (Math.random() < epsilon)
    return Math.floor(Math.random() * ACTIONS.length);
  return bestAction(q, cell);
}

/** Mutates `q` in place — the caller owns cloning for React state updates. */
function runEpisode(q: number[][], episode: number) {
  let cell = START;
  const epsilon = epsilonForEpisode(episode);

  for (let i = 0; i < MAX_STEPS; i++) {
    const a = chooseAction(q, cell, epsilon);
    const { next, reward, done } = step(cell, a);
    const s = stateIndex(cell);
    const maxNext = done ? 0 : Math.max(...q[stateIndex(next)]);
    q[s][a] += ALPHA * (reward + GAMMA * maxNext - q[s][a]);
    cell = next;
    if (done) break;
  }
}

const maxQ = (q: number[][], cell: Cell) => Math.max(...q[stateIndex(cell)]);

export function QLearningGrid() {
  const [qTable, setQTable] = useState<number[][]>(() => createQTable());
  const [episode, setEpisode] = useState(0);
  const [agentPos, setAgentPos] = useState<Cell | null>(null);
  const [watching, setWatching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const maxAbsQ = useMemo(() => {
    let m = 0.01;
    for (const row of qTable) for (const v of row) m = Math.max(m, Math.abs(v));
    return m;
  }, [qTable]);

  const train = (episodes: number) => {
    const q = qTable.map((row) => [...row]);
    let ep = episode;
    for (let i = 0; i < episodes; i++) runEpisode(q, ep++);
    setQTable(q);
    setEpisode(ep);
  };

  const stopWatching = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setWatching(false);
  };

  const watch = () => {
    setWatching(true);
    let cell = START;
    let steps = 0;
    setAgentPos(cell);

    const tick = () => {
      if (steps >= MAX_STEPS) {
        stopWatching();
        return;
      }
      const { next, done } = step(cell, bestAction(qTable, cell));
      cell = next;
      steps++;
      setAgentPos(cell);
      if (done) {
        stopWatching();
        return;
      }
      timeoutRef.current = setTimeout(tick, WATCH_DELAY_MS);
    };

    timeoutRef.current = setTimeout(tick, WATCH_DELAY_MS);
  };

  const reset = () => {
    stopWatching();
    setQTable(createQTable());
    setEpisode(0);
    setAgentPos(null);
  };

  const epsilon = epsilonForEpisode(episode);

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => train(1)}
          disabled={watching}
          className="rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          Train 1 episode
        </button>
        <button
          type="button"
          onClick={() => train(50)}
          disabled={watching}
          className="bg-fd-primary text-fd-primary-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          <FastForward className="size-4" /> Train ×50
        </button>
        <button
          type="button"
          onClick={watching ? stopWatching : watch}
          disabled={episode === 0}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          <Play className="size-4" /> {watching ? 'Stop' : 'Watch agent'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-fd-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
        >
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>

      <div
        className="text-fd-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs"
        aria-live="polite"
      >
        <span>episodes: {episode}</span>
        <span>ε (exploration): {epsilon.toFixed(2)}</span>
      </div>

      <div className="mx-auto mt-4 grid max-w-sm grid-cols-5 gap-1">
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const cell: Cell = { row: Math.floor(i / SIZE), col: i % SIZE };
          const isGoal = sameCell(cell, GOAL);
          const isTrap = sameCell(cell, TRAP);
          const isStart = sameCell(cell, START);
          const isAgent = agentPos ? sameCell(cell, agentPos) : false;
          const q = maxQ(qTable, cell);
          const intensity = Math.min(70, (Math.abs(q) / maxAbsQ) * 70);

          return (
            <div
              key={i}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-md border',
                isGoal && 'border-emerald-500/40 bg-emerald-500/15',
                isTrap && 'border-red-500/40 bg-red-500/15',
                !isGoal && !isTrap && 'border-fd-border',
              )}
              style={
                !isGoal && !isTrap
                  ? {
                      backgroundColor: `color-mix(in oklab, ${
                        q >= 0
                          ? 'var(--color-fd-primary)'
                          : 'var(--color-red-500)'
                      } ${intensity.toFixed(0)}%, transparent)`,
                    }
                  : undefined
              }
            >
              {isGoal && (
                <Flag className="size-5 text-emerald-600 dark:text-emerald-400" />
              )}
              {isTrap && (
                <Skull className="size-5 text-red-600 dark:text-red-400" />
              )}
              {!isGoal && !isTrap && episode > 0 && (
                <ArrowUp
                  className="text-fd-primary size-4 transition-transform"
                  style={{
                    transform: `rotate(${bestAction(qTable, cell) * 90}deg)`,
                  }}
                />
              )}
              {isStart && !isAgent && (
                <span className="text-fd-muted-foreground absolute bottom-0.5 left-1 text-[9px] font-medium">
                  S
                </span>
              )}
              {isAgent && (
                <Bot className="text-fd-foreground absolute size-5 drop-shadow" />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-fd-muted-foreground mt-3 text-xs">
        {episode === 0
          ? 'Untrained — every cell starts at Q = 0, so the arrows would be meaningless. Train a few episodes to see a policy emerge.'
          : 'Arrows show the greedy action (argmax Q) for each cell; a darker fill means a higher (or, in red, more negative) expected return from that cell.'}
      </p>
    </div>
  );
}
