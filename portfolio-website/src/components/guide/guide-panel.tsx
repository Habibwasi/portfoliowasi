"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useReducer, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { guide } from "@/content/guide";
import { Answer, citedSources, type GuideSource } from "@/lib/guide/answer";
import { MAX_QUESTION_LENGTH } from "@/lib/guide/config";
import { initialTour, tourReducer } from "@/lib/guide/tour";
import { GuideCharacter } from "./guide-character";

type GuideMessage = UIMessage<{ sources?: GuideSource[]; busy?: boolean }>;

const TARGET_CLASS = "hw-guide-target";
const stops = guide.tour.stops;

const matches = (query: string) => (typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false);
const isDocked = () => matches("(min-width: 1024px)");

const textOf = (message: GuideMessage) =>
  message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

/** The 30-second tour (3.2): scrolls to each stop, outlines it, and moves on every 6 s unless paused. */
function useTour(tourRequest: number, open: boolean) {
  const [tour, dispatch] = useReducer(tourReducer, initialTour);
  const pathname = usePathname();
  const router = useRouter();
  const act = (type: Parameters<typeof tourReducer>[1]["type"]) => dispatch({ type, stops: stops.length });

  useEffect(() => {
    if (tourRequest > 0) dispatch({ type: "start", stops: stops.length });
  }, [tourRequest]);

  useEffect(() => {
    if (!open) dispatch({ type: "stop", stops: stops.length });
  }, [open]);

  useEffect(() => {
    if (tour.status === "idle") return;
    const target = document.getElementById(stops[tour.step].target);
    if (!target) {
      // Started from another page: the tour runs on Home.
      if (pathname !== "/") router.push("/");
      return;
    }
    target.classList.add(TARGET_CLASS);
    target.scrollIntoView?.({ behavior: matches("(prefers-reduced-motion: reduce)") ? "auto" : "smooth", block: "start" });
    return () => target.classList.remove(TARGET_CLASS);
  }, [tour.status, tour.step, pathname, router]);

  useEffect(() => {
    if (tour.status !== "running") return;
    const timer = setTimeout(() => dispatch({ type: "tick", stops: stops.length }), guide.tour.stepSeconds * 1000);
    return () => clearTimeout(timer);
  }, [tour.status, tour.step]);

  return { tour, act };
}

/**
 * The opened guide (3.2, 3.3): "Jump to" row, the tour and the chat. A non-modal dialog,
 * docked on desktop and a bottom sheet on phones; a plain chat log for screen readers (GD8).
 */
