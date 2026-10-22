"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useReducer, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { guide } from "@/content/guide";
import { site } from "@/content/site";
import { Answer, citedSources, type GuideSource } from "@/lib/guide/answer";
import { MAX_QUESTION_LENGTH } from "@/lib/guide/config";
import { LISTENING_MS, POINTING_MS, guideState } from "@/lib/guide/state";
import { toolAction, type ToolAction, type ToolName } from "@/lib/guide/tools";
import { initialTour, tourReducer } from "@/lib/guide/tour";
import { PLAY_DEMO_EVENT } from "../video-facade";
import { GuideCharacter } from "./guide-character";

/** What the browser reports for a page tool; shown in the chat, never sent to the model (5.6). */
type ToolOutput = { shown: string | null };
type GuideTools = Record<ToolName, { input: unknown; output: ToolOutput }>;
type GuideMessage = UIMessage<{ sources?: GuideSource[]; busy?: boolean }, never, GuideTools>;
type ShowAction = Extract<ToolAction, { kind: "show" }>;

const TARGET_CLASS = "hw-guide-target";
const stops = guide.tour.stops;

const matches = (query: string) => (typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false);
const isDocked = () => matches("(min-width: 1024px)");
const reducedMotion = () => matches("(prefers-reduced-motion: reduce)");

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
    target.scrollIntoView?.({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    return () => target.classList.remove(TARGET_CLASS);
  }, [tour.status, tour.step, pathname, router]);

  useEffect(() => {
    if (tour.status !== "running") return;
    const timer = setTimeout(() => dispatch({ type: "tick", stops: stops.length }), guide.tour.stepSeconds * 1000);
    return () => clearTimeout(timer);
  }, [tour.status, tour.step]);

  return { tour, act };
}

/** Waits (up to 4 s) for an element on a page the router may still be loading. */
function waitForElement(path: string, id: string): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const until = performance.now() + 4000;
    const check = () => {
      const el = window.location.pathname === path ? document.getElementById(id) : null;
      if (el || performance.now() > until) resolve(el);
      else requestAnimationFrame(check);
    };
    check();
  });
}

/** Runs the model's page tools (5.6): go to the page, scroll, outline the target and point at it. */
function usePageTools(onClose: () => void) {
  const pathname = usePathname();
  const router = useRouter();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const run = useRef(0);

  useEffect(() => {
    if (!target) return;
    target.classList.add(TARGET_CLASS);
    const timer = setTimeout(() => setTarget(null), POINTING_MS);
    return () => {
      clearTimeout(timer);
      target.classList.remove(TARGET_CLASS);
    };
  }, [target]);

  const show = async (action: ShowAction) => {
    const current = ++run.current;
    setTarget(null);
    // On a phone the sheet would cover the target; the conversation is kept for when it reopens.
    if (!isDocked()) onClose();
    if (pathname !== action.path) router.push(action.path);
    const el = await waitForElement(action.path, action.id);
    if (!el || current !== run.current) return;
    el.scrollIntoView?.({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    setTarget(el);
    if (action.play) el.querySelector("a.hw-video")?.dispatchEvent(new Event(PLAY_DEMO_EVENT));
  };

  const clear = () => {
    run.current++;
    setTarget(null);
  };

  return { target, show, clear };
}

/**
 * The pointer (5.6, GD6): a copy of the guide that hops onto the top-left corner of the target
 * and keeps nudging toward it. Decorative; the chat says in words what was shown.
 */
function Pointer({ target }: { target: HTMLElement }) {
  const [box, setBox] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    let frame = 0;
    const place = () => {
      const rect = target.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      setBox((previous) => {
        if (!onScreen) return null;
        const left = Math.round(Math.min(Math.max(8, rect.left - 20), window.innerWidth - 80));
        const top = Math.round(Math.min(Math.max(8, rect.top - 36), window.innerHeight - 56));
        return previous?.left === left && previous.top === top ? previous : { left, top };
      });
      frame = requestAnimationFrame(place);
    };
    place();
    return () => cancelAnimationFrame(frame);
  }, [target]);

  if (!box) return null;
  return createPortal(
    <div className="hw-guide-pointer" style={box} aria-hidden="true" data-guide-pointer>
      <GuideCharacter state="pointing" />
    </div>,
    document.body,
  );
}

/**
 * The opened guide (3.2, 3.3, 5.6): "Jump to" row, the tour and the chat. A non-modal dialog,
 * docked on desktop and a bottom sheet on phones; a plain chat log for screen readers (GD8).
 * The header character shows what the chat is doing, and the model's page tools run here.
 */
