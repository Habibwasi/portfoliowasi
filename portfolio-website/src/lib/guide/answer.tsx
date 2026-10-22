import type { ReactNode } from "react";

/** A source sent by /api/guide with each answer; its URL comes from the index, never from the model. */
export type GuideSource = { n: number; title: string; url: string };

const CITATION = /\[(\d+)\]/g;

/** The sources an answer cites as [n]; all of them when it cites none. */
export function citedSources(text: string, sources: GuideSource[]): GuideSource[] {
  const cited = new Set([...text.matchAll(CITATION)].map((m) => Number(m[1])));
  const matched = sources.filter((s) => cited.has(s.n));
  return matched.length ? matched : sources;
}

/** **bold** and [n] citations inside one line. Everything else stays a text node. */
function inline(text: string, sources: GuideSource[], key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
    const id = `${key}-${i}`;
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={id}>{bold[1]}</strong>;
    const citation = part.match(/^\[(\d+)\]$/);
    const source = citation && sources.find((s) => s.n === Number(citation[1]));
    if (source) {
      return (
        <a key={id} className="hw-guide-cite" href={source.url} aria-label={`Source ${source.n}: ${source.title}`}>
          [{source.n}]
        </a>
      );
    }
    return part;
  });
}

/**
 * The model's answer as React nodes: paragraphs, "-" lists, bold and citations (3.3).
 * No HTML is ever parsed, so markup in an answer renders as text, and URLs it writes stay text.
 */
export function Answer({ text, sources }: { text: string; sources: GuideSource[] }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, b) => {
        const lines = block.split("\n").filter((line) => line.trim());
        if (lines.length && lines.every((line) => /^\s*[-*]\s+/.test(line))) {
          return (
            <ul key={b}>
              {lines.map((line, l) => (
                <li key={l}>{inline(line.replace(/^\s*[-*]\s+/, ""), sources, `${b}-${l}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={b}>{inline(lines.join(" "), sources, String(b))}</p>;
      })}
    </>
  );
}
