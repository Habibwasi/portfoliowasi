import type { ComponentType } from "react";
import type { CutId, Scene, SceneId } from "../cuts";
import { AnswerScene } from "./Answer";
import { EndScene } from "./End";
import { FootageScene } from "./Footage";
import { ProofScene } from "./Proof";

export type SceneProps = { cut: CutId; scene: Scene };

/** One component per scene in the spec's table; each cut picks the ones it plays. */
export const sceneComponents: Record<SceneId, ComponentType<SceneProps>> = {
  hook: FootageScene,
  tour: FootageScene,
  answer: AnswerScene,
  break: FootageScene,
  outage: FootageScene,
  phones: FootageScene,
  proof: ProofScene,
  end: EndScene,
};
