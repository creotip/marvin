import type { Metadata } from 'next';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { renderFaqAnswer, stripFaqLinks } from '@/components/faq-answer';
import { FAQ_CATEGORIES } from '@/lib/faq-data';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about AI, machine learning, and this course — RAG vs. fine-tuning, training vs. inference, AI safety vs. AI security, and more.',
};

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CATEGORIES.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripFaqLinks(item.answer),
        },
      })),
    ),
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="text-fd-muted-foreground text-lg text-balance">
          Common questions about the course and the field it covers — the things
          that don&apos;t map to one specific lesson.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-10">
        {FAQ_CATEGORIES.map((category) => (
          <section key={category.title}>
            <h2 className="mb-3 text-lg font-semibold">{category.title}</h2>
            <Accordions multiple>
              {category.items.map((item) => (
                <Accordion key={item.id} id={item.id} title={item.question}>
                  <p className="text-fd-muted-foreground ps-5 leading-relaxed">
                    {renderFaqAnswer(item.answer)}
                  </p>
                </Accordion>
              ))}
            </Accordions>
          </section>
        ))}
      </div>
    </main>
  );
}