export default function GuidePanel({ open, onClose, tourRequest }: { open: boolean; onClose: () => void; tourRequest: number }) {
  const [transport] = useState(() => new DefaultChatTransport<GuideMessage>({ api: "/api/guide" }));
  const { messages, sendMessage, status, error, stop } = useChat<GuideMessage>({ transport });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { tour, act } = useTour(tourRequest, open);
  const touring = tour.status !== "idle";
  const pending = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || pending) return;
    void sendMessage({ text: question });
    setInput("");
  };

  // On a phone the sheet would cover the target, so a jump closes it.
  const onJump = () => {
    if (!isDocked()) onClose();
  };

  const failedBusy = Boolean(error?.message.includes("busy"));
  const failure = error && (failedBusy ? guide.messages.busy : guide.messages.error);
  // A Groq error mid-answer leaves an empty answer whose sources become the busy fallback (3.6).
  const last = messages.at(-1);
  const failedAnswer = error && last?.role === "assistant" && !textOf(last) ? last : undefined;

  return (
    <section
      className="hw-guide-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="guide-title"
      data-guide-panel
      data-mode={touring ? "tour" : "chat"}
      hidden={!open}
      onKeyDown={onKeyDown}
    >
      <div className="hw-guide-panel__header">
        <GuideCharacter className="hw-guide hw-guide--small" />
        <h2 id="guide-title" className="hw-guide-panel__title">
          {guide.label}
        </h2>
        <button type="button" className="hw-guide-panel__close" aria-label="Close the AI assistant" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <nav className="hw-guide-panel__jumps" aria-label={guide.jumpsHeading}>
        <span className="hw-label">{guide.jumpsHeading}</span>
        <div className="hw-guide-panel__jump-list">
          <button type="button" className="hw-btn hw-btn--primary hw-btn--small" onClick={() => act("start")}>
            {guide.tourLabel}
          </button>
          {guide.jumps.map((jump) => (
            <Link key={jump.href} className="hw-btn hw-btn--small" href={jump.href} onClick={onJump}>
              {jump.label}
            </Link>
          ))}
        </div>
      </nav>

      {touring && (
        <div className="hw-guide-tour" role="group" aria-label="Tour">
          <p className="hw-guide-tour__text" aria-live="polite">
            <span className="hw-label">
              Stop {tour.step + 1} of {stops.length}
            </span>{" "}
            {stops[tour.step].text}
          </p>
          <div className="hw-guide-tour__controls">
            <button type="button" className="hw-btn hw-btn--small" onClick={() => act("previous")} disabled={tour.step === 0} aria-label="Previous stop">
              ←
            </button>
            {tour.status === "running" ? (
              <button type="button" className="hw-btn hw-btn--small" onClick={() => act("pause")}>
                Pause
              </button>
            ) : (
              <button type="button" className="hw-btn hw-btn--small" onClick={() => act("resume")}>
                Resume
              </button>
            )}
            <button type="button" className="hw-btn hw-btn--small" onClick={() => act("next")} disabled={tour.step === stops.length - 1} aria-label="Next stop">
              →
            </button>
            <button type="button" className="hw-btn hw-btn--text" onClick={() => act("stop")} aria-label="Stop the tour">
              Stop
            </button>
          </div>
        </div>
      )}

      <div className="hw-guide-panel__log" role="log" aria-live="polite" aria-busy={pending} aria-label="Conversation">
        <p className="hw-guide-msg hw-guide-msg--assistant">{guide.intro}</p>
        {messages.map((message) =>
          message.role === "user" ? (
            <p key={message.id} className="hw-guide-msg hw-guide-msg--user">
              {textOf(message)}
            </p>
          ) : message === failedAnswer ? null : (
            <AssistantMessage key={message.id} message={message} />
          ),
        )}
        {status === "submitted" && <p className="hw-guide-msg hw-guide-msg--status">{guide.messages.thinking}</p>}
        {failure && (
          <div className="hw-guide-msg hw-guide-msg--status">
            <p>{failure}</p>
            {failedBusy && <Matches sources={failedAnswer?.metadata?.sources ?? []} />}
          </div>
        )}
      </div>

      <form className="hw-guide-panel__form" onSubmit={onSubmit}>
        <label htmlFor="guide-question" className="hw-label">
          {guide.inputLabel}
        </label>
        <div className="hw-guide-panel__row">
          <input
            ref={inputRef}
            id="guide-question"
            className="hw-guide-panel__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_QUESTION_LENGTH}
            placeholder={guide.inputPlaceholder}
            autoComplete="off"
          />
          {pending ? (
            <button type="button" className="hw-btn hw-btn--small" onClick={() => void stop()}>
              Stop
            </button>
          ) : (
            <button type="submit" className="hw-btn hw-btn--small">
              Send
            </button>
          )}
        </div>
      </form>

      <div className="hw-guide-panel__footer">
        <Link className="hw-btn hw-btn--text" href="/guide" onClick={onJump}>
          {guide.howItWorksLink}
        </Link>
      </div>
    </section>
  );
}

/** The search-only fallback while the guide is busy (3.6): matching pages with excerpts. */
function Matches({ sources }: { sources: GuideSource[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="hw-guide-matches">
      <p>{guide.messages.matchesIntro}</p>
      <ul aria-label={guide.messages.matchesLabel}>
        {sources.map((source) => (
          <li key={source.n}>
            <Link href={source.url}>{source.title}</Link>
            {source.excerpt && <p>{source.excerpt}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AssistantMessage({ message }: { message: GuideMessage }) {
  const text = textOf(message);
  const sources = message.metadata?.sources ?? [];
  if (message.metadata?.busy) {
    return (
      <div className="hw-guide-msg hw-guide-msg--assistant">
        <p>{text}</p>
        <Matches sources={sources} />
      </div>
    );
  }
  const shown = text ? citedSources(text, sources) : [];
  return (
    <div className="hw-guide-msg hw-guide-msg--assistant">
      <Answer text={text} sources={sources} />
      {shown.length > 0 && (
        <div className="hw-guide-sources">
          <span className="hw-label">Sources:</span>
          <ul aria-label="Sources">
            {shown.map((source) => (
              <li key={source.n}>
                <Link href={source.url}>{source.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
