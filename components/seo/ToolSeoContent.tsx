import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { buildFaqJsonLd, FaqItem } from '../../lib/seo';

interface Step {
  title: string;
  body: string;
}

interface RelatedTool {
  href: string;
  label: string;
  description: string;
}

interface ToolSeoContentProps {
  id: string;
  howItWorksTitle: string;
  steps: Step[];
  faqs: FaqItem[];
  relatedTools: RelatedTool[];
}

export const ToolSeoContent = ({
  id,
  howItWorksTitle,
  steps,
  faqs,
  relatedTools,
}: ToolSeoContentProps) => (
  <section className="space-y-10 pt-6" aria-label="About this tool">
    <JsonLd id={`${id}-faq`} data={buildFaqJsonLd(faqs)} />

    <div>
      <h2 className="text-xl font-semibold mb-4">{howItWorksTitle}</h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-lg border border-base-300 bg-base-100 p-4"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary mb-2">
              {index + 1}
            </span>
            <h3 className="font-semibold mb-1">{step.title}</h3>
            <p className="text-sm text-base-content/70">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>

    <div>
      <h2 className="text-xl font-semibold mb-4">Frequently asked questions</h2>
      <div className="space-y-2">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="collapse collapse-arrow border border-base-300 bg-base-100"
          >
            <summary className="collapse-title font-medium">
              {faq.question}
            </summary>
            <div className="collapse-content text-sm text-base-content/80">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>

    <div>
      <h2 className="text-xl font-semibold mb-4">More Dungeon Master tools</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {relatedTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="feature-card rounded-lg border border-base-300 bg-base-100 p-4"
          >
            <span className="font-semibold flex items-center gap-2">
              {tool.label}
              <span className="feature-arrow text-primary" aria-hidden="true">
                &rarr;
              </span>
            </span>
            <p className="text-sm text-base-content/70 mt-1">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
