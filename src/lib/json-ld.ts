import type { Collection } from './content';
import { appName, siteUrl } from './shared';

type ContentPageData = {
  url: string;
  data: { title: string; description?: string };
};

/**
 * JSON-LD for a docs/reference/people page: a BreadcrumbList plus a
 * collection-appropriate primary entity — Article for a lesson, DefinedTerm
 * for a glossary entry, Person for a profile. No `datePublished`/`dateModified`
 * — content has no date frontmatter, and fabricating one would be worse than
 * omitting it.
 */
export function contentJsonLd(collection: Collection, page: ContentPageData) {
  const url = new URL(page.url, siteUrl).toString();
  const collectionUrl = new URL(collection.route, siteUrl).toString();
  const collectionLabel =
    collection.name.charAt(0).toUpperCase() + collection.name.slice(1);

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: appName,
        item: siteUrl.toString(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: collectionLabel,
        item: collectionUrl,
      },
      { '@type': 'ListItem', position: 3, name: page.data.title, item: url },
    ],
  };

  const primary =
    collection.name === 'reference'
      ? {
          '@type': 'DefinedTerm',
          name: page.data.title,
          description: page.data.description,
          url,
          inDefinedTermSet: collectionUrl,
        }
      : collection.name === 'people'
        ? {
            '@type': 'Person',
            name: page.data.title,
            description: page.data.description,
            url,
          }
        : {
            '@type': 'Article',
            headline: page.data.title,
            description: page.data.description,
            url,
            mainEntityOfPage: url,
            author: { '@type': 'Organization', name: appName },
            publisher: { '@type': 'Organization', name: appName },
          };

  return {
    '@context': 'https://schema.org',
    '@graph': [primary, breadcrumb],
  };
}
