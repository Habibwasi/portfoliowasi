import { describe, expect, it } from "vitest";
import { guideState } from "./state";

describe("guideState (5.6)", () => {
  it("follows the chat: typing → listening, sent → thinking, streaming → talking", () => {
    expect(guideState({ status: "ready", typing: false, pointing: false })).toBe("idle");
    expect(guideState({ status: "ready", typing: true, pointing: false })).toBe("listening");
    expect(guideState({ status: "submitted", typing: false, pointing: false })).toBe("thinking");
    expect(guideState({ status: "streaming", typing: true, pointing: false })).toBe("talking");
  });

  it("points while the pointer shows, whatever the chat does", () => {
    expect(guideState({ status: "streaming", typing: true, pointing: true })).toBe("pointing");
  });
});
