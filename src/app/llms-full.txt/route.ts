import { collections } from '@/lib/content';

export const revalidate = false;

export async function GET() {
  const sections = await Promise.all(
    collections.map((collection) => collection.llms.full()),
  );

  return new Response(sections.join('\n\n'));
}
