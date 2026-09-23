import { reference } from '@/lib/content';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/reference'>) {
  const options = baseOptions();

  return (
    <DocsLayout
      tree={reference.source.getPageTree()}
      {...options}
      nav={{ ...options.nav, mode: 'top' }}
    >
      {children}
    </DocsLayout>
  );
}
