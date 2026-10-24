import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { VideoFacade } from "./video-facade";

const id = "dQw4w9WgXcQ";

describe("VideoFacade (2.3)", () => {
  it("is a plain link to YouTube until clicked, with nothing loaded from YouTube", () => {
    render(<VideoFacade videoId={id} title="Ridly demo" />);
    const play = screen.getByRole("link", { name: "Play video: Ridly demo" });
    expect(play).toHaveAttribute("href", `https://www.youtube.com/watch?v=${id}`);
    expect(document.querySelector("iframe")).toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  it("uses the poster when one is given", () => {
    render(<VideoFacade videoId={id} title="Ridly demo" poster="/work/ridly/demo-poster.png" />);
    expect(document.querySelector("img")?.getAttribute("src")).toContain("demo-poster.png");
  });

  it("swaps in the privacy-enhanced player with captions on, and moves focus to it", async () => {
    const user = userEvent.setup();
    render(<VideoFacade videoId={id} title="Ridly demo" />);
    await user.click(screen.getByRole("link", { name: "Play video: Ridly demo" }));

    const player = screen.getByTitle("Ridly demo");
    expect(player.tagName).toBe("IFRAME");
    const src = new URL(player.getAttribute("src")!);
    expect(src.origin).toBe("https://www.youtube-nocookie.com");
    expect(src.pathname).toBe(`/embed/${id}`);
    expect(src.searchParams.get("cc_load_policy")).toBe("1");
    expect(src.searchParams.get("cc_lang_pref")).toBe("en");
    expect(src.searchParams.get("autoplay")).toBe("1");
    expect(player).toHaveFocus();
    expect(screen.queryByRole("link", { name: /Play video/ })).not.toBeInTheDocument();
  });

  it("can be started from the keyboard", async () => {
    const user = userEvent.setup();
    render(<VideoFacade videoId={id} title="Ridly demo" />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Play video: Ridly demo" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByTitle("Ridly demo").tagName).toBe("IFRAME");
  });
});
