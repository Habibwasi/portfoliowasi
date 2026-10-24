import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Answer, citedSources, type GuideSource } from "./answer";

const sources: GuideSource[] = [
  { n: 1, title: "Ridly: Test evidence", url: "/work/ridly#cs-test-evidence" },
  { n: 2, title: "Availability", url: "/#intro" },
];

describe("Answer", () => {
  it("renders HTML in the model's text as plain text", () => {
    const { container } = render(<Answer text={'<script>alert(1)</script> <img src=x onerror="alert(1)">'} sources={[]} />);
    expect(container.querySelector("script, img")).toBeNull();
    expect(container).toHaveTextContent("<script>alert(1)</script>");
  });

  it("supports paragraphs, bold and lists", () => {
    const { container } = render(<Answer text={"He is **open to roles**.\n\n- Ridly\n- TopicTrail"} sources={[]} />);
    expect(container.querySelectorAll("p")).toHaveLength(1);
    expect(container.querySelector("strong")).toHaveTextContent("open to roles");
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Ridly", "TopicTrail"]);
  });

  it("turns [n] into a link to that source, and leaves unknown numbers as text", () => {
    render(<Answer text="Available from February 2027 [2]. Not [9]." sources={sources} />);
    expect(screen.getByRole("link", { name: "Source 2: Availability" })).toHaveAttribute("href", "/#intro");
    expect(screen.queryByRole("link", { name: /Source 9/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Not \[9\]/)).toBeInTheDocument();
  });

  it("never links URLs the model writes", () => {
    render(<Answer text="See https://evil.example/phish" sources={[]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("citedSources", () => {
  it("returns the sources the text cites", () => {
    expect(citedSources("From February 2027 [2].", sources)).toEqual([sources[1]]);
  });

  it("falls back to every source when none is cited", () => {
    expect(citedSources("He is in Kolding.", sources)).toEqual(sources);
  });
});
