import { createGetUrl, llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

// `defineDocs` is a build-time macro, so each call must be inline with literals.
const docsCollection = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },
    // Dynamic imports keep the build-only glossary scanner out of the app bundle.
    mdxOptions: async (environment) => {
      const { createMdxOptions } = await import('./mdx-options');
      const glossary = await import('./remark-reference-links');

      const terms = glossary.collectReferenceTerms(
        'content/reference',
        '/reference',
      );

      return createMdxOptions(environment, {
        remarkPlugins: [
          [glossary.remarkReferenceLinks, terms],
          [glossary.remarkReferencePreviews, terms],
        ],
      });
    },
  },
  meta: { schema: metaSchema },
});

const referenceCollection = defineDocs({
  dir: 'content/reference',
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },
    mdxOptions: async (environment) => {
      const { createMdxOptions } = await import('./mdx-options');
      const glossary = await import('./remark-reference-links');

      const terms = glossary.collectReferenceTerms(
        'content/reference',
        '/reference',
      );

      return createMdxOptions(environment, {
        remarkPlugins: [[glossary.remarkReferencePreviews, terms]],
      });
    },
  },
  meta: { schema: metaSchema },
});

type PageRef = { slugs: string[]; locale?: string };

function createCollection(
  name: string,
  fumadocsSource: ReturnType<typeof docsCollection.toFumadocsSource>,
) {
  const route = `/${name}`;
  const imageRoute = `/og/${name}`;
  const contentRoute = `/llms.mdx/${name}`;

  const source = loader({
    baseUrl: route,
    source: fumadocsSource,
    plugins: [lucideIconsPlugin()],
  });

  const getContentUrl = createGetUrl(contentRoute);
  const getImageUrl = createGetUrl(imageRoute);

  return {
    name,
    route,
    imageRoute,
    contentRoute,
    contentDir: `content/${name}`,
    source,
    llms: llms(source, {
      renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
    }),
    markdownUrl(page: PageRef) {
      const segments = [...page.slugs, 'content.md'];
      return { segments, url: getContentUrl(segments, page.locale) };
    },
    imageUrl(page: PageRef) {
      const segments = [...page.slugs, 'image.png'];
      return { segments, url: getImageUrl(segments, page.locale) };
    },
  };
}

export const docs = createCollection('docs', docsCollection.toFumadocsSource());
export const reference = createCollection(
  'reference',
  referenceCollection.toFumadocsSource(),
);

export const collections = [docs, reference];

export type Collection = (typeof collections)[number];

export function getCollection(name: string): Collection | undefined {
  return collections.find((collection) => collection.name === name);
}
