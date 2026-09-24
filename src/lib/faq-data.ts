export interface FaqItem {
  id: string;
  question: string;
  /**
   * Plain text with `[label](/url)` markdown-style links — kept as one
   * string so the same content can render as JSX (`renderFaqAnswer`) and
   * feed the FAQPage JSON-LD schema as plain text (`stripFaqLinks`).
   */
  answer: string;
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Getting started',
    items: [
      {
        id: 'need-to-code',
        question: 'Do I need to know how to code to follow this course?',
        answer:
          'No — the lessons build intuition in plain language before any math or code. Some later lessons, like [Tooling & The Dev Stack](/docs/tooling-and-the-dev-stack), do walk through real code, but you can read the whole course for understanding without writing any of it yourself.',
      },
      {
        id: 'need-math',
        question: 'Do I need calculus or linear algebra?',
        answer:
          'Not for the main text — the core explanations stay in plain language and analogies. If you want the underlying math, look for the Deeper callouts inside each lesson (for example in [ML Fundamentals](/docs/ml-fundamentals)) — they hold the derivations and are always optional.',
      },
      {
        id: 'reading-order',
        question: 'What order should I read the lessons in?',
        answer:
          'Start with [History & Landscape](/docs/history-and-landscape) for context, then follow the sidebar top to bottom — later lessons build on earlier ones (for example [Attention & Transformers](/docs/attention-and-transformers) assumes [Neural Networks & Backprop](/docs/neural-networks-and-backprop)). Each lesson also links out to the specific terms and lessons it depends on.',
      },
      {
        id: 'how-long',
        question: 'How long does this course take to get through?',
        answer:
          "It depends how deep you go — reading every lesson straight through is a few focused hours, but working through the interactive widgets and Deeper math dives can stretch it into a multi-week project. There's no set pace; it's built to read like documentation, not a timed class.",
      },
    ],
  },
  {
    title: 'Concepts people mix up',
    items: [
      {
        id: 'rag-vs-fine-tuning',
        question: 'Is RAG the same as fine-tuning?',
        answer:
          "No — [RAG](/reference/rag) retrieves relevant documents at query time and hands them to the model as context, while [fine-tuning](/reference/fine-tuning) permanently updates the model's own weights on new examples. RAG changes what the model sees; fine-tuning changes the model itself. See [RAG & Vector Databases](/docs/rag-and-vector-databases) for the full comparison.",
      },
      {
        id: 'ai-vs-ml-vs-dl',
        question:
          "What's the difference between AI, machine learning, and deep learning?",
        answer:
          "They're nested, not interchangeable: AI is the broad goal of building systems that behave intelligently, [machine learning](/reference/machine-learning) is the subset that learns from data rather than hand-written rules, and [deep learning](/reference/deep-learning) is the subset of machine learning built on neural networks specifically. [History & Landscape](/docs/history-and-landscape) walks through how the field narrowed from one to the next.",
      },
      {
        id: 'training-vs-inference',
        question: "What's the difference between training and inference?",
        answer:
          "Training is the — expensive, usually one-time — process of adjusting a model's weights on data. [Inference](/reference/inference) is running the already-trained model on new input to get an output, which is what happens every time you send a chatbot a message. Training happens occasionally; inference happens on every single request.",
      },
      {
        id: 'parameters-vs-weights',
        question: 'Are "parameters" and "weights" the same thing?',
        answer:
          'Almost — weights are the individual learned numbers inside a model, and "parameters" is the umbrella term for all of them (weights plus biases). When a model is described as "70 billion parameters," that count includes every learned number, not only the ones technically labeled weights.',
      },
      {
        id: 'chatbot-vs-llm',
        question: "What's the difference between a chatbot and an LLM?",
        answer:
          "An [LLM](/reference/llm) is the underlying model — a next-token predictor trained on text. A chatbot is a product built around one: the LLM plus a conversation interface, safety filtering, tool access, and usually a system prompt shaping its behavior. The same LLM can power very different chatbots depending on how it's wrapped.",
      },
    ],
  },
  {
    title: 'Safety & security',
    items: [
      {
        id: 'prompt-injection-vs-jailbreak',
        question: 'Is prompt injection the same as jailbreaking?',
        answer:
          "Related, but distinct: [jailbreaking](/reference/jailbreak) tries to get a model to ignore its own safety training, usually through the user's own prompt. [Prompt injection](/reference/prompt-injection) is an attacker sneaking instructions into content the model reads — a document, a webpage, a tool result — to hijack its behavior, so the person asking the question may not even be the attacker. [AI Security](/docs/ai-security) covers both in detail.",
      },
      {
        id: 'ai-safety-vs-security',
        question: 'Is "AI safety" the same as "AI security"?',
        answer:
          "No, and the course draws this line deliberately. AI security is about a deployed system being misused — prompt injection, jailbreaks, data exfiltration — covered in [AI Security](/docs/ai-security). AI safety and alignment is a different question: whether a model's own objectives match what we actually want, independent of any attacker. That's a planned future lesson, not yet published.",
      },
    ],
  },
  {
    title: 'Practical & tooling',
    items: [
      {
        id: 'need-a-gpu',
        question: 'Do I need a GPU to follow along?',
        answer:
          'No — the course is conceptual, not a hands-on lab, so nothing requires you to run your own models. [GPUs](/reference/gpu) and [CUDA](/reference/cuda) are explained because they matter for understanding why training and inference are shaped the way they are, not because you need to own one.',
      },
      {
        id: 'pytorch-vs-tensorflow',
        question: 'Should I learn PyTorch or TensorFlow?',
        answer:
          "For anything new today, [PyTorch](/reference/pytorch) — it's what the vast majority of current research and production LLM work uses. [TensorFlow](/reference/tensorflow) still shows up in older codebases and some production pipelines, which is why [Tooling & The Dev Stack](/docs/tooling-and-the-dev-stack) covers both, but PyTorch is the default recommendation.",
      },
      {
        id: 'are-widgets-real',
        question: 'Are the interactive widgets on this site real measurements?',
        answer:
          'It depends on the widget, and each one says so directly in the page: some run real computation in your browser (labeled Live), some replay hand-crafted illustrative data (Precomputed), and some are explicitly not a real measurement (Simulated).',
      },
    ],
  },
  {
    title: 'About this site',
    items: [
      {
        id: 'why-marvin',
        question: 'Why is this site named "Marvin"?',
        answer:
          'After [Marvin Minsky](/people/marvin-minsky), a founder of the field who spent his career arguing about what intelligence actually is — co-founder of the MIT AI Lab and one of the earliest people to take the idea of machine intelligence seriously.',
      },
      {
        id: 'is-it-free',
        question: 'Is this course free?',
        answer:
          'Yes — every lesson, glossary entry, and profile is free to read, with no signup.',
      },
    ],
  },
];
