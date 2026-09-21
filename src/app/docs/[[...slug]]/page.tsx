import type { Metadata } from 'next';
import { ContentPage, contentMetadata } from '@/components/content-page';
import { docs } from '@/lib/content';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const { slug } = await props.params;

  return <ContentPage collection={docs} slug={slug} />;
}

export async function generateStaticParams() {
  return docs.source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const { slug } = await props.params;

  return contentMetadata(docs, slug);
}
