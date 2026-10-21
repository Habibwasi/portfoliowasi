import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * Default social preview (1.11): paper and ink, the name and the role line.
 * Uses next/og's built-in font; per-page images in Fraunces come with 2.2.
 */
export const alt = `${site.name}, software engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "#f5f1e8",
          color: "#1c1a16",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 3, textTransform: "uppercase", color: "#5c564c" }}>
          {site.roleLine}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 700, lineHeight: 0.95, letterSpacing: -3 }}>{site.name}</div>
          <div style={{ display: "flex", fontSize: 34, lineHeight: 1.35, maxWidth: 980 }}>{site.intro}</div>
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
              background: "#c24018",
              color: "#ffffff",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#5c564c" }}>{site.availability.location}</div>
        </div>
      </div>
    ),
    size,
  );
}
