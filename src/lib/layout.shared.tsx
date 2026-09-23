import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { TopNavTabs } from '@/components/top-nav-tabs';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        type: 'custom',
        children: <TopNavTabs />,
      },
    ],
  };
}
