import { notFound } from 'next/navigation';
import { generateOGImage } from 'fumadocs-ui/og';
import { collections, getCollection } from '@/lib/content';

export const revalidate = false;

// Satori (next/og's renderer) doesn't process Tailwind classes, so this is a
// plain-inline-style stand-in for `src/components/wordmark.tsx`, not a reuse
// of it — same "Open" + accent-colored "Decode" split, just via inline
// `style` instead of `text-fd-primary`.
const PRIMARY_TEXT_COLOR = '#ea6a1f';
const PRIMARY_COLOR = 'rgba(234,106,31,0.35)';

const DOT_SIZES = [10, 16, 24, 34];

function OGWordmark() {
  // Satori (next/og's renderer), unlike a real browser, doesn't pack nested
  // inline spans tightly by default — an explicit `display: flex` with no
  // `gap` is what actually keeps "Open" and "Decode" touching.
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ color: 'white' }}>Open</span>
      <span style={{ color: PRIMARY_TEXT_COLOR }}>Decode</span>
    </div>
  );
}

function OGDotsIcon() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {DOT_SIZES.map((dotSize, i) => (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: PRIMARY_TEXT_COLOR,
          }}
        />
      ))}
    </div>
  );
}

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/[collection]/[...slug]'>,
) {
  const { collection: name, slug } = await params;
  const collection = getCollection(name);
  const page = collection?.source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: <OGWordmark />,
    icon: <OGDotsIcon />,
    primaryColor: PRIMARY_COLOR,
    primaryTextColor: PRIMARY_TEXT_COLOR,
  });
}

export function generateStaticParams() {
  return collections.flatMap((collection) =>
    collection.source.getPages().map((page) => ({
      collection: collection.name,
      lang: page.locale,
      slug: collection.imageUrl(page).segments,
    })),
  );
}
