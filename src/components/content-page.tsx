import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { getMDXComponents } from '@/components/mdx';
import { DepthProvider, DepthToggle } from '@/components/depth';
import type { Collection } from '@/lib/content';
import { gitConfig } from '@/lib/shared';

export function ContentPage({
  collection,
  slug,
}: {
  collection: Collection;
  slug: string[] | undefined;
}) {
  const page = collection.source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = collection.markdownUrl(page).url;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <DepthProvider>
        <div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${collection.contentDir}/${page.path}`}
          />
          <DepthToggle />
        </div>
        <DocsBody>
          <MDX
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(collection.source, page),
            })}
          />
        </DocsBody>
      </DepthProvider>
    </DocsPage>
  );
}

export function contentMetadata(
  collection: Collection,
  slug: string[] | undefined,
): Metadata {
  const page = collection.source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: collection.imageUrl(page).url,
    },
  };
}
