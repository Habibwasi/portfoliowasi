import { describe, expect, it } from "vitest";
import { publishedProjects } from "@/content/case-studies";
import { placeholder } from "@/content/placeholder";
import { cvReady, guideTools, highlightTargets, sections, toolAction, toolInputs } from "./tools";

describe("guide page tools (5.6)", () => {
  it("lets the model scroll only to Home's sections", () => {
    expect(Object.keys(sections)).toEqual(["work", "ai", "proof", "stack", "contact"]);
    expect(toolInputs.scroll_to.safeParse({ section: "contact" }).success).toBe(true);
    expect(toolInputs.scroll_to.safeParse({ section: "https://evil.example" }).success).toBe(false);
  });

  it("opens only published case studies", () => {
    for (const p of publishedProjects) expect(toolInputs.open_case_study.safeParse({ slug: p.slug }).success).toBe(true);
    expect(toolInputs.open_case_study.safeParse({ slug: "undershelf" }).success).toBe(false);
  });

  it("highlights only targets the site has", () => {
    const targets = highlightTargets.map((t) => t.target);
    expect(targets).toContain("/#work-ridly");
    expect(targets).toContain("/work/ridly#cs-test-evidence");
    expect(targets).toContain("/about#qa-record");
    expect(new Set(targets).size).toBe(targets.length);
  });

  it("offers download_cv only once the CV exists (7.1)", () => {
    expect(cvReady(placeholder("CV PDF"))).toBe(false);
    expect(cvReady("/cv/Habib-Ahmed-Wasi-CV.pdf")).toBe(true);
    expect(Object.keys(guideTools(false))).toEqual(["scroll_to", "open_case_study", "highlight", "play_demo", "start_tour"]);
    expect(Object.keys(guideTools(true))).toContain("download_cv");
    expect(toolAction("download_cv", {})).toEqual({ kind: "cv", label: "CV" });
  });

  it("turns a valid call into a page action", () => {
    expect(toolAction("scroll_to", { section: "contact" })).toEqual({ kind: "show", path: "/", id: "contact", label: "Contact" });
    expect(toolAction("open_case_study", { slug: "ridly" })).toEqual({ kind: "show", path: "/work/ridly", id: "cs-title", label: "Ridly" });
    expect(toolAction("highlight", { target: "/about#qa-record" })).toEqual({ kind: "show", path: "/about", id: "qa-record", label: "QA record" });
    expect(toolAction("play_demo", { slug: "ridly" })).toMatchObject({ path: "/work/ridly", id: "cs-demo", play: true });
    expect(toolAction("start_tour", {})).toMatchObject({ kind: "tour" });
  });

  it("ignores unknown tools and invalid input", () => {
    expect(toolAction("delete_everything", {})).toBeNull();
    expect(toolAction("scroll_to", { section: "nowhere" })).toBeNull();
    expect(toolAction("highlight", { target: "javascript:alert(1)" })).toBeNull();
    expect(toolAction("toString", {})).toBeNull();
  });
});
