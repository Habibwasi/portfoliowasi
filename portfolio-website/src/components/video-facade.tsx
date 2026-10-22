"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";

// Privacy-enhanced embed with captions on (C11). Autoplay is fine here: the visitor just pressed play.
const embedParams = new URLSearchParams({
  autoplay: "1",
  cc_load_policy: "1",
  cc_lang_pref: "en",
  rel: "0",
  playsinline: "1",
}).toString();

/** The guide's play_demo tool (5.6) asks the facade to play with this event; it starts muted. */
export const PLAY_DEMO_EVENT = "hw:play-demo";

type VideoFacadeProps = {
  /** YouTube video id (11 characters). */
  videoId: string;
  /** Accessible name and iframe title, usually the media caption. */
  title: string;
  /** Poster image under /public; without one the frame shows a plain paper poster. */
  poster?: string;
};

/**
 * Video facade (2.3): nothing loads from YouTube until the visitor presses play.
 * It is a real link to the video, so it still works without JavaScript; with JavaScript
 * the click swaps in the youtube-nocookie player and moves focus to it. The guide can start it
 * too (PLAY_DEMO_EVENT), muted, because browsers block sound without the visitor's own click.
 */
export function VideoFacade({ videoId, title, poster }: VideoFacadeProps) {
  const [playing, setPlaying] = useState<false | "sound" | "muted">(false);
  const player = useRef<HTMLIFrameElement>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const id = encodeURIComponent(videoId);

  useEffect(() => {
    const el = link.current;
    if (!el) return;
    const playMuted = () => setPlaying("muted");
    el.addEventListener(PLAY_DEMO_EVENT, playMuted);
    return () => el.removeEventListener(PLAY_DEMO_EVENT, playMuted);
  }, [playing]);

  useEffect(() => {
    if (playing === "sound") player.current?.focus();
  }, [playing]);

  function play(event: MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (new tab, new window) through to YouTube.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setPlaying("sound");
  }

  if (playing) {
    return (
      <iframe
        ref={player}
        className="hw-video__player"
        src={`https://www.youtube-nocookie.com/embed/${id}?${embedParams}${playing === "muted" ? "&mute=1" : ""}`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <a ref={link} className="hw-video" href={`https://www.youtube.com/watch?v=${id}`} onClick={play} aria-label={`Play video: ${title}`}>
      {poster && <Image src={poster} alt="" fill sizes="(max-width: 640px) 100vw, 1200px" style={{ objectFit: "cover" }} />}
      <span className="hw-video__play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
          <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
        </svg>
      </span>
      <span className="hw-video__hint" aria-hidden="true">
        Play · loads YouTube
      </span>
    </a>
  );
}
