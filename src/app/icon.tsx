import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// The "resolving dots" mark: small becomes large, left to right — the same
// visual idea used for the FAQ/homepage "Open, decoding" framing, just
// rendered as a fixed brand mark instead of illustrative widget content.
const DOT_SIZES = [3, 5, 8, 11];

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1c1613',
        borderRadius: 7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {DOT_SIZES.map((dotSize, i) => (
          <div
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: '#ea6a1f',
            }}
          />
        ))}
      </div>
    </div>,
    size,
  );
}
