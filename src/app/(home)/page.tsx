import Link from 'next/link';
import { ArrowRight, BookOpen, Library, Sparkles, Users } from 'lucide-react';
import { docs, people, reference } from '@/lib/content';

const LESSON_COUNT = docs.source.getPages().length;
const TERM_COUNT = reference.source
  .getPages()
  .filter((page) => page.url !== reference.route).length;
const PEOPLE_COUNT = people.source
  .getPages()
  .filter((page) => page.url !== people.route).length;
const WIDGET_COUNT = 13;

const STATS = [
  { value: LESSON_COUNT, label: 'Lessons' },
  { value: TERM_COUNT, label: 'Glossary terms' },
  { value: PEOPLE_COUNT, label: 'People profiled' },
  { value: WIDGET_COUNT, label: 'Interactive widgets' },
];

const SECTIONS = [
  {
    href: '/docs',
    icon: BookOpen,
    title: 'Docs',
    description:
      'The course itself — foundations through applied systems, in reading order.',
  },
  {
    href: '/reference',
    icon: Library,
    title: 'Reference',
    description:
      'Short, linkable definitions for every term the lessons use, cross-linked automatically.',
  },
  {
    href: '/people',
    icon: Users,
    title: 'People',
    description:
      'Who actually built this field — profiles from founding theory to current labs.',
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="border-fd-primary/30 bg-fd-primary/10 text-fd-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <Sparkles className="size-3.5" />
          Named for Marvin Minsky
        </span>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
          Learn how AI actually works, from scratch.
        </h1>
        <p className="text-fd-muted-foreground max-w-2xl text-lg text-balance">
          A docs-style course, not a wall of slides: symbolic AI to LLMs,
          gradient descent to attention, training to inference — with
          interactive widgets and a full glossary, written to be read end to
          end.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs/history-and-landscape"
            className="bg-fd-primary text-fd-primary-foreground inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Start reading
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/reference"
            className="hover:bg-fd-accent inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Browse the glossary
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-fd-card rounded-xl border px-4 py-5 text-center"
          >
            <p className="font-heading text-3xl font-extrabold">{stat.value}</p>
            <p className="text-fd-muted-foreground mt-1 text-xs">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/docs/history-and-landscape"
        className="border-fd-border bg-fd-card hover:border-fd-primary/50 mt-6 flex items-center justify-between gap-4 rounded-2xl border p-6 transition-colors"
      >
        <div>
          <p className="text-lg font-semibold">
            Start with History &amp; Landscape
          </p>
          <p className="text-fd-muted-foreground mt-1 text-sm">
            How the field got here — symbolic AI to expert systems to
            statistical ML to the LLM era, and what pushed it out of each one.
          </p>
        </div>
        <ArrowRight className="text-fd-primary size-5 shrink-0" />
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-fd-card hover:border-fd-primary/50 flex flex-col gap-3 rounded-2xl border p-6 transition-colors"
          >
            <section.icon className="text-fd-primary size-6" />
            <p className="text-lg font-semibold">{section.title}</p>
            <p className="text-fd-muted-foreground text-sm">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
