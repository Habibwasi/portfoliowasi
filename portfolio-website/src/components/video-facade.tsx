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
 * the click swaps in the youtube-nocookie player and moves focus to it.
 */
export function VideoFacade({ videoId, title, poster }: VideoFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const player = useRef<HTMLIFrameElement>(null);
  const id = encodeURIComponent(videoId);

  useEffect(() => {
    if (playing) player.current?.focus();
  }, [playing]);

  function play(event: MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (new tab, new window) through to YouTube.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setPlaying(true);
  }

  if (playing) {
    return (
      <iframe
        ref={player}
        className="hw-video__player"
        src={`https://www.youtube-nocookie.com/embed/${id}?${embedParams}`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <a className="hw-video" href={`https://www.youtube.com/watch?v=${id}`} onClick={play} aria-label={`Play video: ${title}`}>
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
