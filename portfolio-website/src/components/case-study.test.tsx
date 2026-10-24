import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getCaseStudy } from "@/content/case-studies";
import { getProject } from "@/content/projects";
import { CaseStudyView } from "./case-study";

function renderStudy(slug: string) {
  return render(<CaseStudyView project={getProject(slug)!} study={getCaseStudy(slug)!} />);
}

describe("CaseStudyView", () => {
  it("has one h1 and the sections in the fixed order (C7)", () => {
    renderStudy("validation-portal");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Validation Portal, research for founders");
    const eyebrows = Array.from(document.querySelectorAll(".hw-cs-section .hw-label")).map((el) => el.textContent);
    expect(eyebrows).toEqual([
      "01 / Problem",
      "02 / My role",
      "03 / AI in the build",
      "04 / Solution",
      "05 / Architecture",
      "06 / Test evidence",
      "07 / Impact",
    ]);
  });

  it("numbers the case study among the featured three", () => {
    renderStudy("validation-portal");
    expect(screen.getByText("Case study 03 / 03 · Full-stack + LLM")).toBeInTheDocument();
  });

  it("states facts", () => {
    renderStudy("validation-portal");
    const facts = screen.getByRole("group", { name: "Project facts" });
    expect(within(facts).getByText("Built solo")).toBeInTheDocument();
    expect(within(facts).getByText("Live")).toBeInTheDocument();
  });

  it("shows no test-run frame for Validation Portal (C11 exception)", () => {
    renderStudy("validation-portal");
    expect(screen.queryByText("Test run")).not.toBeInTheDocument();
    expect(screen.getByText(/no automated tests or CI yet/)).toBeInTheDocument();
  });

  it("links the code and the live demo", () => {
    renderStudy("validation-portal");
    expect(screen.getByRole("link", { name: "View the code on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/Habibwasi/Validation-Portal",
    );
    expect(screen.getByRole("link", { name: "Open the live demo" })).toHaveAttribute("href", "https://validation-portal.vercel.app");
  });

  it("ends with Next project as the primary action, then the CV (S3, C12)", () => {
    renderStudy("validation-portal");
    const next = screen.getByRole("link", { name: "Next project: TopicTrail, a memory for what you browse" });
    expect(next).toHaveAttribute("href", "/work/topictrail");
    expect(next).toHaveClass("hw-btn--primary");
    expect(document.querySelectorAll(".hw-btn--primary")).toHaveLength(1);
  });

  it("renders Ridly as case study 02, built solo, with its test run and code link (2.1)", () => {
    renderStudy("ridly");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ridly, carpooling for Android and iOS");
    expect(screen.getByText("Case study 02 / 03 · Mobile + backend · AI workflow")).toBeInTheDocument();
    const facts = screen.getByRole("group", { name: "Project facts" });
    expect(within(facts).getByText("Built solo")).toBeInTheDocument();
    expect(within(facts).getByText("Android and iOS")).toBeInTheDocument();
    expect(screen.getByText("Test run")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View the code on GitHub" })).toHaveAttribute("href", "https://github.com/Habibwasi/HOP-KMP");
    expect(screen.getByRole("link", { name: "Next project: Validation Portal, research for founders" })).toHaveAttribute(
      "href",
      "/work/validation-portal",
    );
  });

  it("marks TopicTrail as in progress and says there's no code link yet", () => {
    renderStudy("topictrail");
    expect(screen.getAllByText("Bachelor project · in progress · due Jan 2027").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "View the code on GitHub" })).not.toBeInTheDocument();
    expect(screen.getByText(/Code isn't public yet/)).toBeInTheDocument();
  });
});
