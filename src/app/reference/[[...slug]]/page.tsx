import type { Metadata } from 'next';
import { ContentPage, contentMetadata } from '@/components/content-page';
import { reference } from '@/lib/content';

export default async function Page(props: PageProps<'/reference/[[...slug]]'>) {
  const { slug } = await props.params;

  return <ContentPage collection={reference} slug={slug} />;
}

export async function generateStaticParams() {
  return reference.source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/reference/[[...slug]]'>,
): Promise<Metadata> {
  const { slug } = await props.params;

  return contentMetadata(reference, slug);
}
