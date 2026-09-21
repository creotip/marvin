import { notFound } from 'next/navigation';
import { generateOGImage } from 'fumadocs-ui/og';
import { collections, getCollection } from '@/lib/content';
import { appName } from '@/lib/shared';

export const revalidate = false;

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
    site: appName,
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
