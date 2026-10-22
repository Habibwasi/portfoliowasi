import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { about } from "@/content/about";
import { About } from "./about";

describe("About", () => {
  it("has one h1 and the intro", () => {
    render(<About />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The path so far");
    expect(screen.getByText(/graduating in January 2027/)).toBeInTheDocument();
  });

  it("shows the three photo slots as placeholders", () => {
    render(<About />);
    for (const n of [1, 2, 3]) {
      expect(screen.getByText(`[Photo ${n}]`)).toBeInTheDocument();
      expect(screen.getByText(`[Photo ${n} caption: where, when]`)).toBeInTheDocument();
    }
  });

  it("lists the journey in order, linking back to the work", () => {
    render(<About />);
    const section = document.getElementById("journey")!;
    const list = within(section).getByRole("list", { name: "Journey" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(7);
    expect(items[0]).toHaveTextContent("Jan 2023");
    expect(items[0]).toHaveTextContent("Tech Assistant, Upwork");
    expect(items.at(-1)).toHaveTextContent("Graduation");
    expect(within(list).getByRole("link", { name: /Ridly/ })).toHaveAttribute("href", "/work/ridly");
    expect(within(list).getByRole("link", { name: /uTest/ })).toHaveAttribute("href", "#qa-record");
    expect(section).not.toHaveTextContent(/\bHop\b/);
  });

  it("shows the full QA record", () => {
    render(<About />);
    const record = document.getElementById("qa-record")!;
    expect(within(record).getByRole("heading", { level: 2 })).toHaveTextContent("QA record");
    for (const metric of about.qaMetrics) {
      expect(within(record).getByText(metric.value)).toBeInTheDocument();
      expect(within(record).getByText(metric.label)).toBeInTheDocument();
    }
    expect(within(record).getByText("92.26%")).toBeInTheDocument();
  });

  it("ends with the CV and email", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: "The full story, on paper" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email me" })).toHaveAttribute("href", "mailto:habibwasi9@gmail.com");
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/cv/Habib-Ahmed-Wasi-CV.pdf");
  });
});
