import { anchors } from "@/content/anchors";
import { home, qaRecord, testimonial } from "@/content/site";
import { Testimonial } from "./hw";

/** Trust signals on Home (C15, C16): one testimonial and the QA record in one line. */
export function Proof() {
  return (
    <section id={anchors.proof} className="hw-proof" aria-labelledby="proof-heading">
      <div className="hw-container hw-proof__inner">
        <h2 id="proof-heading" className="hw-label hw-proof__heading">
          {home.proof.eyebrow}
        </h2>
        <Testimonial testimonial={testimonial} />
        <div className="hw-proof__qa">
          <h3 className="hw-label">{home.proof.qaHeading}</h3>
          <p className="hw-proof__line">{qaRecord.line}</p>
        </div>
      </div>
    </section>
  );
}
