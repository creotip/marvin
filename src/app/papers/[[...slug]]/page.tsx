import type { Metadata } from 'next';
import { ContentPage, contentMetadata } from '@/components/content-page';
import { papers } from '@/lib/content';

export default async function Page(props: PageProps<'/papers/[[...slug]]'>) {
  const { slug } = await props.params;

  return <ContentPage collection={papers} slug={slug} />;
}

export async function generateStaticParams() {
  return papers.source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/papers/[[...slug]]'>,
): Promise<Metadata> {
  const { slug } = await props.params;

  return contentMetadata(papers, slug);
}
