import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { aiSkills, frameworkSkills, languageSkills } from "@/content/skills";
import { placeholder } from "@/content/placeholder";
import { ContactForm } from "./contact-form";
import { ContactSection } from "./contact-section";
import { FeaturedWork } from "./featured-work";
import { Hero } from "./hero";
import { ObjectNav } from "./object-nav";
import { AiWorkflow } from "./ai-workflow";
import { ActionButton } from "./hw";
import { Proof } from "./proof";
import { Stack } from "./stack";

describe("Hero", () => {
  it("shows the name as the only h1, the intro and availability", () => {
    render(<Hero />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Habib Ahmed Wasi");
    expect(screen.getByText(/graduating from SDU in January 2027/)).toBeInTheDocument();
    expect(screen.getByText(/Kolding, Denmark/)).toBeInTheDocument();
  });

  it("leads to the work, with the CV as the secondary action", () => {
    render(<Hero />);
    const primary = screen.getByRole("link", { name: "View case studies" });
    expect(primary).toHaveAttribute("href", "#work");
    expect(primary).toHaveClass("hw-btn--primary");
    // The CV is still a placeholder.
    expect(screen.getByText("[CV PDF]")).toBeInTheDocument();
  });
});

describe("Hero motion (5.1, 5.2, 5.5)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
  });

  it("keeps the name's accessible name, with one hidden span per letter", () => {
    render(<Hero />);
    const name = screen.getByRole("heading", { level: 1, name: "Habib Ahmed Wasi" });
    const letters = name.querySelectorAll(".hw-name__ch");
    expect([...letters].map((l) => l.textContent).join("")).toBe("HabibAhmedWasi");
    for (const word of name.querySelectorAll(".hw-name__word")) expect(word).toHaveAttribute("aria-hidden", "true");
  });

  it("skips the animation under reduced motion and tells the physics the name has settled", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), addEventListener() {}, removeEventListener() {} }));
    const settled = vi.fn();
    window.addEventListener("hw:name-settled", settled, { once: true });
    render(<Hero />);
    const name = screen.getByRole("heading", { level: 1 });
    expect(name).toHaveAttribute("data-settled");
    expect(name).not.toHaveClass("is-lifting");
    expect(settled).toHaveBeenCalledOnce();
  });

  it("renders the five letter tiles as a still, hidden pile with one signal tile", () => {
    render(<Hero />);
    const art = document.querySelector(".hw-hero__art")!;
    expect(art).toHaveAttribute("data-physics", "off");
    const layer = art.querySelector(".hw-letters")!;
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect([...layer.querySelectorAll(".hw-letter")].map((t) => t.textContent)).toEqual(["H", "W", "A", "S", "I"]);
    expect(layer.querySelectorAll(".hw-letter--signal")).toHaveLength(1);
  });

  it("shows the portrait slot as a labelled placeholder until it is drawn", () => {
    render(<Hero />);
    expect(screen.getByText("[Line-art portrait]")).toBeInTheDocument();
  });
});

describe("ObjectNav (5.4)", () => {
  it("leads to the sections, hidden from assistive tech and out of the tab order", () => {
    render(<ObjectNav />);
    const row = document.querySelector(".hw-objects")!;
    expect(row).toHaveAttribute("aria-hidden", "true");
    const links = [...row.querySelectorAll("a")];
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Work", "#work"],
      ["About", "/about"],
      ["Contact", "#contact"],
    ]);
    for (const link of links) expect(link).toHaveAttribute("tabindex", "-1");
  });
});

describe("ActionButton", () => {
  it("renders a link when the target exists", () => {
    render(<ActionButton href="/cv/cv.pdf" download>Download CV</ActionButton>);
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("download");
  });

  it("renders a visible placeholder, not a dead link, when the target is missing", () => {
    render(<ActionButton href={placeholder("Calendly URL")}>Book a call</ActionButton>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("[Calendly URL]")).toHaveAttribute("data-placeholder", "Calendly URL");
  });
});

describe("FeaturedWork", () => {
  it("lists the featured three in order, each linking to its case study", () => {
    render(<FeaturedWork />);
    const section = document.getElementById("work")!;
    const titles = within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles.slice(0, 3)).toEqual([
      "TopicTrail, a memory for what you browse",
      "Ridly, carpooling for Android and iOS",
      "Validation Portal, research for founders",
    ]);
    expect(screen.getByRole("link", { name: /TopicTrail/ })).toHaveAttribute("href", "/work/topictrail");
    expect(screen.getByRole("link", { name: /Validation Portal, research/ })).toHaveAttribute("href", "/work/validation-portal");
    expect(screen.getByRole("link", { name: /Ridly, carpooling/ })).toHaveAttribute("href", "/work/ridly");
    expect(screen.queryByText("Case study coming")).not.toBeInTheDocument();
  });

  it("lists More projects, linking only those with a public repo", () => {
    render(<FeaturedWork />);
    const list = screen.getByRole("list", { name: "More projects" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);
    expect(within(list).getByRole("link", { name: /AI_Workflow_Global/ })).toHaveAttribute(
      "href",
      "https://github.com/Habibwasi/AI_Workflow_Global",
    );
    expect(within(list).queryByRole("link", { name: /Deskinct/ })).not.toBeInTheDocument();
    expect(within(list).getByText("Deskinct")).toBeInTheDocument();
  });
});

