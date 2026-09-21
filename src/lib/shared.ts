export const appName = 'Marvin';
export const appDescription =
  'A from-scratch tour of AI: symbolic AI to LLMs, gradient descent to attention, training to inference.';

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
);

export const gitConfig = {
  user: 'creotip',
  repo: 'marvin',
  branch: 'main',
};
