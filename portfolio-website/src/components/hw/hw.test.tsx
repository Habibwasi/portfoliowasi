import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { placeholder } from "@/content/placeholder";
import type { Project } from "@/content/types";
import { Button, MediaFrame, Metrics, Placeholder, ProjectCard, Tag, Testimonial } from ".";

describe("Button", () => {
  it("renders a link when given href", () => {
    render(
      <Button variant="primary" href="/work">
        View case studies
      </Button>,
    );
    const link = screen.getByRole("link", { name: "View case studies" });
    expect(link).toHaveAttribute("href", "/work");
    expect(link).toHaveClass("hw-btn", "hw-btn--primary");
  });

  it("renders a type=button by default", () => {
    render(<Button>Download CV</Button>);
    const button = screen.getByRole("button", { name: "Download CV" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("hw-btn");
    expect(button).not.toHaveClass("hw-btn--primary");
  });

  it("styles the text variant", () => {
    render(<Button variant="text" href="mailto:a@b.c">a@b.c</Button>);
    expect(screen.getByRole("link")).toHaveClass("hw-btn--text");
  });
});

describe("Tag", () => {
  it("marks AI tools apart from languages", () => {
    render(
      <>
        <Tag ai>Claude Code</Tag>
        <Tag>Kotlin</Tag>
      </>,
    );
    expect(screen.getByText("Claude Code")).toHaveClass("hw-tag", "hw-tag--ai");
    expect(screen.getByText("Kotlin")).not.toHaveClass("hw-tag--ai");
  });
});

describe("Metrics", () => {
  it("labels expected numbers", () => {
    render(<Metrics metrics={[{ value: "50%", label: "Recall", expected: true }]} />);
    expect(screen.getByText("Recall (expected)")).toBeInTheDocument();
  });

  it("renders nothing for no metrics", () => {
    const { container } = render(<Metrics metrics={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Placeholder", () => {
  it("shows the missing content's label in brackets", () => {
    render(<Placeholder label="Ridly screens" />);
    expect(screen.getByText("[Ridly screens]")).toHaveAttribute("data-placeholder", "Ridly screens");
  });
});

describe("MediaFrame", () => {
  it("labels the evidence and shows the caption", () => {
    render(<MediaFrame kind="test-run" caption="k6 run against the API." />);
    const figure = screen.getByRole("figure");
    expect(within(figure).getByText("Test run")).toHaveClass("hw-tag");
    expect(within(figure).getByText("k6 run against the API.")).toBeInTheDocument();
    expect(within(figure).getByText("[Test run placeholder]")).toBeInTheDocument();
  });

  it("shows a placeholder caption", () => {
    render(<MediaFrame kind="demo" caption={placeholder("Demo caption")}>video</MediaFrame>);
    expect(screen.getByText("[Demo caption]")).toBeInTheDocument();
    expect(screen.getByText("video")).toBeInTheDocument();
  });
});

const project: Project = {
  slug: "ridly",
  title: "Ridly, carpooling for Android and iOS",
  eyebrow: "02 / Mobile + backend",
  summary: "Drivers post trips and passengers book seats.",
  status: "complete",
  role: "Built solo",
  metrics: [
    { value: "96 ms", label: "Trip search p95" },
    { value: "387", label: "Commits" },
    { value: "2", label: "Platforms" },
  ],
  tags: ["Kotlin MP", "SwiftUI", "NestJS", "Prisma"],
  links: {},
  cover: placeholder("Ridly screens"),
  featured: true,
  caseStudyReady: true,
};

describe("ProjectCard", () => {
  it("is one link to the case study", () => {
    render(<ProjectCard project={project} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/work/ridly");
    expect(within(links[0]).getByRole("heading", { name: project.title })).toBeInTheDocument();
  });

  it("shows at most two metrics and three tags", () => {
    render(<ProjectCard project={project} />);
    expect(screen.queryByText("Platforms")).not.toBeInTheDocument();
    expect(screen.queryByText("Prisma")).not.toBeInTheDocument();
    expect(screen.getByText("NestJS")).toBeInTheDocument();
  });

  it("is not a link until the case study is published", () => {
    render(<ProjectCard project={{ ...project, caseStudyReady: false }} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Case study coming")).toBeInTheDocument();
  });

  it("shows the in-progress note", () => {
    render(
      <ProjectCard
        project={{ ...project, status: "in-progress", statusNote: "Bachelor project · in progress · due Jan 2027" }}
      />,
    );
    expect(screen.getByText("Bachelor project · in progress · due Jan 2027")).toBeInTheDocument();
  });

  it("renders a placeholder for missing screens", () => {
    render(<ProjectCard project={project} />);
    expect(screen.getByText("[Ridly screens]")).toBeInTheDocument();
  });
});

describe("Testimonial", () => {
  it("renders placeholders until the real quote arrives", () => {
    render(
      <Testimonial
        testimonial={{ quote: placeholder("Team leader's words"), name: placeholder("Name Surname"), role: "Team leader, Just Eat" }}
      />,
    );
    expect(screen.getByText("[Team leader's words]")).toBeInTheDocument();
    expect(screen.getByText("[Name Surname]")).toBeInTheDocument();
    expect(screen.getByText("Team leader, Just Eat")).toBeInTheDocument();
  });

  it("renders a real quote", () => {
    render(<Testimonial testimonial={{ quote: "Reliable.", name: "A Person", role: "Team leader, Just Eat" }} />);
    expect(screen.getByText("Reliable.").tagName).toBe("BLOCKQUOTE");
  });
});
