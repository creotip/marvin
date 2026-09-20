import { referenceSource } from '@/lib/reference-source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/reference'>) {
  return (
    <DocsLayout tree={referenceSource.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
