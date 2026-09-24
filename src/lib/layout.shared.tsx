import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { TopNavTabs } from '@/components/top-nav-tabs';
import { Wordmark } from '@/components/wordmark';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Wordmark />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        type: 'custom',
        children: <TopNavTabs />,
      },
      {
        text: 'FAQ',
        url: '/faq',
        active: 'url',
      },
    ],
  };
}
