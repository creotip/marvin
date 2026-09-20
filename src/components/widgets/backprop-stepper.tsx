'use client';

import { useMemo, useState } from 'react';

// Mirrors the worked example in the lesson: loss = (a * b) + c
const STAGES = [
  { label: 'Start', explain: 'Set a, b, c, then step through the forward pass, then backward.' },
  {
    label: 'Forward: d = a × b',
    explain: 'Compute the multiply node first — it feeds into the add node next.',
  },
  {
    label: 'Forward: loss = d + c',
    explain: 'Compute the add node using the value of d just computed. Forward pass done.',
  },
  {
    label: 'Backward: seed dL/dL = 1',
    explain: 'Backprop always starts here — the gradient of the loss with respect to itself is 1.',
  },
  {
    label: 'Backward through +: dL/dd, dL/dc',
    explain: 'The local gradient of a + node is 1 for each input, so both just copy the incoming gradient.',
  },
  {
    label: 'Backward through ×: dL/da, dL/db',
    explain: 'The local gradient of a × node swaps its inputs: dL/da = dL/dd · b, dL/db = dL/dd · a.',
  },
] as const;

function Node({
  x,
  y,
  label,
  value,
  highlight,
}: {
  x: number;
  y: number;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-34}
        y={-22}
        width={68}
        height={44}
        rx={8}
        className={highlight ? 'fill-fd-primary/15 stroke-fd-primary' : 'fill-fd-background stroke-fd-border'}
        strokeWidth={1.5}
      />
      <text textAnchor="middle" y={-4} className="fill-fd-muted-foreground text-[10px]">
        {label}
      </text>
      <text textAnchor="middle" y={12} className="fill-fd-foreground font-mono text-[13px] font-medium">
        {value}
      </text>
    </g>
  );
}

function OpNode({ x, y, symbol }: { x: number; y: number; symbol: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={18} className="fill-fd-secondary stroke-fd-border" strokeWidth={1.5} />
      <text textAnchor="middle" dominantBaseline="central" className="fill-fd-foreground text-sm font-semibold">
        {symbol}
      </text>
    </g>
  );
}

function Edge({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-fd-border" strokeWidth={1.5} />;
}

// Rendered in a separate pass, after every node, so labels are never
// painted over by a node box regardless of how close they sit to one.
function EdgeLabel({
  from,
  to,
  text,
}: {
  from: [number, number];
  to: [number, number];
  text: string;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  // Horizontal edges need more vertical clearance since the label would
  // otherwise land right on top of a node's own label/value text, which
  // sits at the same height; diagonal edges already clear naturally.
  const isHorizontal = y1 === y2;
  const my = (y1 + y2) / 2 - (isHorizontal ? 26 : 10);
  const width = text.length * 6.5 + 10;
  return (
    <g>
      <rect
        x={mx - width / 2}
        y={my - 11}
        width={width}
        height={16}
        rx={4}
        className="fill-fd-background"
      />
      <text x={mx} y={my} textAnchor="middle" className="fill-orange-500 font-mono text-[11px] font-semibold">
        {text}
      </text>
    </g>
  );
}

export function BackpropStepper() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-3);
  const [c, setC] = useState(10);
  const [stage, setStage] = useState(0);

  const d = a * b;
  const lossVal = d + c;

  const dLdd = 1;
  const dLdc = 1;
  const dLda = dLdd * b;
  const dLdb = dLdd * a;

  const setInput = (setter: (n: number) => void) => (n: number) => {
    setter(n);
    setStage(0);
  };

  const showForwardD = stage >= 1;
  const showForwardLoss = stage >= 2;
  const showSeed = stage >= 3;
  const showAddGrads = stage >= 4;
  const showMulGrads = stage >= 5;

  const positions = useMemo(
    () => ({
      a: [40, 40] as [number, number],
      b: [40, 130] as [number, number],
      mul: [140, 85] as [number, number],
      d: [220, 85] as [number, number],
      c: [220, 190] as [number, number],
      plus: [300, 135] as [number, number],
      loss: [380, 135] as [number, number],
    }),
    [],
  );

  return (
    <div className="not-prose my-6 rounded-xl border bg-fd-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <svg
          viewBox="0 0 420 230"
          className="w-full max-w-[420px] shrink-0 rounded-lg border bg-fd-background lg:w-[420px]"
        >
          <Edge from={positions.a} to={positions.mul} />
          <Edge from={positions.b} to={positions.mul} />
          <Edge from={positions.mul} to={positions.d} />
          <Edge from={positions.d} to={positions.plus} />
          <Edge from={positions.c} to={positions.plus} />
          <Edge from={positions.plus} to={positions.loss} />

          <Node x={positions.a[0]} y={positions.a[1]} label="a" value={String(a)} />
          <Node x={positions.b[0]} y={positions.b[1]} label="b" value={String(b)} />
          <OpNode x={positions.mul[0]} y={positions.mul[1]} symbol="×" />
          <Node
            x={positions.d[0]}
            y={positions.d[1]}
            label="d = a×b"
            value={showForwardD ? String(d) : '?'}
            highlight={stage === 1}
          />
          <Node x={positions.c[0]} y={positions.c[1]} label="c" value={String(c)} />
          <OpNode x={positions.plus[0]} y={positions.plus[1]} symbol="+" />
          <Node
            x={positions.loss[0]}
            y={positions.loss[1]}
            label="loss = d+c"
            value={showForwardLoss ? String(lossVal) : '?'}
            highlight={stage === 2}
          />

          {showMulGrads && <EdgeLabel from={positions.a} to={positions.mul} text={`dL/da=${dLda}`} />}
          {showMulGrads && <EdgeLabel from={positions.b} to={positions.mul} text={`dL/db=${dLdb}`} />}
          {showAddGrads && <EdgeLabel from={positions.d} to={positions.plus} text={`dL/dd=${dLdd}`} />}
          {showAddGrads && <EdgeLabel from={positions.c} to={positions.plus} text={`dL/dc=${dLdc}`} />}
          {showSeed && <EdgeLabel from={positions.plus} to={positions.loss} text="dL/dL=1" />}
        </svg>

        <div className="flex flex-1 flex-col gap-3 text-sm">
          <div className="flex gap-3">
            {(
              [
                ['a', a, setA],
                ['b', b, setB],
                ['c', c, setC],
              ] as const
            ).map(([name, val, setter]) => (
              <label key={name} className="flex flex-col gap-1">
                <span className="font-mono text-fd-muted-foreground">{name}</span>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => setInput(setter)(Number(e.target.value))}
                  className="w-16 rounded-md border bg-fd-background px-2 py-1 font-mono"
                />
              </label>
            ))}
          </div>

          <div className="rounded-md border bg-fd-background p-3">
            <p className="font-medium">
              Step {stage} / {STAGES.length - 1}: {STAGES[stage].label}
            </p>
            <p className="mt-1 text-fd-muted-foreground">{STAGES[stage].explain}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStage((s) => Math.min(s + 1, STAGES.length - 1))}
              disabled={stage === STAGES.length - 1}
              className="rounded-md bg-fd-primary px-3 py-1.5 font-medium text-fd-primary-foreground disabled:opacity-50"
            >
              Next step
            </button>
            <button
              type="button"
              onClick={() => setStage(0)}
              disabled={stage === 0}
              className="rounded-md border px-3 py-1.5 font-medium disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
