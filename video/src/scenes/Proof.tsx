import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cuts } from "../cuts";
import { numbers, tests } from "../data";
import { boxes } from "../layout";
import { colors, fonts, radius } from "../theme";
import type { SceneProps } from "./index";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Scene 7, "How do I know it always works?": the edge-case tests scroll by and turn green
 * (tests.json, from the commit that passed CI), then the evaluation and Lighthouse numbers
 * (numbers.json). Until numbers.json is exported, its cards say so instead of showing a number.
 */
export function ProofScene({ cut, scene }: SceneProps) {
  const frame = useCurrentFrame();
  const { width } = cuts[cut];
  const stage = boxes(cut).stage;
  const u = width / 1080;
  const half = Math.round(scene.durationInFrames / 2);

  // Part 1: the tests, scrolling up, each ticked as it passes the middle.
  const row = 46 * u;
  const list = tests.tests;
  const scroll = interpolate(frame, [0, half], [0, Math.max(0, list.length * row - stage.height * 0.8)], clamp);
  const testsOpacity = interpolate(frame, [half - 10, half], [1, 0], clamp);

  // Part 2: the numbers.
  const cardsIn = (i: number) => interpolate(frame, [half + i * 6, half + i * 6 + 14], [0, 1], clamp);
  const card = (i: number, value: string, caption: string) => (
    <div
      key={caption}
      style={{
        flex: 1,
        minWidth: 0,
        padding: 24 * u,
        borderRadius: radius.md,
        backgroundColor: colors["paper-raised"],
        outline: `1px solid ${colors.line}`,
        opacity: cardsIn(i),
        transform: `translateY(${(1 - cardsIn(i)) * 16}px)`,
      }}
    >
      <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: (value.length > 6 ? 40 : 64) * u, lineHeight: 1, color: colors["signal-ink"] }}>{value}</div>
      <div style={{ marginTop: 10 * u, fontFamily: fonts.mono, fontWeight: 500, fontSize: 18 * u, letterSpacing: "0.08em", textTransform: "uppercase", color: colors["ink-muted"] }}>{caption}</div>
    </div>
  );
  const pending = "Pending";
  const lighthouse = numbers?.lighthouse.value ?? [];
  const minPerformance = lighthouse.length ? Math.min(...lighthouse.map((p) => p.performance)) : null;
  const maxLcp = lighthouse.length ? Math.max(...lighthouse.map((p) => p.lcpMs)) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <div style={{ position: "absolute", left: stage.x, top: stage.y, width: stage.width, height: stage.height, overflow: "hidden", opacity: testsOpacity }}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {list.map((test, i) => {
            const passAt = (i / list.length) * half * 0.9 + 6;
            const passed = frame >= passAt;
            return (
              <div key={test.title} style={{ display: "flex", alignItems: "baseline", gap: 14 * u, height: row, fontSize: 22 * u, fontFamily: fonts.sans, color: colors.ink, whiteSpace: "nowrap" }}>
                {/* tokens.json has no green, and cobalt is for links only: a passed test turns ink. */}
                <span style={{ flex: "none", width: 70 * u, textAlign: "center", fontFamily: fonts.mono, fontWeight: 500, color: passed ? colors.paper : colors["ink-muted"], backgroundColor: passed ? colors.ink : colors["paper-sunk"], borderRadius: radius.sm }}>
                  {passed ? "PASS" : "RUN"}
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{test.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "absolute", left: stage.x, top: stage.y, width: stage.width, display: "flex", flexDirection: cut === "readme" ? "row" : "column", gap: 24 * u, opacity: frame >= half - 2 ? 1 : 0 }}>
        {card(0, numbers ? String(numbers.evalCases.value.total) : pending, "Questions in the guide's evaluation")}
        {card(1, numbers ? (numbers.lastNightly.value.conclusion === "success" ? "Passed" : "Failed") : pending, numbers ? `Last nightly run, ${numbers.lastNightly.date}` : "Last nightly run")}
        {card(2, minPerformance === null ? pending : String(minPerformance), "Lowest Lighthouse score, phone")}
        {card(3, maxLcp === null ? pending : `${(maxLcp / 1000).toFixed(1)} s`, "Slowest page's LCP, median")}
      </div>
    </AbsoluteFill>
  );
}
