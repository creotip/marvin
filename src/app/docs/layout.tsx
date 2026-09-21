import { docs } from '@/lib/content';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={docs.source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
