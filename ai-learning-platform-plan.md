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
   - *Widget: gradient descent playground* (drag a starting point on a 2D loss surface, watch it converge)
3. **Probability & Statistics Foundations** — distributions, Bayes' theorem, MLE/MAP — why loss functions look the way they do; added as part of the "broaden the course" push
4. **Neural Networks & Backprop** — from Karpathy's micrograd approach
   - *Widget: tiny neural net you step through forward/backward pass, node by node*
5. **Tooling & The Dev Stack** — languages, frameworks (PyTorch/JAX/TensorFlow), the Hugging Face ecosystem, distributed training, experiment tracking, hardware, deployment tooling — the practitioner layer, added after user feedback that the course had no "how models are actually built" content
6. **Computer Vision** — convolutions, pooling, CNNs, transfer learning
   - *Widget: convolution kernel visualizer (slide a kernel over an image, see the feature map build live)*
7. **Attention & Transformers** — the core architecture
   - *Widget: attention weight visualizer (edit a sentence, see live attention heatmap between tokens)*
8. **Generative Models** — GANs, VAEs, diffusion models — generating new content rather than predicting/classifying
9. **LLMs** — tokenization, embeddings, pretraining vs fine-tuning, RLHF basics
   - *Widget: tokenizer playground (type text, see it split into tokens + token IDs live)*
10. **Reinforcement Learning** — MDPs, policies, value functions, Q-learning, PPO — the actual algorithm family behind RLHF
11. **Inference & Serving** — batching, KV caching, quantization, latency/throughput tradeoffs
    - *Widget: KV-cache vs no-cache latency simulator (toggle and see a simulated speed difference)*
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
| Widget | Data source |
|---|---|
| Gradient descent playground | Live — pure JS math, no libs |
| Backprop stepper | Live — pure JS (micrograd-style scalar autograd, no library) |
| Convolution kernel visualizer | Live — canvas math |
| Tokenizer playground | Live — real tokenizer via `gpt-tokenizer` or `tiktoken` (WASM, client-side, no model) |
| Attention weight visualizer | **Precomputed** — canned attention-weight JSON for a fixed set of example sentences (avoids shipping a real transformer client-side) |
| KV-cache latency simulator | Simulated by design — illustrates the concept, not real hardware timing |

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
- [ ] Deploy to Vercel — needs your Vercel account/login, not done here
- [ ] **This is the MVP.** Ship it here before adding anything below.

**Phase 2 — Widgets (in progress)**
- [x] Gradient descent playground — live, pure SVG/JS, no libs. Click to set a start point, adjustable learning rate, step/run/reset, detects both convergence and divergence. Embedded in [ML Fundamentals](content/docs/(foundations)/ml-fundamentals.mdx)
- [x] Backprop stepper (Neural Networks & Backprop) — SVG computation graph for the lesson's exact `loss = a*b + c` example, step through forward then backward, editable a/b/c
- [x] Convolution kernel visualizer (Computer Vision) — 4 selectable kernels (vertical/horizontal edge, blur, sharpen) sliding over a hollow-square test image, feature map builds live, cell by cell
- [ ] Attention weight visualizer (Attention & Transformers) — precomputed data, see Section 3
- [ ] Tokenizer playground (LLMs)
- [ ] KV-cache latency simulator (Inference & Serving)
- [ ] Slot each into its lesson's MDX as it's ready — content structure from Phase 1 doesn't need to change

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
  export const quiz: QuizQuestion[] = [ /* 3–5 entries */ ];
  ```

---

## 6. Reference Inspirations (for tone/structure, not to copy content from)

- Hugging Face Learn — docs-site structure, sidebar nav
- d2l.ai — chapter structure, code-toggle pattern
- Karpathy's nn-zero-to-hero — pedagogical sequencing (build from scratch, feel the pain, understand)
- Jay Alammar's Illustrated Transformer — visual-first explanation style for the attention widget
