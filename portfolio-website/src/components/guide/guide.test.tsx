import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { guide } from "@/content/guide";
import { GuideCharacter } from "./guide-character";
import { GuideLauncher } from "./guide-launcher";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
  delete document.documentElement.dataset.guide;
  document.querySelectorAll("body > section").forEach((section) => section.remove());
});

async function openPanel() {
  const user = userEvent.setup();
  render(<GuideLauncher />);
  await user.click(screen.getByRole("button", { name: guide.launcherLabel }));
  const dialog = await screen.findByRole("dialog", { name: guide.label });
  return { user, dialog };
}

function answerResponse(text: string, sources: { n: number; title: string; url: string }[]) {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: "start", messageMetadata: { sources } });
        writer.write({ type: "text-start", id: "t" });
        writer.write({ type: "text-delta", id: "t", delta: text });
        writer.write({ type: "text-end", id: "t" });
      },
    }),
  });
}

/** A canned answer that also calls one page tool (5.6). */
function toolResponse(text: string, toolName: string, input: unknown) {
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: "start", messageMetadata: { sources: [{ n: 1, title: "Contact", url: "/#contact" }] } });
        writer.write({ type: "text-start", id: "t" });
        writer.write({ type: "text-delta", id: "t", delta: text });
        writer.write({ type: "text-end", id: "t" });
        writer.write({ type: "tool-input-available", toolCallId: "call-1", toolName, input });
      },
    }),
  });
}

describe("GuideCharacter (5.6)", () => {
  it("takes a class for each of the five states, and the poke on top", () => {
    for (const state of ["idle", "listening", "thinking", "talking", "pointing"] as const) {
      const { container, unmount } = render(<GuideCharacter state={state} />);
      expect(container.querySelector("svg")).toHaveClass("hw-guide", `hw-guide--${state}`);
      unmount();
    }
    const { container } = render(<GuideCharacter state="talking" poke />);
    expect(container.querySelector("svg")).toHaveClass("hw-guide--talking", "hw-guide--poke");
    expect(container.querySelector(".hw-guide__pupils")).not.toBeNull();
    expect(container.querySelector(".hw-guide__mouth")).not.toBeNull();
  });
});

describe("guide states and page tools (5.6)", () => {
  afterEach(() => {
    document.getElementById("contact")?.remove();
    document.querySelectorAll(".hw-guide-target").forEach((el) => el.classList.remove("hw-guide-target"));
  });

  const header = () => document.querySelector(".hw-guide-panel__header .hw-guide")!;

  it("listens while the visitor types, then thinks while the answer is on its way", async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { user, dialog } = await openPanel();
    expect(header()).toHaveAttribute("data-state", "idle");
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "When");
    expect(header()).toHaveAttribute("data-state", "listening");
    await user.click(within(dialog).getByRole("button", { name: "Send" }));
    await waitFor(() => expect(header()).toHaveAttribute("data-state", "thinking"));
  });

  it("runs a scroll_to call: outlines the section, shows the pointer and says what it showed", async () => {
    const contact = document.createElement("section");
    contact.id = "contact";
    // jsdom lays nothing out; put the section on screen so the pointer shows.
    contact.getBoundingClientRect = () => ({ left: 100, top: 100, right: 700, bottom: 500, width: 600, height: 400, x: 100, y: 100, toJSON() {} });
    document.body.append(contact);
    fetchMock.mockResolvedValue(toolResponse("Here is how to reach him [1].", "scroll_to", { section: "contact" }));
    const { user, dialog } = await openPanel();
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "Take me to contact");
    await user.click(within(dialog).getByRole("button", { name: "Send" }));

    await waitFor(() => expect(contact).toHaveClass("hw-guide-target"));
    expect(document.querySelector("[data-guide-pointer]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("log", { hidden: true })).toHaveTextContent("Showing: Contact");
    // One request: the tool's output never goes back to the model.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does nothing on the page for a tool input outside its enum", async () => {
    fetchMock.mockResolvedValue(toolResponse("Sure.", "scroll_to", { section: "https://example.com" }));
    const { user, dialog } = await openPanel();
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "Go");
    await user.click(within(dialog).getByRole("button", { name: "Send" }));
    await waitFor(() => expect(within(dialog).getByRole("log")).toHaveTextContent("Sure."));
    expect(document.querySelector(".hw-guide-target")).toBeNull();
    expect(document.querySelector("[data-guide-pointer]")).toBeNull();
    expect(within(dialog).getByRole("log")).not.toHaveTextContent("Showing:");
  });
});

