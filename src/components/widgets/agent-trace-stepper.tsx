'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Brain, CircleCheck, Eye, Wrench } from 'lucide-react';
import { cn } from '@/lib/cn';

// Precomputed — same honesty pattern as the attention visualizer. These are
// hand-scripted traces, not a real agent loop running against a real model
// or real tools. They're written to be a faithful illustration of the
// lesson's own Thought → Tool call → Observation → ... → Final answer loop,
// including one goal that needs no tool at all and one where the honest
// move is admitting a search came up empty rather than guessing.

type StepKind = 'thought' | 'tool-call' | 'observation' | 'final-answer';

interface TraceStep {
  kind: StepKind;
  text: string;
}

interface Goal {
  label: string;
  prompt: string;
  steps: TraceStep[];
}

const GOALS: Goal[] = [
  {
    label: 'Weather comparison',
    prompt: 'Is it warmer in Miami or Seattle right now?',
    steps: [
      {
        kind: 'thought',
        text: 'I need the current temperature in both cities to compare them.',
      },
      { kind: 'tool-call', text: 'get_weather(city="Miami")' },
      { kind: 'observation', text: '84°F, sunny' },
      { kind: 'thought', text: "Now I need Seattle's temperature too." },
      { kind: 'tool-call', text: 'get_weather(city="Seattle")' },
      { kind: 'observation', text: '61°F, cloudy' },
      {
        kind: 'thought',
        text: '84°F is higher than 61°F, so Miami is warmer.',
      },
      {
        kind: 'final-answer',
        text: 'Miami is warmer right now — 84°F vs. 61°F in Seattle.',
      },
    ],
  },
  {
    label: 'Simple math',
    prompt: "What's 12 × 7?",
    steps: [
      {
        kind: 'thought',
        text: 'This is simple arithmetic I can compute directly — no tool needed.',
      },
      { kind: 'final-answer', text: '12 × 7 = 84.' },
    ],
  },
  {
    label: 'Search comes up empty',
    prompt: "What's the population of Atlantis Prime?",
    steps: [
      {
        kind: 'thought',
        text: "I don't recognize this place — let me search rather than guess.",
      },
      { kind: 'tool-call', text: 'search(query="Atlantis Prime population")' },
      { kind: 'observation', text: 'No results found.' },
      {
        kind: 'thought',
        text: 'The search found nothing. I should say so rather than making up a number.',
      },
      {
        kind: 'final-answer',
        text: 'I couldn\'t find any population data for "Atlantis Prime" — it doesn\'t appear to be a real, documented place.',
      },
    ],
  },
];

const STEP_META: Record<
  StepKind,
  { label: string; icon: typeof Brain; className: string }
> = {
  thought: {
    label: 'Thought',
    icon: Brain,
    className: 'text-fd-muted-foreground',
  },
  'tool-call': {
    label: 'Tool call',
    icon: Wrench,
    className: 'text-amber-600 dark:text-amber-400',
  },
  observation: {
    label: 'Observation',
    icon: Eye,
    className: 'text-sky-600 dark:text-sky-400',
  },
  'final-answer': {
    label: 'Final answer',
    icon: CircleCheck,
    className: 'text-emerald-600 dark:text-emerald-400',
  },
};

const PLAY_DELAY_MS = 900;

export function AgentTraceStepper() {
  const [goalIndex, setGoalIndex] = useState(0);
  const [position, setPosition] = useState(-1);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goal = GOALS[goalIndex];
  const total = goal.steps.length;

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
    intervalRef.current = setInterval(step, PLAY_DELAY_MS);
  }, [step, position, total]);

  useEffect(() => stop, [stop]);

  const reset = useCallback(() => {
    stop();
    setPosition(-1);
  }, [stop]);

  const changeGoal = (i: number) => {
    stop();
    setGoalIndex(i);
    setPosition(-1);
  };

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {GOALS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            onClick={() => changeGoal(i)}
            aria-pressed={i === goalIndex}
            className={cn(
              'focus-visible:ring-fd-ring rounded-md border px-2.5 py-1 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none',
              i === goalIndex &&
                'border-fd-primary bg-fd-primary/15 text-fd-primary',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="text-fd-muted-foreground mb-4 text-sm">
        Goal:{' '}
        <span className="text-fd-foreground">&quot;{goal.prompt}&quot;</span>
      </p>

      <div className="flex flex-col gap-3">
        {goal.steps.slice(0, position + 1).map((s, i) => {
          const meta = STEP_META[s.kind];
          const Icon = meta.icon;
          return (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <Icon className={cn('mt-0.5 size-4 shrink-0', meta.className)} />
              <div className="min-w-0">
                <p className={cn('text-xs font-medium', meta.className)}>
                  {meta.label}
                </p>
                {s.kind === 'tool-call' || s.kind === 'observation' ? (
                  <code className="bg-fd-secondary mt-0.5 inline-block rounded px-1.5 py-0.5 font-mono text-xs">
                    {s.text}
                  </code>
                ) : (
                  <p
                    className={cn(
                      s.kind === 'final-answer' &&
                        'text-fd-foreground font-medium',
                    )}
                  >
                    {s.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {position === -1 && (
          <p className="text-fd-muted-foreground text-sm">
            Click &quot;Run&quot; to watch the agent loop step through this
            goal.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={running ? stop : play}
          disabled={position + 1 >= total}
          className="bg-fd-primary text-fd-primary-foreground rounded-md px-3 py-1.5 font-medium disabled:opacity-50"
        >
          {running ? 'Pause' : position === -1 ? 'Run' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={step}
          disabled={running || position + 1 >= total}
          className="rounded-md border px-3 py-1.5 font-medium disabled:opacity-50"
        >
          Step
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-3 py-1.5 font-medium"
        >
          Reset
        </button>
        <span className="text-fd-muted-foreground ml-auto font-mono text-xs">
          {position + 1} / {total}
        </span>
      </div>
    </div>
  );
}
