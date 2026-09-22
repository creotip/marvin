import { people } from '@/lib/content';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/people'>) {
  return (
    <DocsLayout tree={people.source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
