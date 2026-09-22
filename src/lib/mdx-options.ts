import type { Pluggable } from 'unified';

type BuildEnvironment = 'bundler' | 'runtime';

/**
 * Applying collection-level MDX options drops Fumadocs' defaults, so the preset
 * has to be re-applied around any extra plugins.
 */
export async function createMdxOptions(
  environment: BuildEnvironment,
  extra: { remarkPlugins?: Pluggable[]; rehypePlugins?: Pluggable[] } = {},
) {
  const { applyMdxPreset } = await import('fumadocs-mdx/config');
  const { default: remarkMath } = await import('remark-math');
  const { default: rehypeKatex } = await import('rehype-katex');

  return applyMdxPreset({
    remarkPlugins: (plugins) => [
      remarkMath,
      ...plugins,
      ...(extra.remarkPlugins ?? []),
    ],
    // KaTeX must run before Fumadocs' syntax highlighter, which would otherwise
    // try to highlight math blocks as a `math` language.
    rehypePlugins: (plugins) => [
      rehypeKatex,
      ...plugins,
      ...(extra.rehypePlugins ?? []),
    ],
  })(environment);
}
