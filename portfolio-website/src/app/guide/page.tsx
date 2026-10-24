import type { Metadata } from "next";
import { howItWorks } from "@/content/guide";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: howItWorks.title,
  description: howItWorks.lede,
  alternates: { canonical: howItWorks.path },
  openGraph: { title: howItWorks.title, description: howItWorks.lede, type: "article", url: howItWorks.path },
  twitter: { card: "summary_large_image", title: howItWorks.title, description: howItWorks.lede },
};

function Steps({ label, steps }: { label: string; steps: readonly { name: string; text: string }[] }) {
  return (
    <ol className="hw-pipeline" aria-label={label}>
      {steps.map((step, i) => (
        <li key={step.name} className="hw-pipeline__step">
          <span className="hw-label">
            {String(i + 1).padStart(2, "0")} / {step.name}
          </span>
          <p>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** "How this guide works" (3.5, AI6): the guide's architecture, linked from its panel. */
export default function GuidePage() {
  return (
    <article className="hw-container hw-guide-page">
      <header className="hw-cs-header">
        <span className="hw-label">AI guide · RAG pipeline</span>
        <h1 className="hw-cs-header__title">{howItWorks.title}</h1>
        <p className="hw-cs-header__lede">{howItWorks.lede}</p>
      </header>

      <section aria-labelledby="guide-build">
        <h2 id="guide-build" className="hw-h3">
          At build time
        </h2>
        <Steps label="Build steps" steps={howItWorks.buildSteps} />
      </section>

      <section aria-labelledby="guide-request">
        <h2 id="guide-request" className="hw-h3">
          For each question
        </h2>
        <Steps label="Request steps" steps={howItWorks.requestSteps} />
      </section>

      <section className="hw-prose" aria-labelledby="guide-details">
        <h2 id="guide-details" className="hw-h3">
          The details
        </h2>
        <h3 className="hw-label">When nothing fits</h3>
        <p>{howItWorks.noMatch}</p>
        <h3 className="hw-label">Model</h3>
        <p>{howItWorks.model}</p>
        <h3 className="hw-label">Evaluation</h3>
        <p>{howItWorks.evaluation}</p>
        <h3 className="hw-label">At scale</h3>
        <p>{howItWorks.scale}</p>
        <h3 className="hw-label">The code</h3>
        <ul>
          {howItWorks.codeLinks.map((link) => (
            <li key={link.path}>
              <a href={`${site.links.repo}/tree/main/${link.path}`} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
