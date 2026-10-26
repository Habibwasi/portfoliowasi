import type { ComponentType } from "react";
import type { CutId, Scene, SceneId } from "../cuts";
import { Placeholder } from "./Placeholder";

export type SceneProps = { cut: CutId; scene: Scene };

const placeholder = (shows: string) =>
  function PlaceholderScene(props: SceneProps) {
    return <Placeholder {...props} shows={shows} />;
  };

/** One component per scene in the spec's table; each cut picks the ones it plays. */
export const sceneComponents: Record<SceneId, ComponentType<SceneProps>> = {
  hook: placeholder("Footage: the name scrambles in, the tiles drop and read H W A S I"),
  tour: placeholder("Footage: Home, a case study, the guide answering one question"),
  answer: placeholder("Diagram: terms, BM25 and cosine, fusion, the answer and its citations"),
  break: placeholder("Footage: an off-topic question and a prompt injection"),
  outage: placeholder("Footage: the busy message, then the limiter down"),
  phones: placeholder("Footage: reduced motion side by side, then the phone layout"),
  proof: placeholder("Tests turn green, the evaluation, Lighthouse, a deploy"),
  end: placeholder("End card: name, site, GitHub"),
};
