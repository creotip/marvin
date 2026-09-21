import type { MetadataRoute } from 'next';
import { docs, reference } from '@/lib/content';
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
  ];
}
