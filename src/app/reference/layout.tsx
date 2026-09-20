import { referenceSource } from '@/lib/reference-source';
import { GlassLayout } from 'fumadocs-ui/layouts/glass';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/reference'>) {
  return (
    <GlassLayout tree={referenceSource.getPageTree()} {...baseOptions()}>
      {children}
    </GlassLayout>
  );
}
