# AI Learning Platform — Build Plan

A self-built, interactive alternative to Karpathy/D2L/HF Learn: docs-style navigation, inline interactive widgets, and post-lesson quizzes. Built on the TypeScript/React/Bun/Hono/Drizzle/Neon stack.

**MVP v1 scope (current focus): a working docs site with good written content — no widgets, no quizzes, no progress tracking.** Those are all deferred to v1.5+ (Section 4). Get the site live with real content first.

---

## 1. Goals

- Docs-site navigation (sidebar, search, versioned lesson URLs) — not a wall of Markdown in a repo
- Lessons cover: history of AI → ML fundamentals → CV → transformers/attention → LLMs → inference/serving
- Each lesson pairs a written explainer with a **live interactive widget**, not a static diagram
- Each lesson ends in a short quiz; results tracked per user
- Content authored in MDX so prose and interactive React components live in the same file

---

## 2. Content Outline (sequence)

1. **History & Landscape** — symbolic AI → expert systems → statistical ML → deep learning → the LLM era
2. **ML Fundamentals** — supervised/unsupervised learning, loss functions, gradient descent
   - _Widget: gradient descent playground_ (drag a starting point on a 2D loss surface, watch it converge)
3. **Probability & Statistics Foundations** — distributions, Bayes' theorem, MLE/MAP — why loss functions look the way they do; added as part of the "broaden the course" push
4. **Neural Networks & Backprop** — from Karpathy's micrograd approach
   - _Widget: tiny neural net you step through forward/backward pass, node by node_
5. **Tooling & The Dev Stack** — languages, frameworks (PyTorch/JAX/TensorFlow), the Hugging Face ecosystem, distributed training, experiment tracking, hardware, deployment tooling — the practitioner layer, added after user feedback that the course had no "how models are actually built" content
6. **Computer Vision** — convolutions, pooling, CNNs, transfer learning
   - _Widget: convolution kernel visualizer (slide a kernel over an image, see the feature map build live)_
7. **Attention & Transformers** — the core architecture
   - _Widget: attention weight visualizer (edit a sentence, see live attention heatmap between tokens)_
8. **Generative Models** — GANs, VAEs, diffusion models — generating new content rather than predicting/classifying
9. **LLMs** — tokenization, embeddings, pretraining vs fine-tuning, RLHF basics
   - _Widget: tokenizer playground (type text, see it split into tokens + token IDs live)_
10. **Reinforcement Learning** — MDPs, policies, value functions, Q-learning, PPO — the actual algorithm family behind RLHF
11. **Inference & Serving** — batching, KV caching, quantization, latency/throughput tradeoffs
    - _Widget: KV-cache vs no-cache latency simulator (toggle and see a simulated speed difference)_
12. **Evaluation & Benchmarks** — MMLU/HumanEval-style suites, LLM-as-judge, why benchmark scores can mislead
13. **Applied / Agentic Systems** — RAG, tool use, agents (tie-in to your own PrimeSec domain if useful)

**North star (not immediate scope):** the long-term ambition is for this to grow into a much deeper, broader "university of AI" — more rigorous math, more topics (optimization theory, MLOps, safety/alignment), possibly grouped into course-like sections instead of one flat list. Approach: deepen existing lessons and add clearly-missing content (tooling, probability, RL, generative models, evaluation — all added so far) incrementally, rather than a big-bang rewrite. Revisit information architecture (flat list vs. grouped sections) once the flat sidebar (13 lessons now) stops working — worth reconsidering soon.

Each topic = one lesson page (MDX route). Widgets and quizzes listed above are deferred past MVP v1 — write the lessons as strong prose (with static diagrams/code where useful) first; widgets get slotted in later without changing the content structure.

---

## 3. Architecture

**Frontend**

- Next.js (App Router) + **Fumadocs** for docs-site scaffolding (sidebar nav, search, MDX pipeline out of the box) + shadcn/ui for components
- Lessons are `.mdx` files with embedded interactive components (`<AttentionDemo />`, `<GradientDescentPlayground />`, etc.)
- Client-side progress indicator (checkmarks per completed lesson/quiz)

**Widgets — live vs. simulated (decided per widget, not deferred)**

