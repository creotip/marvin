import type { MetadataRoute } from 'next';
import { docs, people, reference } from '@/lib/content';
import { siteUrl } from '@/lib/shared';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteUrl).toString();

  return [
    {
      url: url('/'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: url('/faq'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...docs.source.getPages().map((page) => ({
      url: url(page.url),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...reference.source.getPages().map((page) => ({
      url: url(page.url),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...people.source.getPages().map((page) => ({
      url: url(page.url),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
