# Roadmap

Living tracker for what's shipped and what's next. Stable reference material (goals, content outline, architecture, decisions) lives in [ai-learning-platform-plan.md](ai-learning-platform-plan.md); this file is the "what's left to build" view.

**Status: MVP v1 shipped and live on Vercel.** 22 lessons written (including a new "Case Studies" section), 13 widgets shipped (every lesson has at least one), 87 reference glossary terms with auto-linking + backlinks, People collection (22 profiles), FAQ hub page, and a full homepage/theme redesign. The Phase 2.5 "Flagged content" backlog is fully cleared.

---

## Build order (phased)

**Phase 1 — MVP v1: working site, full content, no widgets/quizzes** ✅ done

**Phase 2 — Widgets** ✅ done — every lesson now has at least one widget

- [x] Gradient descent playground (ML Fundamentals)
- [x] Backprop stepper (Neural Networks & Backprop)
- [x] Convolution kernel visualizer (Computer Vision)
- [x] Attention weight visualizer (Attention & Transformers)
- [x] Tokenizer playground (LLMs)
- [x] KV-cache latency simulator (Inference & Serving)
- [x] Bayes' theorem calculator (Probability & Statistics)
- [x] Grid-world Q-learning visualizer (Reinforcement Learning)
- [x] Diffusion denoising visualizer (Generative Models)
- [x] Embedding similarity search playground (LLMs / RAG)
- [x] Agent trace stepper (Agents & Tool Use)
- [x] Batching latency/throughput slider (Inference & Serving)
- [x] Confusion matrix / ROC curve widget (Evaluation & Benchmarks)

See [ai-learning-platform-plan.md §3](ai-learning-platform-plan.md) for the live/precomputed/simulated data-source decision per widget.

**Phase 2.5 — Content quality & SEO**

- [x] **Comparison tables** — optimizers (Optimization & Training Dynamics), vector DBs (RAG & Vector Databases), tokenization schemes (LLMs), PyTorch vs. JAX vs. TensorFlow (Tooling & The Dev Stack). Plain GFM markdown tables, not `TypeTable` — that component is a collapsible Prop/Type/Default API-docs widget (see `node_modules/fumadocs-ui/dist/components/type-table.js`), the wrong shape for a scannable side-by-side content comparison.
- [ ] FAQ-style question subheadings in lessons and glossary "How it works" sections
- [x] **Diagram + caption audit** — surveyed all 15 `<Mermaid>`/`<Timeline>` diagrams across 14 lessons. 13 were already well-paired (an intro sentence plus either a restating follow-up paragraph or a `<Steps>` walkthrough). Fixed the 2 that had only a generic intro and jumped straight to the next heading: Applied & Agentic Systems' agent loop diagram, and Computer Vision's pipeline diagram — both now have a one-sentence restatement connecting the diagram's boxes to prose.
- [ ] Newbie-readability audit — flag jargon introduced without a plain-language anchor
- [x] **FAQ hub page** — a dedicated `/faq` page for cross-lesson beginner questions that don't map to one specific lesson ("is RAG the same as fine-tuning?", "do I need calculus for this?"). Distinct from the inline FAQ subheadings above — a landing page, not per-lesson headers — targeting "People Also Ask"-style queries.
- [x] **Structured data beyond the FAQ page** — `Article` on lesson pages, `DefinedTerm` on glossary entries, `Person` on People profiles, `BreadcrumbList` on all three, `WebSite`/`Organization` on the homepage. `src/lib/json-ld.ts`.
- [x] **Favicon and app icons** — `src/app/icon.tsx` (32×32) and `apple-icon.tsx` (180×180), a "resolving dots" mark rendered via `next/og`'s `ImageResponse`.
- [x] **Wordmark** — `src/components/wordmark.tsx`, "Open" in the default foreground color and "Decode" in the brand accent, wired into the shared nav title.
- [x] **OG images in brand colors** — `src/app/og/[collection]/[...slug]/route.tsx` now passes the two-tone wordmark and dots mark to fumadocs' `generateOGImage()` via its `site`/`icon`/`primaryColor`/`primaryTextColor` props, plus the accent color on the border/dashed rule.
- [ ] Deprioritized: force-directed glossary concept-map graph (no crawlable text, no SEO payoff — revisit after the above)

