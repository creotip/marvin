import { reference } from '@/lib/content';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/reference'>) {
  return (
    <DocsLayout tree={reference.source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
