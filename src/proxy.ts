import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';

// Path strings only — importing the content layer here would pull every MDX
// document into the proxy bundle.
const collectionNames = ['docs', 'reference'];

const rewriters = collectionNames.map((name) => ({
  bySuffix: rewritePath(
    `/${name}{/*path}.md`,
    `/llms.mdx/${name}{/*path}/content.md`,
  ).rewrite,
  byAccept: rewritePath(
    `/${name}{/*path}`,
    `/llms.mdx/${name}{/*path}/content.md`,
  ).rewrite,
}));

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const { bySuffix } of rewriters) {
    const result = bySuffix(pathname);
    if (result) return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    for (const { byAccept } of rewriters) {
      const result = byAccept(pathname);

      if (result) {
        return NextResponse.rewrite(new URL(result, request.nextUrl), {
          // this URL has two representations, selected by `Accept`
          headers: { Vary: 'Accept' },
        });
      }
    }
  }

  return NextResponse.next();
}
