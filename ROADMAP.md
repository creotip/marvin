# Roadmap

Living tracker for what's shipped and what's next. Stable reference material (goals, content outline, architecture, decisions) lives in [ai-learning-platform-plan.md](ai-learning-platform-plan.md); this file is the "what's left to build" view.

**Status: MVP v1 shipped and live on Vercel.** All 17 lessons written, 6 widgets shipped, reference glossary with auto-linking + backlinks shipped.

---

## Build order (phased)

**Phase 1 — MVP v1: working site, full content, no widgets/quizzes** ✅ done

**Phase 2 — Widgets**

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
- [ ] Batching latency/throughput slider (Inference & Serving)
- [x] Confusion matrix / ROC curve widget (Evaluation & Benchmarks)

See [ai-learning-platform-plan.md §3](ai-learning-platform-plan.md) for the live/precomputed/simulated data-source decision per widget.

**Phase 2.5 — Content quality & SEO**

- [ ] Comparison tables via `TypeTable` (optimizers, vector DBs, tokenization schemes, PyTorch vs. JAX vs. TensorFlow)
- [ ] FAQ-style question subheadings in lessons and glossary "How it works" sections
- [ ] Diagram + caption audit — every diagram paired with restating prose, never standalone
- [ ] Newbie-readability audit — flag jargon introduced without a plain-language anchor
- [ ] **FAQ hub page** — a dedicated `/faq` page for cross-lesson beginner questions that don't map to one specific lesson ("is RAG the same as fine-tuning?", "do I need calculus for this?"). Distinct from the inline FAQ subheadings above — a landing page, not per-lesson headers — targeting "People Also Ask"-style queries.
- [ ] Deprioritized: force-directed glossary concept-map graph (no crawlable text, no SEO payoff — revisit after the above)

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

## Flagged content — not yet built

- **AI Safety & Alignment** lesson — model objectives/alignment, distinct from AI Security (deployed-system misuse vs. the model's own objectives) — a real gap for "university of AI" scope
- **Multimodal Models** lesson — vision-language and audio models; course currently only covers single-modality
- **Two more "Safety & Security" glossary terms** — AI Safety, Alignment (RLHF already exists and is the natural cross-link) — hold until the Safety & Alignment lesson above is written
- **Interpretability lesson** — mechanistic interpretability, feature attribution, probing. Distinct from both Safety & Alignment and AI Security; ties to the interpretability line already in Dario Amodei's People profile, and it's a heavily-searched term right now.
- **Optimization & Training Dynamics lesson** — Adam, learning-rate schedules, warmup, batch size effects. Deepens ML Fundamentals rather than adding new breadth — currently only covered in passing via a `<Deeper>` dive.
- **Case-study narrative content** — a new content type distinct from lesson/glossary/person: 1-2 worked narratives (e.g. "How ChatGPT Was Actually Built," tying pretraining → RLHF → inference → security together, or "Anatomy of a Production RAG System") that read as a story rather than a topic-by-topic lesson. Bridges the drier per-topic lessons with something advanced readers specifically search for. Higher effort and more editorial judgment on scope than the other items here — revisit after the cheaper wins above.

---

## North star (not immediate scope)

Long-term: grow into a much deeper, broader "university of AI" — more rigorous math, more topics (optimization theory, MLOps, the safety/security/multimodal lessons above), possibly grouped into course-like sections. Approach: deepen existing lessons and add clearly-missing content incrementally, not a big-bang rewrite. Any lesson bundling 3+ independently-searchable topics gets split out (done once already for Applied & Agentic Systems — worth repeating).
