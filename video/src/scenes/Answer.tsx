import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cuts } from "../cuts";
import { chunkLabel, retrieval } from "../data";
import { boxes } from "../layout";
import { colors, fonts, radius, withAlpha } from "../theme";
import type { SceneProps } from "./index";

/** Where each step starts, as a share of the scene. */
const STEPS = { terms: 0, rankings: 0.14, fused: 0.44, answer: 0.64 } as const;

const fade = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, from + 10, to - 8, to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const grow = (frame: number, from: number, length = 18) =>
  interpolate(frame, [from, from + length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/**
 * Scene 3, "How does it answer?": the question splits into terms; BM25 and cosine rank the chunks
 * (real scores from retrieval.json); reciprocal rank fusion picks the four sources; the model
 * writes the recorded answer and its citation lights up the source it points to.
 */
export function AnswerScene({ cut, scene }: SceneProps) {
  const frame = useCurrentFrame();
  const { width } = cuts[cut];
  const stage = boxes(cut).stage;
  const d = scene.durationInFrames;
  const at = (share: number) => Math.round(share * d);
  const u = width / 1080;
  const text = 30 * u;
  const small = 24 * u;
  const terms = new Set(retrieval.terms);
  const wide = cut === "readme";

  const label = (content: string, top: number) => (
    <div style={{ position: "absolute", left: 0, top, fontFamily: fonts.mono, fontWeight: 500, fontSize: small, letterSpacing: "0.08em", textTransform: "uppercase", color: colors["ink-muted"] }}>
      {content}
    </div>
  );

  // Step 1: the question, with the words search ignores fading out.
  const words = retrieval.question.split(/\s+/);
  const termsRow = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 * u, fontFamily: fonts.sans, fontSize: text * 1.2 }}>
      {words.map((word, i) => {
        const term = [...terms].find((t) => word.toLowerCase().replace(/['’]s\b|[^a-z0-9]/g, "") === t);
        const settle = grow(frame, at(STEPS.terms) + 20 + i * 3, 14);
        return (
          <span
            key={i}
            style={{
              padding: `${4 * u}px ${12 * u}px`,
              borderRadius: radius.sm,
              border: `${2 * u}px solid ${term ? withAlpha("signal", settle) : "transparent"}`,
              color: term ? colors.ink : withAlpha("ink-muted", 1 - 0.6 * settle),
              textDecoration: term ? undefined : settle > 0.5 ? "line-through" : undefined,
              fontFamily: term && settle > 0.5 ? fonts.mono : fonts.sans,
            }}
          >
            {term && settle > 0.5 ? term : word}
          </span>
        );
      })}
    </div>
  );

  // Step 2: the two rankings as bars.
  const bars = (title: string, entries: { id: string; title: string; value: number }[], start: number) => {
    // The top five fit under the terms in both cuts.
    const top = entries.slice(0, 5);
    const max = Math.max(...top.map((e) => e.value));
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: small, letterSpacing: "0.08em", textTransform: "uppercase", color: colors["ink-muted"], marginBottom: 12 * u }}>
          {title}
        </div>
        {top.map((entry, i) => {
          const g = grow(frame, start + i * 4);
          return (
            <div key={entry.id} style={{ marginBottom: 10 * u }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.sans, fontSize: small, color: colors.ink }}>
                <span>{chunkLabel(entry.id, entry.title)}</span>
                <span style={{ fontFamily: fonts.mono, color: colors["signal-ink"] }}>{entry.value.toFixed(entry.value < 1 ? 3 : 2)}</span>
              </div>
              <div style={{ height: 10 * u, borderRadius: radius.pill, backgroundColor: colors["paper-sunk"], marginTop: 4 * u }}>
                <div style={{ width: `${(entry.value / max) * 100 * g}%`, height: "100%", borderRadius: radius.pill, backgroundColor: i === 0 ? colors.signal : colors["line-strong"] }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Step 3 and 4: the fused sources, then the answer with its citation.
  const answerText = retrieval.answer ?? "";
  const typed = Math.floor(interpolate(frame, [at(STEPS.answer) + 20, d - 20], [0, answerText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const shown = answerText.slice(0, typed);
  const citedNow = retrieval.cited.filter((n) => shown.includes(`[${n}]`));

  const fused = (
    <div>
      {retrieval.hits.map((hit, i) => {
        const g = grow(frame, at(STEPS.fused) + i * 5);
        const lit = citedNow.includes(hit.n);
        return (
          <div
            key={hit.id}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16 * u,
              padding: `${8 * u}px ${12 * u}px`,
              marginBottom: 6 * u,
              borderRadius: radius.md,
              backgroundColor: lit ? colors.marker : colors["paper-raised"],
              outline: `1px solid ${colors.line}`,
              opacity: g,
              transform: `translateY(${(1 - g) * 12}px)`,
              fontFamily: fonts.sans,
              fontSize: text,
              color: colors.ink,
            }}
          >
            <span style={{ fontFamily: fonts.mono, color: colors["signal-ink"] }}>[{hit.n}]</span>
            <span style={{ flex: 1 }}>{chunkLabel(hit.id, hit.title)}</span>
            <span style={{ fontFamily: fonts.mono, fontSize: small, color: colors["ink-muted"] }}>{hit.score.toFixed(4)}</span>
          </div>
        );
      })}
    </div>
  );

  const answer = (
    <div style={{ opacity: grow(frame, at(STEPS.answer)) }}>
      <div style={{ display: "inline-block", fontFamily: fonts.mono, fontWeight: 500, fontSize: small, padding: `${4 * u}px ${12 * u}px`, borderRadius: radius.pill, backgroundColor: colors.ink, color: colors.paper, marginBottom: 14 * u }}>
        {retrieval.model}
      </div>
      <div style={{ fontFamily: fonts.sans, fontSize: text * 1.15, lineHeight: 1.4, color: colors.ink, minHeight: text * 3.3 }}>
        {shown}
      </div>
    </div>
  );

  const termsTop = 0;
  const bodyTop = text * 2.6;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <div style={{ position: "absolute", left: stage.x, top: stage.y, width: stage.width, height: stage.height }}>
        <div style={{ position: "absolute", top: termsTop, left: 0, right: 0 }}>{termsRow}</div>

        <div style={{ position: "absolute", top: bodyTop, left: 0, right: 0, opacity: fade(frame, at(STEPS.rankings), at(STEPS.fused)) }}>
          <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: (wide ? 64 : 28) * u }}>
            {bars("BM25 · keywords", retrieval.bm25, at(STEPS.rankings) + 8)}
            {bars("Cosine · meaning", retrieval.cosine, at(STEPS.rankings) + 20)}
          </div>
        </div>

        <div style={{ position: "absolute", top: bodyTop, left: 0, right: 0, opacity: interpolate(frame, [at(STEPS.fused), at(STEPS.fused) + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {label("Reciprocal rank fusion → the 4 sources the model sees", 0)}
          <div style={{ position: "absolute", top: small * 2, left: 0, right: 0, display: "flex", flexDirection: wide ? "row" : "column", gap: (wide ? 64 : 32) * u }}>
            <div style={{ flex: 1 }}>{fused}</div>
            <div style={{ flex: 1 }}>{answer}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
