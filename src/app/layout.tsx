import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import { appDescription, appName, siteUrl } from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: appName,
    template: `%s — ${appName}`,
  },
  description: appDescription,
  openGraph: {
    siteName: appName,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
