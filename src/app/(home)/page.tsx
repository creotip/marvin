import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center items-center text-center flex-1 gap-4 px-4">
      <h1 className="text-3xl font-bold">Marvin</h1>
      <p className="max-w-lg text-fd-muted-foreground">
        A from-scratch tour of AI, named for Marvin Minsky: symbolic AI to
        LLMs, gradient descent to attention, training to inference. Written
        to be read end to end.
      </p>
      <Link
        href="/docs/history-and-landscape"
        className="font-medium underline underline-offset-4"
      >
        Start with History &amp; Landscape →
      </Link>
    </div>
  );
}
