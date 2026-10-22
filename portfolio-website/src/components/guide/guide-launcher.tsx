"use client";

import { usePathname } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { guide } from "@/content/guide";
import { GuideCharacter } from "./guide-character";

// The panel, the chat code and @ai-sdk/react are a separate chunk: preloaded on hover or focus, loaded on click.
const loadPanel = () => import("./guide-panel");
const GuidePanel = lazy(loadPanel);

const OFFER_KEY = "hw-guide-tour-offered";

function offerSeen(): boolean {
  try {
    return window.localStorage.getItem(OFFER_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberOffer() {
  try {
    window.localStorage.setItem(OFFER_KEY, "1");
  } catch {
    // Private mode or blocked storage: the offer may show again on the next visit.
  }
}

/**
 * The collapsed guide on every page (3.1): the "H" tile bottom-right. It never opens by itself;
 * on Home it offers the tour once, after the first scroll (GD3).
 */
export function GuideLauncher() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [tourRequest, setTourRequest] = useState(0);
  const [offer, setOffer] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (pathname !== "/" || offerSeen()) return;
    const onScroll = () => {
      if (window.scrollY < guide.offer.afterScrollPx) return;
      window.removeEventListener("scroll", onScroll);
      setOffer(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // The open panel reflows the page on desktop (GD7); closing it returns focus to the tile.
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.dataset.guide = "open";
    } else if (wasOpen.current) {
      delete root.dataset.guide;
      buttonRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => () => void delete document.documentElement.dataset.guide, []);

  const dismissOffer = () => {
    setOffer(false);
    rememberOffer();
  };

  const openPanel = (startTour = false) => {
    dismissOffer();
    setMounted(true);
    setOpen(true);
    if (startTour) setTourRequest((n) => n + 1);
  };

  return (
    <>
      <div className="hw-guide-launcher">
        {offer && !open && (
          <div className="hw-guide-offer" role="region" aria-label="Tour offer">
            <p>{guide.offer.text}</p>
            <div className="hw-guide-offer__actions">
              <button type="button" className="hw-btn hw-btn--primary hw-btn--small" onClick={() => openPanel(true)}>
                {guide.offer.accept}
              </button>
              <button type="button" className="hw-btn hw-btn--text" onClick={dismissOffer}>
                {guide.offer.decline}
              </button>
            </div>
          </div>
        )}
        <button
          ref={buttonRef}
          type="button"
          className="hw-guide-tile"
          aria-label={guide.launcherLabel}
          aria-expanded={open}
          hidden={open}
          onPointerEnter={loadPanel}
          onFocus={loadPanel}
          onClick={() => openPanel()}
        >
          <GuideCharacter className="hw-guide hw-guide--idle" />
        </button>
      </div>
      {mounted && (
        <Suspense fallback={null}>
          <GuidePanel open={open} onClose={() => setOpen(false)} tourRequest={tourRequest} />
        </Suspense>
      )}
    </>
  );
}
