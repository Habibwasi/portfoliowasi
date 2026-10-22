import type { Metadata } from "next";
import { Button } from "@/components/hw";
import { about } from "@/content/about";
import { anchors, hash } from "@/content/anchors";

// Next adds noindex to every 404 itself.
export const metadata: Metadata = { title: "Page not found" };

/** Unknown URLs (6.1): say so and lead back to the work (G4), instead of Next's bare "404". */
export default function NotFound() {
  return (
    <div className="hw-container">
      <header className="hw-cs-header">
        <span className="hw-label">404</span>
        <h1 className="hw-cs-header__title">This page doesn&apos;t exist</h1>
        <p className="hw-cs-header__lede">The link may be old, or the address mistyped. The work is one click away.</p>
        <div className="hw-actions">
          <Button variant="primary" href={`/${hash(anchors.work)}`}>
            See the work
          </Button>
          <Button href={about.path}>About</Button>
          <Button variant="text" href="/">
            Home
          </Button>
        </div>
      </header>
    </div>
  );
}