export default function GuidePanel({ open, onClose, tourRequest }: { open: boolean; onClose: () => void; tourRequest: number }) {
  const [transport] = useState(() => new DefaultChatTransport<GuideMessage>({ api: "/api/guide" }));
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [poke, setPoke] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  // Follow the newest message, unless the visitor has scrolled up to read.
  const following = useRef(true);
  const { tour, act } = useTour(tourRequest, open);
  const tools = usePageTools(onClose);

  // The browser runs each tool and records what it showed; the chat doesn't go back to the model.
  const { messages, sendMessage, status, error, stop, addToolOutput } = useChat<GuideMessage>({
    transport,
    onToolCall: ({ toolCall }) => {
      const action = toolAction(toolCall.toolName, toolCall.input);
      if (action?.kind === "show") void tools.show(action);
      if (action?.kind === "tour") act("start");
      void addToolOutput({ tool: toolCall.toolName as ToolName, toolCallId: toolCall.toolCallId, output: { shown: action?.label ?? null } });
    },
  });
  const touring = tour.status !== "idle";
  const pending = status === "submitted" || status === "streaming";
  const state = guideState({ status, typing, pointing: tools.target !== null });

  // Opening pokes it awake (GD2) and puts focus in the field.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() => setPoke(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!poke) return;
    const timer = setTimeout(() => setPoke(false), 650);
    return () => clearTimeout(timer);
  }, [poke]);

  useEffect(() => {
    if (!typing) return;
    const timer = setTimeout(() => setTyping(false), LISTENING_MS);
    return () => clearTimeout(timer);
  }, [typing, input]);

  const pokeGuide = () => {
    setPoke(false);
    requestAnimationFrame(() => setPoke(true));
  };

  const close = () => {
    tools.clear();
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || pending) return;
    following.current = true;
    void sendMessage({ text: question });
    setInput("");
    setTyping(false);
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

  useEffect(() => {
    const log = logRef.current;
    if (open && log && following.current) log.scrollTop = log.scrollHeight;
  }, [open, messages, status, failure]);

  const onLogScroll = () => {
    const log = logRef.current!;
    following.current = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
  };

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
        {/* A click is a poke (GD2). Decorative, so it isn't a button. */}
        <span className="hw-guide-panel__character" onClick={pokeGuide} aria-hidden="true">
          <GuideCharacter className="hw-guide--small" state={state} poke={poke} />
        </span>
        <h2 id="guide-title" className="hw-guide-panel__title">
          {guide.label}
        </h2>
        <button type="button" className="hw-guide-panel__close" aria-label="Close the AI assistant" onClick={close}>
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

      <div ref={logRef} className="hw-guide-panel__log" role="log" aria-live="polite" aria-busy={pending} aria-label="Conversation" onScroll={onLogScroll}>
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
            onChange={(e) => {
              setInput(e.target.value);
              setTyping(true);
            }}
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

      {tools.target && <Pointer target={tools.target} />}

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
  const toolParts = message.parts.filter((part) => part.type.startsWith("tool-"));
  if (!text && toolParts.length === 0) return null;
  return (
    <div className="hw-guide-msg hw-guide-msg--assistant">
      {text && <Answer text={text} sources={sources} />}
      {toolParts.map((part, i) => (
        <ToolLine key={i} part={part} />
      ))}
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

/** One plain line for each tool the guide ran, so screen readers hear what moved (5.6). */
function ToolLine({ part }: { part: GuideMessage["parts"][number] }) {
  if (!("state" in part) || part.state !== "output-available") return null;
  const output = part.output as ToolOutput | undefined;
  if (!output?.shown) return null;
  if (part.type === "tool-download_cv") return <CvOffer />;
  return <p className="hw-guide-tool-line">Showing: {output.shown}</p>;
}

/** download_cv asks first (GD6): nothing downloads until the visitor clicks. */
function CvOffer() {
  const [declined, setDeclined] = useState(false);
  if (declined || typeof site.cv !== "string") return null;
  return (
    <div className="hw-guide-cv" role="group" aria-label="CV">
      <p>Download Habib&apos;s CV (PDF)?</p>
      <div className="hw-guide-offer__actions">
        <a className="hw-btn hw-btn--primary hw-btn--small" href={site.cv} download>
          Download
        </a>
        <button type="button" className="hw-btn hw-btn--text" onClick={() => setDeclined(true)}>
          No thanks
        </button>
      </div>
    </div>
  );
}
