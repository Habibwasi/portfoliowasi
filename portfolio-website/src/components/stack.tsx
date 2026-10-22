"use client";

import { useState, type CSSProperties } from "react";
import { anchors } from "@/content/anchors";
import { home } from "@/content/site";
import { aiSkills, frameworkSkills, languageSkills, skills, type Skill } from "@/content/skills";
import { cn } from "@/lib/utils";
import { SectionHead } from "./section-head";

type Ring = "ai" | "language" | "framework";

function SkillGroup({
  label,
  ring,
  skills,
  selected,
  onSelect,
}: {
  label: string;
  ring: Ring;
  skills: Skill[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className={cn("hw-stack__group hw-orbit__ring", `hw-orbit__ring--${ring}`)} role="group" aria-label={label}>
      <span className="hw-label" aria-hidden="true">
        {label}
      </span>
      <div className="hw-tags hw-orbit__items">
        {skills.map((skill, i) => (
          // From 1200 px the item sits on its ring at angle --a; below that it is a plain tag in a row.
          <span key={skill.name} className="hw-orbit__item" style={{ "--a": `${(360 / skills.length) * i}deg` } as CSSProperties}>
            <span className="hw-orbit__upright">
              <button
                type="button"
                className={cn("hw-tag hw-tag--button", skill.kind === "ai" && "hw-tag--ai")}
                aria-pressed={skill.name === selected}
                aria-controls="stack-proofs"
                onClick={() => onSelect(skill.name)}
              >
                {skill.name}
              </button>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Stack (4.3, 5.3; C13, C14, AI4): every skill a project proves. From 1200 px the three groups
 * are rings orbiting a dark core, AI tools outermost; narrower, they are rows of tags. Either
 * way they are the same toggle buttons, and picking one shows where it was used.
 */
export function Stack() {
  const { stack } = home;
  const [selected, setSelected] = useState(aiSkills[0].name);
  const [paused, setPaused] = useState(false);
  const skill = skills.find((s) => s.name === selected)!;

  return (
    <section id={anchors.stack} className="hw-container hw-section" aria-labelledby="stack-heading">
      <SectionHead id="stack-heading" eyebrow={stack.eyebrow} heading={stack.heading} subline={stack.subline} />
      <div className="hw-stack">
        <div className="hw-stack__orbit">
          <div className="hw-stack__groups hw-orbit" data-paused={paused || undefined}>
            <SkillGroup label={stack.aiGroup} ring="ai" skills={aiSkills} selected={selected} onSelect={setSelected} />
            <SkillGroup label={stack.languageGroup} ring="language" skills={languageSkills} selected={selected} onSelect={setSelected} />
            <SkillGroup label={stack.frameworkGroup} ring="framework" skills={frameworkSkills} selected={selected} onSelect={setSelected} />
            <span className="hw-orbit__core" aria-hidden="true">
              Stack
            </span>
          </div>
          {/* Moving content needs a way to stop it (WCAG 2.2.2); hover and focus pause it too. */}
          <button type="button" className="hw-btn hw-btn--text hw-orbit__pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {stack.pause}
          </button>
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
