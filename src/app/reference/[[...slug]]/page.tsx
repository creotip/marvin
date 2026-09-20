import { referenceSource } from '@/lib/reference-source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: PageProps<'/reference/[[...slug]]'>) {
  const params = await props.params;
  const page = referenceSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-6">{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(referenceSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return referenceSource.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/reference/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = referenceSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: `${page.data.title} — Marvin Reference`,
    description: page.data.description,
  };
}
