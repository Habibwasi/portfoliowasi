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

  it("shows the three photo collages with their captions and described pictures", () => {
    render(<About />);
    const list = screen.getByRole("list", { name: "Photos" });
    const figures = within(list).getAllByRole("figure");
    expect(figures).toHaveLength(3);
    about.photos.forEach((photo, i) => {
      expect(figures[i]).toHaveTextContent(photo.caption);
      expect(within(figures[i]).getAllByRole("img")).toHaveLength(photo.images.length);
    });
  });

  it("lists the journey in order, linking back to the work", () => {
    render(<About />);
    const section = document.getElementById("journey")!;
    const list = within(section).getByRole("list", { name: "Journey" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(8);
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

  it("shows the security record with its skills and both ways to check it", () => {
    render(<About />);
    const record = document.getElementById("security")!;
    expect(within(record).getByRole("heading", { level: 2 })).toHaveTextContent("Security and CTFs");
    expect(within(record).getByText(/all 18 flags, working solo/)).toBeInTheDocument();
    for (const skill of about.security.skills) expect(within(record).getByText(skill)).toBeInTheDocument();
    for (const metric of about.securityMetrics) expect(within(record).getByText(metric.label)).toBeInTheDocument();
    expect(within(record).getByRole("link", { name: "Certificate of participation" })).toHaveAttribute(
      "href",
      "/proof/operation-cymbal-cold-room-certificate.pdf",
    );
    expect(within(record).getByRole("link", { name: "The event on Hack The Box" })).toHaveAttribute(
      "href",
      expect.stringContaining("ctf.hackthebox.com"),
    );
  });

  it("ends with the CV and email", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: "The full story, on paper" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email me" })).toHaveAttribute("href", "mailto:habibwasi9@gmail.com");
    expect(screen.getByRole("link", { name: "View CV" })).toHaveAttribute("href", "/cv/Habib-Ahmed-Wasi-CV.pdf");
  });
});
