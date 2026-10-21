import { isPlaceholder } from "@/content/placeholder";
import type { Testimonial as TestimonialData } from "@/content/types";
import { Placeholder } from "./placeholder";

/** One real quote from someone who worked with Habib. Never invented. */
export function Testimonial({ testimonial }: { testimonial: TestimonialData }) {
  const { quote, name, role } = testimonial;
  return (
    <figure className="hw-quote">
      {isPlaceholder(quote) ? (
        <Placeholder label={quote.label} />
      ) : (
        <blockquote className="hw-quote__text">{quote}</blockquote>
      )}
      <figcaption className="hw-quote__by">
        <span className="hw-quote__name">
          {isPlaceholder(name) ? <Placeholder label={name.label} inline /> : name}
        </span>
        <span className="hw-label">{role}</span>
      </figcaption>
    </figure>
  );
}
