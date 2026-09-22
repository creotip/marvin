import type { Metadata } from 'next';
import { ContentPage, contentMetadata } from '@/components/content-page';
import { people } from '@/lib/content';

export default async function Page(props: PageProps<'/people/[[...slug]]'>) {
  const { slug } = await props.params;

  return <ContentPage collection={people} slug={slug} />;
}

export async function generateStaticParams() {
  return people.source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/people/[[...slug]]'>,
): Promise<Metadata> {
  const { slug } = await props.params;

  return contentMetadata(people, slug);
}
