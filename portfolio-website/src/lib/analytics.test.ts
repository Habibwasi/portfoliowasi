import { describe, expect, it } from "vitest";
import { placeholder } from "@/content/placeholder";
import { analyticsEvents, linkEvent, placeOf, umamiScript } from "./analytics";

const targets = { cv: "/cv/Habib-Ahmed-Wasi-CV.pdf", calendly: "https://calendly.com/habibwasi9/30min" };

describe("linkEvent", () => {
  it.each([
    ["/cv/Habib-Ahmed-Wasi-CV.pdf", analyticsEvents.cv],
    ["https://portfolio-habib-wasi.vercel.app/cv/Habib-Ahmed-Wasi-CV.pdf", analyticsEvents.cv],
    ["mailto:habibwasi9@gmail.com", analyticsEvents.email],
    ["MAILTO:habibwasi9@gmail.com", analyticsEvents.email],
    ["https://calendly.com/habibwasi9/30min", analyticsEvents.calendly],
    ["https://calendly.com/habibwasi9/30min?month=2026-11", analyticsEvents.calendly],
  ])("%s is %s", (href, event) => {
    expect(linkEvent(href, targets)).toBe(event);
  });

  it.each(["/work/ridly", "/#contact", "https://github.com/Habibwasi", "https://calendly.com/someone-else", ""])(
    "%s is not tracked",
    (href) => {
      expect(linkEvent(href, targets)).toBeNull();
    },
  );

  it("tracks nothing for a CV or Calendly that is still a placeholder", () => {
    const missing = { cv: placeholder("CV PDF"), calendly: placeholder("Calendly URL") };
    expect(linkEvent("/cv/Habib-Ahmed-Wasi-CV.pdf", missing)).toBeNull();
    expect(linkEvent("https://calendly.com/habibwasi9/30min", missing)).toBeNull();
    expect(linkEvent("mailto:habibwasi9@gmail.com", missing)).toBe(analyticsEvents.email);
  });
});

describe("placeOf", () => {
  const at = (html: string) => {
    document.body.innerHTML = html;
    return document.querySelector("a")!;
  };

  it("is guide inside the guide panel", () => {
    expect(placeOf(at(`<section id="contact"><div data-guide-panel><a href="#">x</a></div></section>`))).toBe("guide");
  });

  it("is header or footer inside them", () => {
    expect(placeOf(at(`<header><a href="#">x</a></header>`))).toBe("header");
    expect(placeOf(at(`<footer><a href="#">x</a></footer>`))).toBe("footer");
  });

  it("ignores a header inside an article", () => {
    expect(placeOf(at(`<article id="ridly"><header><a href="#">x</a></header></article>`))).toBe("ridly");
  });

  it("is the id of the nearest section or article", () => {
    expect(placeOf(at(`<section id="contact"><div><a href="#">x</a></div></section>`))).toBe("contact");
    expect(placeOf(at(`<article id="ridly"><section><a href="#">x</a></section></article>`))).toBe("ridly");
  });

  it("is page otherwise", () => {
    expect(placeOf(at(`<main><a href="#">x</a></main>`))).toBe("page");
  });
});

describe("umamiScript", () => {
  it("is nothing without a website ID", () => {
    expect(umamiScript(undefined, "https://portfolio-habib-wasi.vercel.app")).toBeNull();
    expect(umamiScript("", "https://portfolio-habib-wasi.vercel.app")).toBeNull();
  });

  it("limits tracking to the production host", () => {
    expect(umamiScript("abc-123", "https://portfolio-habib-wasi.vercel.app/")).toEqual({
      src: "https://cloud.umami.is/script.js",
      websiteId: "abc-123",
      domains: "portfolio-habib-wasi.vercel.app",
    });
  });
});
