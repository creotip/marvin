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
- [ ] Diffusion denoising visualizer (Generative Models)
- [ ] Embedding similarity search playground (LLMs / RAG)
- [ ] Agent trace stepper (Agents & Tool Use)
- [ ] Batching latency/throughput slider (Inference & Serving)
- [ ] Confusion matrix / ROC curve widget (Evaluation & Benchmarks) — another zero-widget lesson; pairs with the glossary gap there below

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
