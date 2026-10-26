import { describe, expect, it } from "vitest";
import { answerFromStream, checkBudget, concatList } from "./lib";

const stream = (events: unknown[]) => events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("") + "data: [DONE]\n\n";

describe("answerFromStream", () => {
  it("joins the text deltas and keeps the sources from the metadata", () => {
    const body = stream([
      { type: "start", messageMetadata: { sources: [{ n: 1, title: "Ridly: Solution", url: "/work/ridly#cs-solution" }] } },
      { type: "text-start", id: "t" },
      { type: "text-delta", id: "t", delta: "Ridly's search answers in 96 ms " },
      { type: "text-delta", id: "t", delta: "at p95 【1†L1-L2】." },
      { type: "text-end", id: "t" },
      { type: "finish" },
    ]);
    expect(answerFromStream(body)).toEqual({
      text: "Ridly's search answers in 96 ms at p95 【1†L1-L2】.",
      sources: [{ n: 1, title: "Ridly: Solution", url: "/work/ridly#cs-solution" }],
      busy: false,
    });
  });

  it("marks a busy answer", () => {
    const body = stream([{ type: "start", messageMetadata: { sources: [], busy: true } }, { type: "text-delta", id: "t", delta: "Busy." }]);
    expect(answerFromStream(body).busy).toBe(true);
  });
});

describe("concatList", () => {
  it("holds each screencast frame until the next one, and the last until the end", () => {
    const list = concatList(
      [
        { file: "C:\\tmp\\f-00001.jpg", timestamp: 10 },
        { file: "C:\\tmp\\f-00002.jpg", timestamp: 10.04 },
        { file: "C:\\tmp\\f-00003.jpg", timestamp: 11 },
      ],
      12.5,
    );
    expect(list).toBe(
      [
        "ffconcat version 1.0",
        "file 'C:/tmp/f-00001.jpg'",
        "duration 0.040000",
        "file 'C:/tmp/f-00002.jpg'",
        "duration 0.960000",
        "file 'C:/tmp/f-00003.jpg'",
        "duration 1.500000",
        // The concat demuxer drops the last entry's duration unless the file is listed again.
        "file 'C:/tmp/f-00003.jpg'",
        "",
      ].join("\n"),
    );
  });
});

describe("checkBudget", () => {
  it("allows up to 10 guide questions in one run, the per-visitor limit", () => {
    expect(() => checkBudget({ guideQuestions: 2 }, 5)).not.toThrow();
    expect(() => checkBudget({ guideQuestions: 2 }, 6)).toThrow(/12 guide questions/);
  });
});
