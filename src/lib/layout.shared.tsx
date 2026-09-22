import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Reference',
        url: '/reference',
        active: 'nested-url',
      },
      {
        text: 'People',
        url: '/people',
        active: 'nested-url',
      },
    ],
  };
}
