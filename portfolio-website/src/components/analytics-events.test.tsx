import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEvents } from "./analytics-events";

function page() {
  return render(
    <>
      <AnalyticsEvents />
      <section id="contact">
        <a href="mailto:habibwasi9@gmail.com">Email me</a>
        <a href="https://github.com/Habibwasi">GitHub</a>
      </section>
    </>,
  );
}

afterEach(() => {
  delete window.umami;
});

describe("AnalyticsEvents (6.2)", () => {
  it("tracks an email click with where it happened", async () => {
    const track = vi.fn();
    window.umami = { track };
    const { getByText } = page();
    // jsdom can't follow mailto: links; cancel the navigation after the listener has seen the click.
    getByText("Email me").addEventListener("click", (e) => e.preventDefault());
    await userEvent.click(getByText("Email me"));
    expect(track).toHaveBeenCalledExactlyOnceWith("Email click", { place: "contact" });
  });

  it("ignores links that aren't one of the actions", async () => {
    const track = vi.fn();
    window.umami = { track };
    const { getByText } = page();
    getByText("GitHub").addEventListener("click", (e) => e.preventDefault());
    await userEvent.click(getByText("GitHub"));
    expect(track).not.toHaveBeenCalled();
  });

  it("never cancels the click", async () => {
    window.umami = { track: vi.fn() };
    const { getByText } = page();
    let prevented: boolean | undefined;
    const link = getByText("Email me");
    // Runs after the listener on document (capture), so it sees whether that one cancelled.
    link.addEventListener("click", (e) => {
      prevented = e.defaultPrevented;
      e.preventDefault();
    });
    await userEvent.click(link);
    expect(prevented).toBe(false);
  });

  it("does nothing while the tracker isn't loaded", async () => {
    const { getByText } = page();
    getByText("Email me").addEventListener("click", (e) => e.preventDefault());
    await expect(userEvent.click(getByText("Email me"))).resolves.toBeUndefined();
  });
});