describe("GuideLauncher", () => {
  it("is a labelled button and renders no panel before it is used", () => {
    render(<GuideLauncher />);
    const button = screen.getByRole("button", { name: guide.launcherLabel });
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector("[data-guide-panel]")).toBeNull();
  });

  it("opens the AI assistant with focus in the question field", async () => {
    const { dialog } = await openPanel();
    expect(within(dialog).getByRole("heading", { name: guide.label })).toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByRole("textbox", { name: guide.inputLabel })).toHaveFocus());
    expect(document.documentElement.dataset.guide).toBe("open");
  });

  it("closes on Escape and gives focus back to the tile", async () => {
    const { user } = await openPanel();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: guide.launcherLabel })).toHaveFocus();
    expect(document.documentElement.dataset.guide).toBeUndefined();
  });

  it("closes with the close button", async () => {
    const { user, dialog } = await openPanel();
    await user.click(within(dialog).getByRole("button", { name: "Close the AI assistant" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("offers the tour as the primary action, then four quick jumps as links", async () => {
    const { dialog } = await openPanel();
    const jumps = within(dialog).getByRole("navigation", { name: guide.jumpsHeading });
    expect(within(jumps).getByRole("button", { name: guide.tourLabel })).toHaveClass("hw-btn--primary");
    const links = within(jumps).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Best project", "/work/ridly"],
      ["AI workflow", "/#ai"],
      ["Proof", "/#proof"],
      ["Contact", "/#contact"],
    ]);
    expect(within(dialog).getByRole("link", { name: guide.howItWorksLink })).toHaveAttribute("href", "/guide");
  });

  it("runs the tour: stop 1, Next to stop 2, Stop clears the outline", async () => {
    document.body.innerHTML += '<section id="intro"></section><section id="work"></section>';
    const { user, dialog } = await openPanel();
    await user.click(within(dialog).getByRole("button", { name: guide.tourLabel }));
    expect(within(dialog).getByText(/Stop 1 of 5/)).toBeInTheDocument();
    expect(document.getElementById("intro")).toHaveClass("hw-guide-target");

    await user.click(within(dialog).getByRole("button", { name: "Next stop" }));
    expect(within(dialog).getByText(/Stop 2 of 5/)).toBeInTheDocument();
    expect(document.getElementById("intro")).not.toHaveClass("hw-guide-target");
    expect(document.getElementById("work")).toHaveClass("hw-guide-target");

    await user.click(within(dialog).getByRole("button", { name: "Stop the tour" }));
    expect(within(dialog).queryByText(/Stop 2 of 5/)).not.toBeInTheDocument();
    expect(document.querySelector(".hw-guide-target")).toBeNull();
  });

  it("shows an answer with its cited source", async () => {
    fetchMock.mockResolvedValue(
      answerResponse("He is available full-time from February 2027 [1].", [
        { n: 1, title: "Availability", url: "/#intro" },
        { n: 2, title: "QA record", url: "/#proof" },
      ]),
    );
    const { user, dialog } = await openPanel();
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "When can he start?");
    await user.click(within(dialog).getByRole("button", { name: "Send" }));

    const log = within(dialog).getByRole("log");
    expect(await within(log).findByText(/February 2027/)).toBeInTheDocument();
    expect(within(log).getByText("When can he start?")).toBeInTheDocument();
    const sources = within(log).getByRole("list", { name: "Sources" });
    expect(within(sources).getByRole("link", { name: "Availability" })).toHaveAttribute("href", "/#intro");
    expect(within(sources).queryByRole("link", { name: "QA record" })).not.toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/guide");
    expect(JSON.parse(init.body).messages.at(-1).parts[0].text).toBe("When can he start?");
  });

  it("shows the busy state alone on a bare 429", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "busy" }, { status: 429 }));
    const { user, dialog } = await openPanel();
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "Hi{Enter}");
    expect(await within(dialog).findByText(guide.messages.busy)).toBeInTheDocument();
    expect(within(dialog).queryByRole("list", { name: guide.messages.matchesLabel })).not.toBeInTheDocument();
  });

  const matches = [
    { n: 1, title: "Availability", url: "/#intro", excerpt: "Open to roles now, full-time from February 2027." },
    { n: 2, title: "QA record", url: "/#proof", excerpt: "Tester at uTest." },
  ];

  it("while busy, lists the matching pages with links and excerpts (3.6)", async () => {
    fetchMock.mockResolvedValue(
      createUIMessageStreamResponse({
        stream: createUIMessageStream({
          execute: ({ writer }) => {
            writer.write({ type: "start", messageMetadata: { sources: matches, busy: true } });
            writer.write({ type: "text-start", id: "busy" });
            writer.write({ type: "text-delta", id: "busy", delta: guide.messages.busy });
            writer.write({ type: "text-end", id: "busy" });
          },
        }),
      }),
    );
    const { user, dialog } = await openPanel();
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "When can he start?{Enter}");

    const log = within(dialog).getByRole("log");
    expect(await within(log).findByText(guide.messages.busy)).toBeInTheDocument();
    expect(within(log).getByText(guide.messages.matchesIntro)).toBeInTheDocument();
    const list = within(log).getByRole("list", { name: guide.messages.matchesLabel });
    expect(within(list).getByRole("link", { name: "Availability" })).toHaveAttribute("href", "/#intro");
    expect(within(list).getByRole("link", { name: "QA record" })).toHaveAttribute("href", "/#proof");
    expect(within(list).getByText(matches[0].excerpt)).toBeInTheDocument();
    expect(within(log).queryByRole("list", { name: "Sources" })).not.toBeInTheDocument();
  });

  it("when Groq fails mid-answer, shows the busy state and the matches (3.6)", async () => {
    fetchMock.mockResolvedValue(
      createUIMessageStreamResponse({
        stream: createUIMessageStream({
          execute: ({ writer }) => {
            writer.write({ type: "start", messageMetadata: { sources: matches } });
            writer.write({ type: "error", errorText: "busy" });
          },
        }),
      }),
    );
    const { user, dialog } = await openPanel();
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "When can he start?{Enter}");

    expect(await within(dialog).findByText(guide.messages.busy)).toBeInTheDocument();
    const list = await within(dialog).findByRole("list", { name: guide.messages.matchesLabel });
    expect(within(list).getAllByRole("link")).toHaveLength(2);
  });

  it("caps the question at 500 characters", async () => {
    const { dialog } = await openPanel();
    expect(within(dialog).getByRole("textbox", { name: guide.inputLabel })).toHaveAttribute("maxLength", "500");
  });
});

describe("tour offer", () => {
  function scrollTo(y: number) {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    act(() => {
      fireEvent.scroll(window);
    });
  }

  it("appears once after the first scroll on Home, and never again after No thanks", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<GuideLauncher />);
    expect(screen.queryByText(guide.offer.text)).not.toBeInTheDocument();

    scrollTo(100);
    expect(screen.queryByText(guide.offer.text)).not.toBeInTheDocument();
    scrollTo(400);
    expect(screen.getByText(guide.offer.text)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: guide.offer.decline }));
    expect(screen.queryByText(guide.offer.text)).not.toBeInTheDocument();
    unmount();

    render(<GuideLauncher />);
    scrollTo(800);
    expect(screen.queryByText(guide.offer.text)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("starts the tour from the offer", async () => {
    document.body.innerHTML += '<section id="intro"></section>';
    const user = userEvent.setup();
    render(<GuideLauncher />);
    scrollTo(400);
    await user.click(screen.getByRole("button", { name: guide.offer.accept }));
    const dialog = await screen.findByRole("dialog", { name: guide.label });
    expect(within(dialog).getByText(/Stop 1 of 5/)).toBeInTheDocument();
  });
});
