import { site } from "@/content/site";

/** GitHub and LinkedIn stay quiet text links (G5). The CI badge is the public proof of "test-driven". */
export function SiteFooter() {
  return (
    <footer className="hw-footer">
      <div className="hw-container hw-footer__inner">
        <p className="m-0">© {new Date().getFullYear()} {site.name}</p>
        <div className="hw-footer__links">
          <a href={site.links.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={site.links.repo} target="_blank" rel="noopener noreferrer">
            Source of this site
          </a>
          <a href={site.links.ciRuns} target="_blank" rel="noopener noreferrer" aria-label="CI status of this site">
            {/* eslint-disable-next-line @next/next/no-img-element -- external SVG badge, not worth image optimisation */}
            <img className="hw-footer__badge" src={site.links.ciBadge} alt="CI status" width={110} height={20} loading="lazy" decoding="async" />
          </a>
        </div>
      </div>
    </footer>
  );
}
