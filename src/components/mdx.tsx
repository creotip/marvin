import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Banner } from 'fumadocs-ui/components/banner';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { GithubInfo } from 'fumadocs-ui/components/github-info';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ComponentType } from 'react';
import { Deeper } from '@/components/depth';
import { Mermaid } from '@/components/mermaid';
import { BayesCalculator } from '@/components/widgets/bayes-calculator';
import { QLearningGrid } from '@/components/widgets/q-learning-grid';
import { ConfusionMatrixRoc } from '@/components/widgets/confusion-matrix-roc';
import { ReferencePreview } from '@/components/reference-preview';
import { Misconception, NapkinMath } from '@/components/teaching';
import { Timeline, TimelineItem } from '@/components/timeline';
import { GlossaryIndex } from '@/components/glossary-index';

const Anchor = defaultMdxComponents.a ?? 'a';

// `remarkReferencePreviews` puts these on every link into the glossary.
type AnchorProps = ComponentProps<'a'> & {
  'data-preview-title'?: string;
  'data-preview'?: string;
};

function withReferencePreview(Link: ComponentType<AnchorProps> | 'a') {
  return function MdxAnchor({
    'data-preview-title': title,
    'data-preview': description,
    ...props
  }: AnchorProps) {
    if (!title || !description) return <Link {...props} />;

    return (
      <ReferencePreview title={title} description={description}>
        <Link {...props} />
      </ReferencePreview>
    );
  };
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Step,
    Steps,
    Accordion,
    Accordions,
    TypeTable,
    File,
    Files,
    Folder,
    InlineTOC,
    GithubInfo,
    Banner,
    Mermaid,
    BayesCalculator,
    QLearningGrid,
    ConfusionMatrixRoc,
    Deeper,
    NapkinMath,
    Misconception,
    Timeline,
    TimelineItem,
    GlossaryIndex,
    ...components,
    // Must come last so it also wraps a caller-supplied link component.
    a: withReferencePreview(
      (components?.a as ComponentType<AnchorProps>) ?? Anchor,
    ),
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
