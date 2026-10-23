import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CvViewer, cvPages } from "./cv-viewer";

const cv = "/cv/Habib-Ahmed-Wasi-CV.pdf";

describe("CV viewer", () => {
  it("opens on a CV link instead of downloading, with the download at the top", async () => {
    // jsdom has no showModal; open the dialog the way the browser would.
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.showModal = showModal;
    render(
      <>
        <a href={cv} download>
          View CV
        </a>
        <CvViewer />
      </>,
    );

    await userEvent.click(screen.getByRole("link", { name: "View CV" }));
    expect(showModal).toHaveBeenCalledOnce();
    const viewer = screen.getByRole("dialog", { name: "Habib Ahmed Wasi's CV" });
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute("href", cv);
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute("download");
    expect(viewer.querySelectorAll("img")).toHaveLength(cvPages.length);
  });
});
