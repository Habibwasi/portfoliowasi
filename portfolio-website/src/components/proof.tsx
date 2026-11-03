import { about } from "@/content/about";
import { anchors } from "@/content/anchors";
import { ctfRecord, home, qaRecord, testimonial } from "@/content/site";
import { Testimonial } from "./hw";

/**
 * Trust signals on Home (C15, C16): one testimonial, then two outside records in a column, each
 * one line linking to the full version on About.
 */
export function Proof() {
  return (
    <section id={anchors.proof} className="hw-proof" aria-labelledby="proof-heading">
      <div className="hw-container hw-proof__inner">
        <h2 id="proof-heading" className="hw-label hw-proof__heading">
          {home.proof.eyebrow}
        </h2>
        <Testimonial testimonial={testimonial} />
        <div className="hw-proof__records">
          <div className="hw-proof__record">
            <h3 className="hw-label">{home.proof.qaHeading}</h3>
            <p className="hw-proof__line">{qaRecord.line}</p>
            <a className="hw-btn hw-btn--text hw-proof__more" href={`${about.path}#${about.anchors.qaRecord}`}>
              {home.proof.fullRecord}
            </a>
          </div>
          <div className="hw-proof__record">
            <h3 className="hw-label">{home.proof.ctfHeading}</h3>
            <p className="hw-proof__line hw-proof__line--sub">{ctfRecord.line}</p>
            <a className="hw-btn hw-btn--text hw-proof__more" href={`${about.path}#${about.anchors.security}`}>
              {home.proof.ctfMore}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
