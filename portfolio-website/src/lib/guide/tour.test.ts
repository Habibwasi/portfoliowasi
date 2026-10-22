import { describe, expect, it } from "vitest";
import { initialTour, tourReducer, type TourState } from "./tour";

const run = (actions: Parameters<typeof tourReducer>[1]["type"][], stops = 5) =>
  actions.reduce<TourState>((state, type) => tourReducer(state, { type, stops }), initialTour);

describe("tourReducer", () => {
  it("starts at the first stop", () => {
    expect(run(["start"])).toEqual({ status: "running", step: 0 });
  });

  it("moves with next and previous, and never before the first stop", () => {
    expect(run(["start", "next", "next"]).step).toBe(2);
    expect(run(["start", "next", "previous"]).step).toBe(0);
    expect(run(["start", "previous"]).step).toBe(0);
  });

  it("auto-advances on tick only while running", () => {
    expect(run(["start", "tick"]).step).toBe(1);
    expect(run(["start", "pause", "tick"])).toEqual({ status: "paused", step: 0 });
    expect(run(["start", "pause", "resume", "tick"])).toEqual({ status: "running", step: 1 });
  });

  it("ends after the last stop", () => {
    expect(run(["start", "next", "next", "next", "next"]).step).toBe(4);
    expect(run(["start", "tick", "tick", "tick", "tick", "tick"])).toEqual(initialTour);
  });

  it("stops from any step", () => {
    expect(run(["start", "next", "stop"])).toEqual(initialTour);
  });
});
