# Roadmap

Living tracker for what's shipped and what's next. Stable reference material (goals, content outline, architecture, decisions) lives in [ai-learning-platform-plan.md](ai-learning-platform-plan.md); this file is the "what's left to build" view.

**Status: MVP v1 shipped and live on Vercel.** All 16 lessons written, 6 widgets shipped, reference glossary with auto-linking + backlinks shipped.

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
- [ ] Deprioritized: force-directed glossary concept-map graph (no crawlable text, no SEO payoff — revisit after the above)

**Phase 3 — Progress tracking (deferred, localStorage only)** — not started

**Phase 4 — Quizzes (deferred, client-side only)** — not started

**Phase 5 — Polish / v2** (auth, cross-device sync) — not started

---

## Flagged content — not yet built

- **AI Safety & Alignment** lesson — model objectives/alignment, a real gap for "university of AI" scope
- **AI Security** lesson — prompt injection, jailbreaks, adversarial examples, data exfiltration via tool use, red-teaming. Distinct from Safety & Alignment (deployed-system misuse vs. model objectives). Prioritize alongside Safety & Alignment, not after — relevant to the site owner's security background.
- **Multimodal Models** lesson — vision-language and audio models; course currently only covers single-modality
- **"Safety & Security" glossary group** — Prompt Injection, Jailbreak, Adversarial Example, Red Teaming, AI Safety, Alignment (RLHF already exists, cross-links from Alignment)
- **"People" content collection** — third `Collection` (alongside `docs`/`reference`, same abstraction in `src/lib/content.ts`) profiling people who built the field: bio, key contribution, era, cross-links to lessons/glossary terms. Candidates by era:
  - Founding: Turing, McCulloch, Pitts, Shannon, McCarthy, Minsky, Rosenblatt
  - Connectionism's second wave: Rumelhart, Hinton, LeCun, Bengio
  - Modern deep learning / transformers: Sutskever, Vaswani et al., Karpathy, Goodfellow, Fei-Fei Li
  - Current labs / applied AI: Hassabis, Schmidhuber, the Amodei siblings, Andrew Ng
  - Aim for as many as reasonably well-documented — breadth is the point. Retrofit existing History & Landscape prose mentions to link to profile pages once they exist (same pattern as glossary auto-linking).
- **Timeline component for History & Landscape** — replace the current `<Mermaid>` flowchart (generic boxes/arrows, poor fit for chronological content) with a custom vertical timeline (visual pattern inspired by [reui.io's timeline](https://reui.io/components/timeline) — copy-paste source, not an npm dependency). Use for the "Four eras" overview. Reusable later for a People profile's career timeline, or an in-lesson mini-timeline (e.g. GPT-1→2→3→ChatGPT in LLMs).

---

## North star (not immediate scope)

Long-term: grow into a much deeper, broader "university of AI" — more rigorous math, more topics (optimization theory, MLOps, the safety/security/multimodal lessons above), possibly grouped into course-like sections. Approach: deepen existing lessons and add clearly-missing content incrementally, not a big-bang rewrite. Any lesson bundling 3+ independently-searchable topics gets split out (done once already for Applied & Agentic Systems — worth repeating).