> **Outstanding follow-up on the site name (OpenDecode):** the domain (`opendecode.dev`, optionally `.ai`/`.org` as redirects) still needs to be registered, `NEXT_PUBLIC_SITE_URL`/Vercel's production domain pointed at it, and the GitHub repo renamed to match. `src/lib/shared.ts`'s `gitConfig.repo` still points at the pre-rename repo name on purpose until that repo rename actually happens.

**Phase 3 — Progress tracking (deferred, localStorage only)** — not started

**Phase 4 — Quizzes (deferred, client-side only)** — not started

**Phase 5 — Polish / v2** (auth, cross-device sync) — not started

---

## Recently shipped

- **People content collection** — third `Collection` (alongside `docs`/`reference`), 22 profiles grouped by era (founding theory, connectionist revival, modern deep learning/transformers, current labs). Auto-links from lesson/glossary prose, "Mentioned in" backlinks. ([PR #11](https://github.com/creotip/marvin/pull/11))
- **History & Landscape timeline** — the "Five eras" overview now uses a custom `<Timeline>`/`<TimelineItem>` component (`src/components/timeline.tsx`, registered in MDX) instead of a `<Mermaid>` flowchart. Reusable for a future People profile career timeline or an in-lesson mini-timeline (e.g. GPT-1→2→3→ChatGPT in LLMs). ([PR #12](https://github.com/creotip/marvin/pull/12))
- **AI Security** lesson (17th lesson, new `(safety)` sidebar section) — prompt injection (direct/indirect), jailbreaks, data exfiltration via tool use, adversarial examples, red-teaming, framed against AI safety/alignment as a distinct problem. New "Safety & Security" reference glossary group with 4 terms (Prompt Injection, Jailbreak, Adversarial Example, Red Teaming), cross-linked from `rag`/`mcp`/`prompt-engineering` reference pages and from Ian Goodfellow's People profile.
- **Glossary gap-fill** — closed the zero-term gap on 4 lessons: Reinforcement Learning (MDP, Policy, Q-Learning, Reward, PPO), Generative Models (GAN, VAE, Diffusion Model), Probability & Statistics Foundations (Bayes' Theorem, MLE, MAP, Probability Distribution), Evaluation & Benchmarks (Benchmark, LLM-as-Judge). Also added Mixture of Experts (transformers-and-llms group) and Knowledge Distillation (inference-and-applied-systems group). All auto-link from their lessons; Ian Goodfellow's and Noam Shazeer's People profiles now auto-link to GAN and Mixture of Experts respectively with no manual edits needed.
- **A-Z glossary index page** — `/reference/a-z`, a single crawlable page listing every reference term alphabetically with a letter-jump nav, built from `reference.source.getPages()` (no new content, reused existing page data). Linked from the reference introduction page.
- **Bayes' theorem calculator widget** (`src/components/widgets/bayes-calculator.tsx`) — live, pure-JS, no data-honesty caveats. Prior/sensitivity/false-positive-rate sliders (prior on a log scale, 0.01%–50%) update a prior-vs-posterior bar chart and a natural-frequency breakdown in real time; three presets including the lesson's own rare-disease example. Embedded in Probability & Statistics Foundations right after the matching NapkinMath callout. ([PR #16](https://github.com/creotip/marvin/pull/16))
- **Grid-world Q-learning visualizer widget** (`src/components/widgets/q-learning-grid.tsx`) — live tabular Q-learning trained in the browser, 5×5 grid with a goal and a trap, epsilon-greedy with decay, ε-greedy policy shown as arrows over a Q-value heatmap. "Train ×50" fast-forwards episodes; "Watch agent" animates a greedy rollout of the current policy. Closes the last zero-widget lesson (Reinforcement Learning) alongside the Bayes calculator closing Probability & Statistics.
- **Confusion matrix / ROC curve widget** (`src/components/widgets/confusion-matrix-roc.tsx`) — live, computed from a fixed seeded-synthetic set of 300 scored examples (not a real dataset, but the confusion matrix/precision/recall/F1/ROC/AUC math on them is all real). A threshold slider drives a live 2×2 confusion matrix (color-coded like the Q-learning grid), precision/recall/F1, and a marker sliding along a precomputed ROC curve. Embedded in Evaluation & Benchmarks right after the precision/recall/F1 Deeper dive — the last of the two "top priority" zero-widget-lesson pairs originally flagged.
- **Diffusion denoising visualizer widget** (`src/components/widgets/diffusion-visualizer.tsx`) — forward direction is genuinely live: a slider runs the lesson's own closed-form equation (`x_t = √ᾱ_t·x0 + √(1-ᾱ_t)·ε`, cosine noise schedule, one fixed noise draw) on the convolution visualizer's hollow-square test image, at any step t. Reverse direction is explicitly labeled simulated — no trained denoising network runs in the browser, so it replays the same known frames backward, with an in-widget caption saying so plainly.
- **Embedding similarity search playground widget** (`src/components/widgets/embedding-playground.tsx`) — precomputed, same honesty pattern as the attention visualizer: 15 hand-placed words across 5 wedges (Animals/Code/Fruit/Emotion + a "Direction" pair) on a 2D plane. Clicking a word makes it the query and ranks every other word by real, live-computed cosine similarity, with a similarity-threshold (not fixed top-N) highlight so only genuine matches get a connecting line. Includes one deliberately counterintuitive pair — "to Paris" / "from Paris" score ≈1.00 despite opposite meanings, with an in-widget callout explaining the real blind spot this demonstrates (dense embeddings compress out negation/direction far more than topic). Went through 3 review rounds after initial ship: caught and fixed a hydration mismatch from unrounded `Math.cos`/`Math.sin` output, overlapping SVG labels on the near-identical Paris dots, wedge gaps too narrow (an unrelated cross-category item scored a deceptively-not-low 0.72), and finally — since 5 categories sharing one 2D circle can never fully eliminate _some_ neighbor being nearest — added an explicit "layout noise" divider and muted styling in the ranked list so non-matches read as background noise, not a ranked continuation. Embedded in RAG & Vector Databases right where cosine similarity is explained.
- **Agent trace stepper widget** (`src/components/widgets/agent-trace-stepper.tsx`) — precomputed, same honesty pattern as the attention visualizer: 3 hand-scripted Thought → Tool call → Observation → ... → Final answer traces (a 2-tool-call weather comparison, a 0-tool direct-math answer, and a tool-call-with-no-results case showing the agent admit it couldn't find something rather than guess), each revealed step-by-step via Run/Step/Reset controls. Embedded in Agents & Tool Use right after the agent-loop `<Steps>` walkthrough, making the abstract loop concrete.
- **Batching latency/throughput slider widget** (`src/components/widgets/batching-slider.tsx`) — simulated by design, reproducing the lesson's own Misconception callout: per-step decode time stays flat while bandwidth-bound, then breaks upward once the batch is large enough to be compute-bound, while latency (queue + step) climbs the whole way, mostly from queueing rather than compute. Throughput correctly plateaus at the same value once compute-bound is reached, whichever batch size you're at. Closes the last unwidgeted lesson — **every lesson now has at least one widget.**
- **Homepage and site-wide design overhaul** — replaced the default Catppuccin purple preset with a warm near-black/burnt-orange theme defined entirely through fumadocs' `--color-fd-*` tokens (every widget re-colors automatically since none reference raw hex), added Plus Jakarta Sans for headings alongside Inter, and a GitHub nav icon via the built-in `githubUrl` prop. Rebuilt the homepage with a hero, live-computed stats grid, and a Docs/Reference/People explore section. Replaced the plain top-nav links with a segmented pill-tab control (`src/components/top-nav-tabs.tsx`), and switched `/docs`, `/reference`, `/people` from fumadocs' sidebar-first `docs` layout to the `notebook` layout (`nav.mode: 'top'`) so that control renders in a persistent full-width top header on every page instead of being buried in the sidebar — matching the OpenPost/MrScraper/Supastarter reference sites. Also fixed a Mermaid crash (`getComputedStyle` serializing the new `oklch()` tokens back out as `lab(...)`, which Mermaid's color library can't parse) by resolving colors through a canvas instead. ([PR #26](https://github.com/creotip/marvin/pull/26))
- **FAQ hub page** (`/faq`) — 16 cross-lesson beginner questions across 5 categories (Getting started, Concepts people mix up, Safety & security, Practical & tooling, About this site), rendered as accordions. Content lives in `src/lib/faq-data.ts` as plain strings with `[label](/url)` markdown-style links, rendered via a small helper (`src/components/faq-answer.tsx`) that also strips them to plain text for a `FAQPage` JSON-LD schema. Linked from the homepage, the reference introduction page, and the persistent top nav; added to `sitemap.xml`. ([PR #27](https://github.com/creotip/marvin/pull/27))
- **AI Safety & Alignment** lesson (18th lesson) — the other half of the safety/security split AI Security already draws: whether a model's own objectives match what we want, independent of any attacker. Covers specification gaming, outer vs. inner alignment/goal misgeneralization, why RLHF inherits rather than solves the problem (reward hacking against the reward model, sycophancy), scalable oversight (debate, weak-to-strong generalization, recursive reward modeling), and a brief interpretability pointer. Adds 2 new "Safety & Security" glossary terms (AI Safety, Alignment); AI Security and Dario Amodei's People profile now cross-link to it. ([PR #29](https://github.com/creotip/marvin/pull/29))
- **Optimization & Training Dynamics, Multimodal Models, Interpretability lessons, and the first Case Study** — cleared the whole "Flagged content" backlog in one PR. Optimization & Training Dynamics deepens ML Fundamentals' brief mention (Adam's mechanics, warmup, LR schedules, batch-size tradeoffs). Multimodal Models covers CLIP's shared embedding space and how vision gets fed into an LLM as tokens (new term: CLIP). Interpretability is the deep dive AI Safety & Alignment's closing section pointed at — probing, superposition, sparse autoencoders, circuits (new terms: Interpretability, Sparse Autoencoder). "How ChatGPT Was Actually Built" is the first instance of a new "Case Studies" content type, tying pretraining → alignment → inference → security into one narrative. ([PR #30](https://github.com/creotip/marvin/pull/30))
- **Homepage stats off-by-one fix** — the stats tiles were counting each collection's own intro page (and the reference collection's A-Z index page) as content, showing 23 lessons / 88 glossary terms instead of the real 22 / 87. Caught from a screenshot, not a bug report. ([PR #31](https://github.com/creotip/marvin/pull/31))

## Flagged content — not yet built

Empty — everything flagged as of the last pass has shipped. See "North star" below for where new items would come from.

---

## North star (not immediate scope)

Long-term: grow into a much deeper, broader "university of AI" — more rigorous math, more topics (optimization theory, MLOps, the safety/security/multimodal lessons above), possibly grouped into course-like sections. Approach: deepen existing lessons and add clearly-missing content incrementally, not a big-bang rewrite. Any lesson bundling 3+ independently-searchable topics gets split out (done once already for Applied & Agentic Systems — worth repeating).
