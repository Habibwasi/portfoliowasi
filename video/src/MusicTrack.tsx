import { Html5Audio, staticFile, useVideoConfig } from "remotion";
import { music, musicVolume } from "./music";

/** The track under a whole cut, faded in and out. Renders nothing until music.ts names a track. */
export function MusicTrack() {
  const { durationInFrames, fps } = useVideoConfig();
  const track = music;
  if (!track) return null;
  return (
    <Html5Audio
      src={staticFile(`music/${track.file}`)}
      trimBefore={Math.round(track.startFromSeconds * fps)}
      volume={(frame) => musicVolume(frame, durationInFrames, track, fps)}
    />
  );
}
