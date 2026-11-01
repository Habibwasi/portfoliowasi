import { describe, expect, it } from "vitest";
import { about, journeyDate } from "./about";
import { listPlaceholders } from "./placeholder";
import { ctfRecord, qaRecord } from "./site";

describe("about (4.4)", () => {
  it("lists the journey in date order and ends with graduation", () => {
    const months = about.journey.entries.map((e) => e.month);
    expect(months).toEqual([...months].sort());
    expect(about.journey.entries).toHaveLength(8);
    expect(about.journey.entries.at(-1)!.title).toMatch(/Graduation/);
    expect(about.journey.entries.at(-1)!.month).toBe("2027-01");
  });

  it("formats journey dates as short month and year", () => {
    expect(journeyDate("2023-01")).toBe("Jan 2023");
    expect(journeyDate("2026-09")).toBe("Sep 2026");
  });

  it("states the uTest numbers from the QA record", () => {
    const utest = about.journey.entries.find((e) => e.title.includes("uTest"))!;
    expect(utest.line).toContain(`${qaRecord.testCycles} test cycles`);
    expect(utest.line).toContain(`${qaRecord.issuesReported} issues reported`);
    expect(about.qaMetrics.map((m) => m.value)).toEqual([
      qaRecord.rating,
      String(qaRecord.testCycles),
      String(qaRecord.testCasesRun),
      String(qaRecord.productsTested),
      String(qaRecord.issuesReported),
    ]);
  });

  it("states the CTF from the record, leading with the full clear rather than the rank", () => {
    const ctf = about.journey.entries.find((e) => e.title === ctfRecord.event)!;
    expect(ctf.month).toBe("2026-10");
    expect(ctf.href).toBe(`#${about.anchors.security}`);
    expect(about.securityMetrics.map((m) => m.value)).toEqual([
      ctfRecord.flags,
      ctfRecord.points,
      ctfRecord.window,
      ctfRecord.teams,
    ]);
    // 639th of 1,716 orders entrants by solve time; the certificate carries it, the page doesn't.
    const page = [ctf.line, ...about.security.body, ...about.securityMetrics.map((m) => `${m.value} ${m.label}`)].join(" ");
    expect(page).not.toMatch(/639/);
    expect(page).toContain("all 18 flags");
  });

  it("fills the three photo cards with pictures that all have alt text", () => {
    expect(about.photos).toHaveLength(3);
    expect(listPlaceholders(about.photos)).toEqual([]);
    for (const photo of about.photos) {
      expect(photo.images.length).toBeGreaterThan(0);
      for (const image of photo.images) expect(image.alt).not.toBe("");
    }
  });
});
