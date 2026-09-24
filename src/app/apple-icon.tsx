import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Same mark as `icon.tsx`, scaled up — iOS home-screen icons need their own
// larger render rather than a stretched-up favicon, and don't support
// transparency, hence the opaque background here too.
const DOT_SIZES = [16, 28, 44, 62];

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1c1613',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