describe("Proof", () => {
  it("shows the testimonial slot and the one-line QA record", () => {
    render(<Proof />);
    expect(screen.getByText("Team leader, Just Eat")).toBeInTheDocument();
    expect(screen.getByText(/92\.26%/)).toBeInTheDocument();
    expect(screen.getByText(/268 test cycles/)).toBeInTheDocument();
  });

  it("links to the full QA record on About", () => {
    render(<Proof />);
    expect(screen.getByRole("link", { name: "See the full record" })).toHaveAttribute("href", "/about#qa-record");
  });
});

describe("ContactSection", () => {
  it("offers email, CV and a call, with the form submit as the one primary", () => {
    render(<ContactSection />);
    const section = document.getElementById("contact")!;
    expect(within(section).getByRole("heading", { level: 2, name: "Have a role in mind?" })).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "Email me" })).toHaveAttribute("href", "mailto:habibwasi9@gmail.com");
    expect(within(section).getByText("[CV PDF]")).toBeInTheDocument();
    expect(within(section).getByText("[Calendly URL]")).toBeInTheDocument();
    const primaries = section.querySelectorAll(".hw-btn--primary");
    expect(primaries).toHaveLength(1);
    expect(primaries[0]).toHaveTextContent("Send message");
  });
});

describe("ContactForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function fillAndSend() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Message"), "We have a graduate role on our platform team.");
    await user.click(screen.getByRole("button", { name: "Send message" }));
  }

  it("shows a pending state, then success", async () => {
    let resolve!: (r: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm email="habibwasi9@gmail.com" />);
    await fillAndSend();

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    const sent = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(sent).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", website: "" });

    resolve(Response.json({ ok: true }));
    expect(await screen.findByRole("status")).toHaveTextContent(/Thanks, your message is on its way/);
    expect(screen.queryByRole("button", { name: "Send message" })).not.toBeInTheDocument();
  });

  it("shows server field errors next to the field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "Please check the highlighted fields.", fieldErrors: { email: ["Please enter a valid email address."] } }, { status: 400 }),
      ),
    );
    render(<ContactForm email="habibwasi9@gmail.com" />);
    await fillAndSend();

    const email = screen.getByLabelText("Email");
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveAccessibleDescription("Please enter a valid email address.");
  });

  it("shows an error with the email address as a fallback", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "The message couldn't be sent." }, { status: 502 })));
    render(<ContactForm email="habibwasi9@gmail.com" />);
    await fillAndSend();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("The message couldn't be sent.");
    expect(within(alert).getByRole("link", { name: "habibwasi9@gmail.com" })).toHaveAttribute("href", "mailto:habibwasi9@gmail.com");
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });

  it("handles a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    render(<ContactForm email="habibwasi9@gmail.com" />);
    await fillAndSend();
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't reach the server/i);
  });
});

describe("AiWorkflow", () => {
  it("shows the five steps in order, with the human review loop said in text", () => {
    render(<AiWorkflow />);
    const section = document.getElementById("ai")!;
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("AI-native, human in charge");
    const steps = within(section).getByRole("list", { name: "Agentic SDLC workflow" });
    const names = within(steps).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(["Plan", "Human review", "Build", "Test", "Ship"]);
    expect(within(steps).getByText(/HITL/)).toBeInTheDocument();
    expect(section).toHaveTextContent(/Rejected: back to Plan to revise/);
  });

  it("links every AI toolkit tag to the project that proves it (AI6)", () => {
    render(<AiWorkflow />);
    const toolkit = screen.getByRole("list", { name: "AI toolkit I use every week" });
    const links = within(toolkit).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(aiSkills.map((s) => s.name));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(aiSkills.map((s) => s.proofs[0].href));
    for (const link of links) expect(link).toHaveClass("hw-tag--ai");
  });
});

describe("Stack", () => {
  it("shows every skill as a toggle in three groups, with the first AI tool selected on load", () => {
    render(<Stack />);
    const ai = screen.getByRole("group", { name: "AI tools" });
    const languages = screen.getByRole("group", { name: "Languages and data" });
    const frameworks = screen.getByRole("group", { name: "Frameworks and tools" });
    expect(within(ai).getAllByRole("button")).toHaveLength(aiSkills.length);
    expect(within(languages).getAllByRole("button")).toHaveLength(languageSkills.length);
    expect(within(frameworks).getAllByRole("button")).toHaveLength(frameworkSkills.length);
    expect(within(ai).getByRole("button", { name: aiSkills[0].name })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(`Selected · ${aiSkills[0].name}`)).toBeInTheDocument();
  });

  it("spaces each ring's tags evenly around the orbit (5.3)", () => {
    render(<Stack />);
    const items = screen.getByRole("group", { name: "Languages and data" }).querySelectorAll<HTMLElement>(".hw-orbit__item");
    expect([...items].map((el) => el.style.getPropertyValue("--a"))).toEqual(["0deg", "60deg", "120deg", "180deg", "240deg", "300deg"]);
  });

  it("pauses and resumes the rotation", async () => {
    const user = userEvent.setup();
    render(<Stack />);
    const toggle = screen.getByRole("button", { name: "Pause rotation" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector(".hw-orbit")).toHaveAttribute("data-paused");
  });

  it("switches the proofs on click and by keyboard", async () => {
    const user = userEvent.setup();
    render(<Stack />);
    const swift = screen.getByRole("button", { name: "Swift" });
    await user.click(swift);
    expect(swift).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: aiSkills[0].name })).toHaveAttribute("aria-pressed", "false");
    const panel = screen.getByRole("region", { name: "Where I used Swift" });
    expect(within(panel).getByRole("link", { name: "Ridly" })).toHaveAttribute("href", "/work/ridly");

    const python = screen.getByRole("button", { name: "Python" });
    python.focus();
    await user.keyboard("{Enter}");
    expect(python).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Selected · Python")).toBeInTheDocument();
  });
});