| Widget                        | Data source                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Gradient descent playground   | Live — pure JS math, no libs                                                                                                         |
| Backprop stepper              | Live — pure JS (micrograd-style scalar autograd, no library)                                                                         |
| Convolution kernel visualizer | Live — canvas math                                                                                                                   |
| Tokenizer playground          | Live — real tokenizer via `gpt-tokenizer` or `tiktoken` (WASM, client-side, no model)                                                |
| Attention weight visualizer   | **Precomputed** — canned attention-weight JSON for a fixed set of example sentences (avoids shipping a real transformer client-side) |
| KV-cache latency simulator    | Simulated by design — illustrates the concept, not real hardware timing                                                              |
| Bayes' theorem calculator     | Live — pure JS. Prior/likelihood sliders update the posterior in real time (bar chart), classic medical-test framing from the Probability & Statistics callout |
| Grid-world Q-learning visualizer | Live — pure JS tabular Q-learning on a small (e.g. 5×5) grid. Click "train," watch the policy arrows converge episode by episode — the classic RL demo, cheap to actually run client-side |
| Diffusion denoising visualizer | Live — procedural noise add/remove on a small pixel grid (reuse the convolution visualizer's hollow-square test image). Forward process animates noise in; a synthetic reverse process animates it back out |
| Embedding similarity search playground | **Precomputed** — a handful of example sentences with hand-set 2D projected embedding coordinates, plotted on a plane; typing/selecting a query highlights nearest neighbors by cosine similarity. Same honesty pattern as the attention visualizer — illustrative, not a live embedding model |
| Agent trace stepper           | **Precomputed** — pick a goal from a dropdown, step through a scripted Thought → Tool call → Observation → ... → Final answer trace, revealed one step at a time (same spirit as the backprop stepper, for the agent loop instead) |
| Batching latency/throughput slider | Simulated by design — adjust batch size, watch simulated per-request latency rise and total throughput rise together, visualizing the tradeoff Inference & Serving describes in prose |

Priority order if picked up: Bayes' calculator and the Q-learning grid are the strongest next additions (both fully live, no precomputed-data caveat needed, and land on lessons — Probability & Stats, Reinforcement Learning — that currently have zero widgets).

**Backend (v1: none needed)**

- No server-side API required for v1 — lessons are static MDX, quizzes are static question sets bundled with each lesson, and progress lives entirely client-side
- Bun + Hono only comes into play in v2, if/when progress needs to persist across devices

**Storage — v1: localStorage only**

- Progress and quiz results stored client-side, keyed by lesson slug, e.g.:
  ```json
  {
    "gradient-descent": { "completed": true, "quizScore": 4, "quizTotal": 5 },
    "attention-transformers": { "completed": false }
  }
  ```
- No accounts, no auth, no DB — ships as a static site
- Tradeoff to accept: progress resets if localStorage is cleared or the user switches browsers/devices — fine for v1, revisit if that friction actually shows up

**Database (Neon Postgres + Drizzle) — deferred to v2**
Only build this once localStorage-only progress proves insufficient (e.g. you want cross-device sync). Sketch for later:

- `lessons` (slug, title, section, order) — optional if lessons stay file-based
- `quiz_questions` (id, lesson_slug, question, options[], correct_index, explanation)
- `quiz_attempts` (id, user_id, lesson_slug, question_id, selected_index, correct, attempted_at)
- `lesson_progress` (user_id, lesson_slug, completed_at)

**Deployment**

- Vercel for frontend (matches your existing pattern) or Bun app on Digital Ocean/AWS depending on where the Hono API lives

---

## 4. Build Order (phased)

**Phase 1 — MVP v1: working site, full content, no widgets/quizzes**

- [x] Set up Next.js + Fumadocs (sidebar, search, MDX routing come from Fumadocs — search is free here, not a separate later task)
- [x] Write all 8 lessons from Section 2 as solid MDX prose (static code snippets/diagrams where they help — no interactive components yet)
- [x] Basic docs-site layout (left nav, main content, optional right TOC) — Fumadocs defaults, verified in-browser
- [x] Mobile responsiveness pass — verified at 375px, sidebar collapses correctly
- [x] Deploy to Vercel — done
- [x] **MVP shipped.**

**Phase 2 — Widgets (in progress)**

- [x] Gradient descent playground — live, pure SVG/JS, no libs. Click to set a start point, adjustable learning rate, step/run/reset, detects both convergence and divergence. Embedded in [ML Fundamentals](<content/docs/(foundations)/ml-fundamentals.mdx>)
- [x] Backprop stepper (Neural Networks & Backprop) — SVG computation graph for the lesson's exact `loss = a*b + c` example, step through forward then backward, editable a/b/c
- [x] Convolution kernel visualizer (Computer Vision) — 4 selectable kernels (vertical/horizontal edge, blur, sharpen) sliding over a hollow-square test image, feature map builds live, cell by cell
- [x] Attention weight visualizer (Attention & Transformers) — 3 hand-crafted example sentences (the lesson's own trophy/suitcase coreference example, a second coreference example, and a subject-verb agreement long-range example), click a token to see its full attention row as a bar chart
- [x] Tokenizer playground (LLMs) — live, real BPE tokenizer via the `gpt-tokenizer` package (cl100k_base), fully client-side, editable text input
- [x] KV-cache latency simulator (Inference & Serving) — simulated (not measured) per-token cost bars, quadratic without cache vs. linear with cache, live speedup readout
- [x] All 6 planned widgets shipped. Slotted directly into each lesson's MDX — content structure from Phase 1 didn't need to change, as planned.
- [ ] 6 more candidates identified, not yet built — see the widget table above. Priority: Bayes' theorem calculator, grid-world Q-learning visualizer (both fully live, both land on lessons with zero widgets today).

**Phase 2.5 — Content quality & SEO (new)**

Prioritized by combined pedagogy + SEO value, not effort:

- [ ] **Comparison tables** via the `TypeTable` component (already registered in `getMDXComponents`, currently unused) — optimizers, vector DBs (Pinecone/Weaviate/Milvus/Qdrant/Chroma/pgvector), tokenization schemes, PyTorch vs. JAX vs. TensorFlow. Comparison-intent search queries are exactly what these tables answer, and Google favors tables for those featured snippets.
- [ ] **FAQ-style, question-phrased subheadings** sprinkled into lessons and glossary "How it works" sections (e.g. "Why does attention need multiple heads?") — the single most direct SEO lever available: this is what "People Also Ask" boxes and snippet answers are built from.
- [ ] **Diagrams always paired with a caption/restating sentence**, never standalone — an SVG/Mermaid diagram has no crawlable text, so a diagram that *replaces* prose instead of *accompanying* it is invisible to search engines. Audit existing diagrams for this; enforce it going forward.
- [ ] **Newbie-readability audit** — read each lesson's baseline text (not the deep-dive expansions) as someone with zero ML background, flag jargon introduced without a plain-language anchor first. Indirect SEO benefit (bounce rate, dwell time) but the bigger reason: beginners and experts search with different vocabulary ("what is attention in AI" vs. "self-attention mechanism"), and a page that naturally answers both captures more long-tail traffic.
- [ ] Explicitly deprioritized for now: a force-directed concept-map graph of the glossary (auto-generated from the existing "See also" cross-links). Genuinely fun, real UX-delight value — but it's client-side JS with zero crawlable text, so no direct SEO payoff. Revisit after the items above.

**Phase 3 — Progress tracking (deferred, localStorage only)**

- [ ] Define localStorage schema (see Section 3) and a small typed helper module to read/write it
- [ ] Sidebar/lesson-list checkmarks reflect localStorage state
- [ ] No backend work in this phase

**Phase 4 — Quizzes (deferred, client-side only)**

- [ ] Quiz questions authored as static data alongside each lesson's MDX (`.quiz.ts` per lesson, format in Section 5)
- [ ] Quiz React component (MCQ, immediate feedback, explanation on wrong answer)
- [ ] Score written to localStorage on completion — no attempt history/backend needed yet
- [ ] Optional later (v2, needs DB): resurface previously-missed questions via spaced repetition

**Phase 5 — Polish / v2**

- [ ] Optional: auth accounts, streaks, completion badges, cross-device progress sync (Bun/Hono/Drizzle/Neon, per Section 3)

---

## 5. Open Decisions (resolve before/while building in Claude Code)

- **Framework**: decided — Next.js (App Router) + Fumadocs + shadcn/ui. Fumadocs over Nextra/Vocs: Next.js-native, MDX/sidebar/search out of the box, pairs naturally with shadcn; Vocs is Vite-only (conflicts with Next.js), Nextra's App Router support is clunkier.
- **File-based vs DB-based lesson content**: file-based (MDX in repo) for lesson prose. Quiz questions are also file-based for v1 (co-located with each lesson) — no DB at all in v1.
- **Auth**: skip entirely for v1 — no accounts. Revisit only once cross-device progress sync is an actual pain point, at which point Bun/Hono/Drizzle/Neon come in together (auth + DB + progress API as one v2 unit, not piecemeal).
- **Quiz question format** (`.quiz.ts`, co-located per lesson):
  ```ts
  export type QuizQuestion = {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string; // shown on wrong answer
  };
  export const quiz: QuizQuestion[] = [/* 3–5 entries */];
  ```

---

## 6. Reference Inspirations (for tone/structure, not to copy content from)

- Hugging Face Learn — docs-site structure, sidebar nav
- d2l.ai — chapter structure, code-toggle pattern
- Karpathy's nn-zero-to-hero — pedagogical sequencing (build from scratch, feel the pain, understand)
- Jay Alammar's Illustrated Transformer — visual-first explanation style for the attention widget
