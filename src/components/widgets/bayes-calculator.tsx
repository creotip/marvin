'use client';

import { useMemo, useState } from 'react';

// Live — pure JS arithmetic, no libraries and no precomputed data. Every
// number on screen is recalculated from the three slider values on every
// render.

const POPULATION = 1_000_000;
const PRIOR_MIN = 0.0001; // 0.01%
const PRIOR_MAX = 0.5; // 50%

function sliderToPrior(t: number) {
  const logMin = Math.log10(PRIOR_MIN);
  const logMax = Math.log10(PRIOR_MAX);
  return 10 ** (logMin + t * (logMax - logMin));
}

function priorToSlider(p: number) {
  const logMin = Math.log10(PRIOR_MIN);
  const logMax = Math.log10(PRIOR_MAX);
  return (Math.log10(p) - logMin) / (logMax - logMin);
}

function formatPercent(p: number) {
  if (p < 0.001) return `${(p * 100).toFixed(3)}%`;
  if (p < 0.01) return `${(p * 100).toFixed(2)}%`;
  return `${(p * 100).toFixed(1)}%`;
}

function formatCount(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

interface Preset {
  label: string;
  prior: number;
  sensitivity: number;
  falsePositiveRate: number;
}

const PRESETS: Preset[] = [
  {
    label: 'Rare disease (lesson example)',
    prior: 0.0001,
    sensitivity: 0.99,
    falsePositiveRate: 0.01,
  },
  {
    label: 'Common condition',
    prior: 0.1,
    sensitivity: 0.9,
    falsePositiveRate: 0.05,
  },
  {
    label: 'Spam filter',
    prior: 0.3,
    sensitivity: 0.95,
    falsePositiveRate: 0.02,
  },
];

export function BayesCalculator() {
  const [prior, setPrior] = useState(PRESETS[0].prior);
  const [sensitivity, setSensitivity] = useState(PRESETS[0].sensitivity);
  const [falsePositiveRate, setFalsePositiveRate] = useState(
    PRESETS[0].falsePositiveRate,
  );

  const stats = useMemo(() => {
    const withCondition = POPULATION * prior;
    const withoutCondition = POPULATION - withCondition;
    const truePositives = withCondition * sensitivity;
    const falsePositives = withoutCondition * falsePositiveRate;
    const totalPositives = truePositives + falsePositives;
    const posterior = totalPositives > 0 ? truePositives / totalPositives : 0;

    return { withCondition, truePositives, falsePositives, posterior };
  }, [prior, sensitivity, falsePositiveRate]);

  const loadPreset = (preset: Preset) => {
    setPrior(preset.prior);
    setSensitivity(preset.sensitivity);
    setFalsePositiveRate(preset.falsePositiveRate);
  };

  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => loadPreset(preset)}
            className="focus-visible:ring-fd-ring rounded-md border px-2.5 py-1 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="flex justify-between">
            <span>Prior — how common the condition is</span>
            <span className="font-mono">{formatPercent(prior)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={priorToSlider(prior)}
            onChange={(e) => setPrior(sliderToPrior(Number(e.target.value)))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="flex justify-between">
            <span>Sensitivity — P(positive test | has condition)</span>
            <span className="font-mono">{formatPercent(sensitivity)}</span>
          </span>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.001}
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="flex justify-between">
            <span>False positive rate — P(positive test | no condition)</span>
            <span className="font-mono">
              {formatPercent(falsePositiveRate)}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={0.3}
            step={0.001}
            value={falsePositiveRate}
            onChange={(e) => setFalsePositiveRate(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-fd-muted-foreground mb-2 text-xs">
          Belief that you have the condition, before vs. after one positive test
          result:
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-fd-muted-foreground w-16 shrink-0">
              Prior
            </span>
            <div className="bg-fd-secondary h-4 flex-1 overflow-hidden rounded">
              <div
                className="bg-fd-muted-foreground/60 h-full"
                style={{ width: `${Math.min(100, prior * 100)}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right font-mono">
              {formatPercent(prior)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-fd-muted-foreground w-16 shrink-0">
              Posterior
            </span>
            <div className="bg-fd-secondary h-4 flex-1 overflow-hidden rounded">
              <div
                className="bg-fd-primary h-full"
                style={{ width: `${Math.min(100, stats.posterior * 100)}%` }}
              />
            </div>
            <span className="text-fd-primary w-16 shrink-0 text-right font-mono">
              {formatPercent(stats.posterior)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-fd-muted-foreground mt-4 text-xs" aria-live="polite">
        Out of {formatCount(POPULATION)} people, about{' '}
        <span className="text-fd-foreground font-mono">
          {formatCount(stats.withCondition)}
        </span>{' '}
        actually have the condition. Testing everyone gives{' '}
        <span className="text-fd-foreground font-mono">
          {formatCount(stats.truePositives)}
        </span>{' '}
        true positives and{' '}
        <span className="text-fd-foreground font-mono">
          {formatCount(stats.falsePositives)}
        </span>{' '}
        false positives — so a positive result means a{' '}
        <span className="text-fd-primary font-mono">
          {formatPercent(stats.posterior)}
        </span>{' '}
        chance of actually having it.
      </p>
    </div>
  );
}
