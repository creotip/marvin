'use client';

import { useMemo, useState } from 'react';
import { encode, decode } from 'gpt-tokenizer';

const DEFAULT_TEXT = "Tokenization splits text into pieces — like this, or unfamiliar: gpt-tokenizer.";

const COLORS = [
  'oklch(0.75 0.12 30)',
  'oklch(0.75 0.12 90)',
  'oklch(0.75 0.12 150)',
  'oklch(0.75 0.12 210)',
  'oklch(0.75 0.12 270)',
  'oklch(0.75 0.12 330)',
];

function displayText(s: string) {
  return s.replace(/ /g, '·').replace(/\n/g, '⏎\n');
}

export function TokenizerPlayground() {
  const [text, setText] = useState(DEFAULT_TEXT);

  const tokens = useMemo(() => {
    if (!text) return [];
    let ids: number[];
    try {
      ids = encode(text);
    } catch {
      return [];
    }
    return ids.map((id, i) => {
      let piece = '';
      try {
        piece = decode([id]);
      } catch {
        piece = '�';
      }
      return { id, piece, color: COLORS[i % COLORS.length] };
    });
  }, [text]);

  return (
    <div className="not-prose my-6 rounded-xl border bg-fd-card p-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-fd-muted-foreground">Type anything — this runs a real tokenizer (cl100k_base, the GPT-3.5/4 encoding) entirely in your browser.</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-fd-background p-2 font-mono text-sm"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-1 rounded-md border bg-fd-background p-3">
        {tokens.length === 0 && <span className="text-sm text-fd-muted-foreground">(empty)</span>}
        {tokens.map((t, i) => (
          <span
            key={i}
            style={{ backgroundColor: t.color }}
            className="whitespace-pre rounded px-1 py-0.5 font-mono text-sm text-black/80"
            title={`token id ${t.id}`}
          >
            {displayText(t.piece)}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-fd-muted-foreground">
        <span>{tokens.length} tokens</span>
        <span>{text.length} characters</span>
        <span>{text.length === 0 ? '—' : (text.length / Math.max(tokens.length, 1)).toFixed(2)} chars/token</span>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        Token IDs (what the model actually sees):{' '}
        <span className="font-mono">[{tokens.map((t) => t.id).join(', ')}]</span>
      </p>
    </div>
  );
}
