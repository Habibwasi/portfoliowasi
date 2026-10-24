import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Social preview images (1.11, 2.2): paper and ink, set in Fraunces with a Plex Mono label,
 * like the site. next/og (Satori) can't read WOFF2, so static TTF instances live in public/fonts.
 */
export const ogSize = { width: 1200, height: 630 };

// Token values from design-system/tokens.json; Satori can't read CSS variables.
const paper = "#f5f1e8";
const ink = "#1c1a16";
const inkMuted = "#5c564c";
const signal = "#c24018";

const fontDir = join(process.cwd(), "public", "fonts");
const fonts = Promise.all(
  ["Fraunces-SemiBold.ttf", "Fraunces-Regular.ttf", "IBMPlexMono-Medium.ttf"].map((file) => readFile(join(fontDir, file))),
);

type OgCardProps = {
  eyebrow: string;
  title: string;
  lede: string;
  /** Text next to the "H" tile at the bottom. */
  footer: string;
  /** Title size in px; the name on the default image is larger than a project title. */
  titleSize?: number;
};

export async function ogImage({ eyebrow, title, lede, footer, titleSize = 72 }: OgCardProps) {
  const [semiBold, regular, mono] = await fonts;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: paper,
          color: ink,
          fontFamily: "Fraunces",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: inkMuted }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 600, lineHeight: 1.02, letterSpacing: -1 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 32, lineHeight: 1.35, maxWidth: 1000 }}>{lede}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 74,
              borderRadius: 10,
              background: signal,
              color: "#ffffff",
              fontSize: 48,
              fontWeight: 600,
            }}
          >
            H
          </div>
          <div style={{ display: "flex", fontSize: 26, color: inkMuted }}>{footer}</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Fraunces", data: semiBold, weight: 600, style: "normal" },
        { name: "Fraunces", data: regular, weight: 400, style: "normal" },
        { name: "Plex Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
