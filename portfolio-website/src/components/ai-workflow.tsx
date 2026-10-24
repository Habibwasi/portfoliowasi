import { anchors } from "@/content/anchors";
import { aiWorkflow, home } from "@/content/site";
import { aiSkills } from "@/content/skills";
import { SectionHead } from "./section-head";

/**
 * "How I build with AI" (4.1, AI2, AI6): the workflow as five steps with the review loop,
 * then the AI toolkit, each tag a link to the project that proves it.
 */
export function AiWorkflow() {
  const { ai } = home;
  return (
    <section id={anchors.ai} className="hw-container hw-section" aria-labelledby="ai-heading">
      <SectionHead id="ai-heading" eyebrow={ai.eyebrow} heading={ai.heading} subline={ai.subline} />

      <figure className="hw-flow">
        <figcaption className="hw-tag hw-flow__label">{ai.diagramLabel}</figcaption>
        <ol className="hw-flow__steps" aria-label={ai.diagramLabel}>
          {aiWorkflow.map((step, i) => (
            <li key={step.name} className={i === 1 ? "hw-flow__step hw-flow__step--review" : "hw-flow__step"}>
              <h3 className="hw-flow__name">{step.name}</h3>
              <p className="hw-flow__text">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="hw-flow__loop" aria-hidden="true">
          <span>{ai.loopLabel}</span>
        </div>
        <p className="sr-only">{ai.loopText}</p>
      </figure>

      <div className="hw-toolkit">
        <h3 className="hw-label">
          {ai.toolkitHeading}
        </h3>
        <ul className="hw-tags hw-toolkit__tags" aria-label={ai.toolkitHeading}>
          {aiSkills.map((skill) => (
            <li key={skill.name}>
              <a className="hw-tag hw-tag--ai hw-tag--link" href={skill.proofs[0].href}>
                {skill.name}
              </a>
            </li>
          ))}
        </ul>
        <p className="hw-toolkit__closing">{ai.closing}</p>
      </div>
    </section>
  );
}
