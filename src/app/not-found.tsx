import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col justify-center items-center text-center flex-1 gap-4 px-4">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="max-w-lg text-fd-muted-foreground">
          That page doesn&apos;t exist. It may have been renamed or moved.
        </p>
        <div className="flex gap-4">
          <Link href="/docs" className="font-medium underline underline-offset-4">
            Lessons
          </Link>
          <Link
            href="/reference"
            className="font-medium underline underline-offset-4"
          >
            Reference
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}
