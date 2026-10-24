import type { ReactNode } from "react";
import { isPlaceholder } from "@/content/placeholder";
import type { Content, MediaKind } from "@/content/types";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";
import { Tag } from "./tag";

export const mediaLabels: Record<MediaKind, string> = {
  architecture: "Architecture",
  demo: "Demo",
  screens: "Screens",
  "test-run": "Test run",
};

type MediaFrameProps = {
  kind: MediaKind;
  caption: Content<string>;
  /** The image, video or diagram. A Placeholder renders when missing. */
  children?: ReactNode;
  missing?: string;
  className?: string;
};

/** The frame for case study evidence: a labelled box and a one-sentence caption. */
export function MediaFrame({ kind, caption, children, missing, className }: MediaFrameProps) {
  const label = mediaLabels[kind];
  return (
    <figure className={cn("hw-frame", className)}>
      <div className={cn("hw-frame__box", kind === "test-run" && "hw-frame__box--terminal")}>
        <Tag className="hw-frame__tag">{label}</Tag>
        {children ?? <Placeholder label={missing ?? `${label} placeholder`} />}
      </div>
      <figcaption className="hw-frame__caption">
        {isPlaceholder(caption) ? <Placeholder label={caption.label} inline /> : caption}
      </figcaption>
    </figure>
  );
}
