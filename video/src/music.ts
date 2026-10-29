/**
 * The music track, or null while there is none (7.12). The file goes in public/music/ and is
 * git-ignored: royalty-free licences allow it in a video but not as a standalone file in a public
 * repo. Its licence and where it came from go in music/LICENSE.md.
 */
export type Music = { file: string; volume: number; fadeInSeconds: number; fadeOutSeconds: number; startFromSeconds: number };

export const music: Music | null = null;

/** Volume at a frame of a cut: fades in from silence, holds, and fades out to silence at the end. */
export function musicVolume(frame: number, durationInFrames: number, track: Music, fps: number): number {
  const fadeIn = track.fadeInSeconds * fps;
  const fadeOut = track.fadeOutSeconds * fps;
  const rampUp = fadeIn > 0 ? Math.min(1, frame / fadeIn) : 1;
  const rampDown = fadeOut > 0 ? Math.min(1, (durationInFrames - frame) / fadeOut) : 1;
  return track.volume * Math.max(0, Math.min(rampUp, rampDown));
}
