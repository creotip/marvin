export const appName = 'OpenDecode';
export const appDescription =
  'A from-scratch tour of AI: symbolic AI to LLMs, gradient descent to attention, training to inference.';

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
);

// `repo` still matches the actual GitHub repo name (creotip/marvin) — update
// this if/when that repo itself gets renamed to match the new site name.
export const gitConfig = {
  user: 'creotip',
  repo: 'marvin',
  branch: 'main',
};
