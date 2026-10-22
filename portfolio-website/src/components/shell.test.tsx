import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { isCurrent } from "./nav-links";
import { SiteFooter } from "./site-footer";
import { SiteHeader, navItems } from "./site-header";

describe("SiteHeader", () => {
  it("has a skip link to the main content", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  });

  it("lists Work, About and Contact, hiding CV until the PDF exists", () => {
    expect(navItems().map((i) => [i.label, i.href])).toEqual([
      ["Work", "/#work"],
      ["About", "/about"],
      ["Contact", "/#contact"],
    ]);
  });

  it("puts the nav in a labelled landmark", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });
});

describe("isCurrent", () => {
  it("marks a page link on its own page", () => {
    expect(isCurrent("/about", "/about")).toBe(true);
  });

  it("never marks section links", () => {
    expect(isCurrent("/#work", "/")).toBe(false);
  });
});

describe("SiteFooter", () => {
  it("keeps GitHub and LinkedIn as plain text links and links the source", () => {
    render(<SiteFooter />);
    for (const name of ["GitHub", "LinkedIn", "Source of this site"]) {
      const link = screen.getByRole("link", { name });
      expect(link).not.toHaveClass("hw-btn");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByRole("img", { name: "CI status" })).toBeInTheDocument();
  });
});
