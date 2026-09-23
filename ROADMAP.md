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
- [ ] Bayes' theorem calculator (Probability & Statistics) — **top priority**: fully live, zero-widget lesson
- [ ] Grid-world Q-learning visualizer (Reinforcement Learning) — **top priority**: fully live, zero-widget lesson
- [ ] Diffusion denoising visualizer (Generative Models)
- [ ] Embedding similarity search playground (LLMs / RAG)
- [ ] Agent trace stepper (Agents & Tool Use)
- [ ] Batching latency/throughput slider (Inference & Serving)

See [ai-learning-platform-plan.md §3](ai-learning-platform-plan.md) for the live/precomputed/simulated data-source decision per widget.

**Phase 2.5 — Content quality & SEO**

- [ ] Comparison tables via `TypeTable` (optimizers, vector DBs, tokenization schemes, PyTorch vs. JAX vs. TensorFlow)
- [ ] FAQ-style question subheadings in lessons and glossary "How it works" sections
- [ ] Diagram + caption audit — every diagram paired with restating prose, never standalone
- [ ] Newbie-readability audit — flag jargon introduced without a plain-language anchor
- [ ] **A-Z glossary index page** — one crawlable hub page listing every reference term alphabetically, built from the same `collectReferenceTerms` data the auto-linker already uses. Cheap (no new content to write) and a solid SEO/internal-linking win.
- [ ] Deprioritized: force-directed glossary concept-map graph (no crawlable text, no SEO payoff — revisit after the above)

**Phase 3 — Progress tracking (deferred, localStorage only)** — not started

**Phase 4 — Quizzes (deferred, client-side only)** — not started

**Phase 5 — Polish / v2** (auth, cross-device sync) — not started

---

## Recently shipped

- **People content collection** — third `Collection` (alongside `docs`/`reference`), 22 profiles grouped by era (founding theory, connectionist revival, modern deep learning/transformers, current labs). Auto-links from lesson/glossary prose, "Mentioned in" backlinks. ([PR #11](https://github.com/creotip/marvin/pull/11))
- **History & Landscape timeline** — the "Five eras" overview now uses a custom `<Timeline>`/`<TimelineItem>` component (`src/components/timeline.tsx`, registered in MDX) instead of a `<Mermaid>` flowchart. Reusable for a future People profile career timeline or an in-lesson mini-timeline (e.g. GPT-1→2→3→ChatGPT in LLMs). ([PR #12](https://github.com/creotip/marvin/pull/12))
- **AI Security** lesson (17th lesson, new `(safety)` sidebar section) — prompt injection (direct/indirect), jailbreaks, data exfiltration via tool use, adversarial examples, red-teaming, framed against AI safety/alignment as a distinct problem. New "Safety & Security" reference glossary group with 4 terms (Prompt Injection, Jailbreak, Adversarial Example, Red Teaming), cross-linked from `rag`/`mcp`/`prompt-engineering` reference pages and from Ian Goodfellow's People profile.

## Flagged content — not yet built

- **AI Safety & Alignment** lesson — model objectives/alignment, distinct from AI Security (deployed-system misuse vs. the model's own objectives) — a real gap for "university of AI" scope
- **Multimodal Models** lesson — vision-language and audio models; course currently only covers single-modality
- **Two more "Safety & Security" glossary terms** — AI Safety, Alignment (RLHF already exists and is the natural cross-link) — hold until the Safety & Alignment lesson above is written
- **Interpretability lesson** — mechanistic interpretability, feature attribution, probing. Distinct from both Safety & Alignment and AI Security; ties to the interpretability line already in Dario Amodei's People profile, and it's a heavily-searched term right now.
- **Optimization & Training Dynamics lesson** — Adam, learning-rate schedules, warmup, batch size effects. Deepens ML Fundamentals rather than adding new breadth — currently only covered in passing via a `<Deeper>` dive.
- **Glossary gap-fill: Reinforcement Learning and Generative Models have zero glossary terms**, despite both being full lessons (#10 and #8). Missing and worth adding regardless of any new lesson: MDP, Policy, Q-Learning, Reward, PPO (Reinforcement Learning); GAN, VAE, Diffusion Model (Generative Models). Also missing and mentioned elsewhere already: Mixture of Experts (referenced in Noam Shazeer's People profile) and Knowledge Distillation (natural fit alongside Quantization/Batching/KV-Cache in the inference-and-applied-systems group).

---

## North star (not immediate scope)

Long-term: grow into a much deeper, broader "university of AI" — more rigorous math, more topics (optimization theory, MLOps, the safety/security/multimodal lessons above), possibly grouped into course-like sections. Approach: deepen existing lessons and add clearly-missing content incrementally, not a big-bang rewrite. Any lesson bundling 3+ independently-searchable topics gets split out (done once already for Applied & Agentic Systems — worth repeating).
