"use client";

import { useState } from "react";
import { anchors } from "@/content/anchors";
import { home } from "@/content/site";
import { aiSkills, techSkills, type Skill } from "@/content/skills";
import { cn } from "@/lib/utils";
import { SectionHead } from "./section-head";

function SkillGroup({
  label,
  skills,
  selected,
  onSelect,
}: {
  label: string;
  skills: Skill[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="hw-stack__group" role="group" aria-label={label}>
      <span className="hw-label" aria-hidden="true">
        {label}
      </span>
      <div className="hw-tags">
        {skills.map((skill) => (
          <button
            key={skill.name}
            type="button"
            className={cn("hw-tag hw-tag--button", skill.kind === "ai" && "hw-tag--ai")}
            aria-pressed={skill.name === selected}
            aria-controls="stack-proofs"
            onClick={() => onSelect(skill.name)}
          >
            {skill.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Stack (4.3, C13, C14): every skill a project proves, as a tag row. Picking one shows where
 * it was used. The orbit replaces the row on desktop in 5.3; the panel stays.
 */
export function Stack() {
  const { stack } = home;
  const [selected, setSelected] = useState(aiSkills[0].name);
  const skill = [...aiSkills, ...techSkills].find((s) => s.name === selected)!;

  return (
    <section id={anchors.stack} className="hw-container hw-section" aria-labelledby="stack-heading">
      <SectionHead id="stack-heading" eyebrow={stack.eyebrow} heading={stack.heading} subline={stack.subline} />
      <div className="hw-stack">
        <div className="hw-stack__groups">
          <SkillGroup label={stack.aiGroup} skills={aiSkills} selected={selected} onSelect={setSelected} />
          <SkillGroup label={stack.techGroup} skills={techSkills} selected={selected} onSelect={setSelected} />
        </div>
        <div id="stack-proofs" className="hw-stack__proofs" role="region" aria-label={`Where I used ${skill.name}`} aria-live="polite">
          <span className="hw-label">Selected · {skill.name}</span>
          <ul>
            {skill.proofs.map((proof) => {
              const external = proof.href.startsWith("http");
              return (
                <li key={proof.title}>
                  <a href={proof.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {proof.title}
                    {external && <span aria-hidden="true"> ↗</span>}
                  </a>
                  <span>{proof.note}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
