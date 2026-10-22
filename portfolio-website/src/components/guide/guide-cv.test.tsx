import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { guide } from "@/content/guide";
import { GuideLauncher } from "./guide-launcher";

// Once the CV exists (7.1), download_cv is offered; here it already does.
vi.mock("@/content/site", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/content/site")>();
  return { ...actual, site: { ...actual.site, cv: "/cv/Habib-Ahmed-Wasi-CV.pdf" } };
});

afterEach(() => vi.unstubAllGlobals());

describe("download_cv (5.6)", () => {
  it("asks first: a confirm card in the chat, and nothing downloads until the visitor clicks", async () => {
    const response = createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({ type: "start", messageMetadata: { sources: [] } });
          writer.write({ type: "tool-input-available", toolCallId: "call-cv", toolName: "download_cv", input: {} });
        },
      }),
    });
    vi.stubGlobal("fetch", vi.fn(async () => response));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click");
    const user = userEvent.setup();
    render(<GuideLauncher />);
    await user.click(screen.getByRole("button", { name: guide.launcherLabel }));
    const dialog = await screen.findByRole("dialog", { name: guide.label });
    await user.type(within(dialog).getByRole("textbox", { name: guide.inputLabel }), "Can I have his CV?");
    await user.click(within(dialog).getByRole("button", { name: "Send" }));

    const card = await waitFor(() => within(dialog).getByRole("group", { name: "CV" }));
    expect(card).toHaveTextContent("Download Habib's CV (PDF)?");
    const download = within(card).getByRole("link", { name: "Download" });
    expect(download).toHaveAttribute("href", "/cv/Habib-Ahmed-Wasi-CV.pdf");
    expect(download).toHaveAttribute("download");
    expect(click).not.toHaveBeenCalled();
    await user.click(within(card).getByRole("button", { name: "No thanks" }));
    expect(within(dialog).queryByRole("group", { name: "CV" })).not.toBeInTheDocument();
  });
});
