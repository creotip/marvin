import { notFound } from 'next/navigation';
import { collections, getCollection } from '@/lib/content';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/llms.mdx/[collection]/[[...slug]]'>,
) {
  const { collection: name, slug } = await params;
  const collection = getCollection(name);
  const page = collection?.source.getPage(slug?.slice(0, -1));
  if (!page || !collection) notFound();

  return new Response(await collection.llms.page(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return collections.flatMap((collection) =>
    collection.source.getPages().map((page) => ({
      collection: collection.name,
      lang: page.locale,
      slug: collection.markdownUrl(page).segments,
    })),
  );
}
