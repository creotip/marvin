# Marvin — agent notes

An AI-education docs site (Next.js + Fumadocs), named after Marvin Minsky. Read [ai-learning-platform-plan.md](ai-learning-platform-plan.md) (stable architecture/goals) and [ROADMAP.md](ROADMAP.md) (living status/backlog) before making content decisions.

## Stack

- **pnpm**, not npm. `pnpm dev` / `pnpm build` / `pnpm test` / `pnpm lint` / `pnpm format` / `pnpm format:check` / `pnpm types:check`.
- Always run `pnpm format && pnpm lint && pnpm test` before committing. Run `pnpm build` too for any change touching routing, components, or content structure (catches MDX/frontmatter errors `dev` sometimes doesn't surface until requested).
- Dev server is hardcoded to port 3000. If `preview_start` reports the port in use, run `lsof -ti:3000 | xargs -r kill -9` first — a stale process from an earlier session is the usual cause.

## Content architecture — three Collections

`docs`, `reference`, and `people` (`src/lib/content.ts`), all built on the same `createCollection` abstraction over `defineDocs`. Adding a new page to any of them is entirely a content change:

- Drop a `.mdx` file in the right `content/<collection>/(group)/` folder (the `(group)` parens are Fumadocs' route-group syntax — organizes the sidebar, invisible in the URL).
- Add its slug to that folder's `meta.json` `pages` array (and add the folder itself to the parent `meta.json` if it's a new group).
- **Nothing else needs registering.** The following all update automatically from the filesystem, with no code change: the sidebar tree, auto-linking (both directions), "Mentioned in" backlinks, `sitemap.xml`, OG images, `llms.mdx`/`llms.txt`, and the [A-Z glossary index](content/reference/a-z.mdx). If you ever catch yourself hardcoding a list of pages somewhere, that's a sign to make it read from `collection.source.getPages()` instead.

## Auto-linking system (`src/lib/remark-reference-links.ts`)

- `collectReferenceTerms(dir, baseUrl)` scans a content directory's frontmatter to build a term list. `docs` and `people` lessons/bios get **both** `remarkReferenceLinks` (auto-linking) and `remarkReferencePreviews` (hover card); `reference` pages get previews only (glossary entries don't auto-link to each other, to avoid a page linking out mid-definition).
- A page's own subject never self-links (matched by filename vs. the term's URL) — this also means a bolded first-mention of a subject in its own bio/page won't accidentally get de-emphasized into a link. Don't reintroduce a special case for this; it's handled generically.
- Only the **first** mention of a term on a page gets linked; repeats after that are left as plain text.
- `titleAliases()` handles `"CNN (Convolutional Neural Network)"`-style titles by generating both halves as separate matchable terms pointing at the same URL.

## Content house style

**Reference glossary entries**: `title` + `description` frontmatter, a bolded-term intro paragraph, `## How it works`, `## When it breaks` (a bulleted list of real failure modes, not generic caveats), `**See also:**`, `**Learn more:**` linking back to the lesson. Look at an existing entry in the same group before writing a new one.

**Lessons**: use the registered MDX components (`src/components/mdx.tsx`) rather than plain prose/tables where they fit — `<Deeper>` for optional math/derivations, `<Misconception>` for "you might think X, but", `<NapkinMath>` for back-of-envelope numbers, `<Steps>` for sequences, `<Mermaid>` for process diagrams, `<Timeline>`/`<TimelineItem>` for chronological content, `<TypeTable>` for comparison tables.

**Widgets** must honestly label their data source in-page: **Live** (real computation), **Precomputed** (hand-crafted illustrative data), or **Simulated** (explicitly not a real measurement). Don't imply a widget measures something real when it doesn't.

## Known gotchas

- **MDX frontmatter YAML**: a `description:` value that *starts* with a `"` is parsed as a quoted scalar and breaks if anything follows the closing quote (e.g. an em dash). Don't open a frontmatter string with a quote mid-sentence — rephrase instead.
- Wikipedia URLs with parentheses in the slug (e.g. `John_McCarthy_(computer_scientist)`) break a plain `[text](url)` markdown link — wrap the URL in `<angle brackets>`.
- `zod` is not a direct dependency; don't reach for a custom Fumadocs page schema unless you've confirmed it's actually needed (it usually isn't — plain `pageSchema`/`metaSchema` covers everything so far).

## Workflow

- Feature branch + PR (via `gh`) for anything content- or code-adjacent. Small docs-only edits to `ai-learning-platform-plan.md`/`ROADMAP.md` alone can be pushed directly to `main` if asked to.
- Verify UI-affecting changes in-browser (`preview_start` + navigate + screenshot/`get_page_text`), not just a successful build — check both a lesson/reference page rendering and, for anything touching MDX/remark, the dev server logs for a build-time MDX error (these don't always throw at `pnpm build`, only at first render of that specific page).
- When a task is scoped as "add to roadmap" rather than "build now," only edit `ROADMAP.md` — don't start implementing.
- After merging a PR, move completed items from `ROADMAP.md`'s "Flagged content" section into "Recently shipped" with the PR link.
