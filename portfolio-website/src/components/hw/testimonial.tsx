import Image from "next/image";
import { isPlaceholder } from "@/content/placeholder";
import type { Testimonial as TestimonialData } from "@/content/types";
import { Placeholder } from "./placeholder";

/** One real quote from someone who worked with Habib. Never invented. */
export function Testimonial({ testimonial }: { testimonial: TestimonialData }) {
  const { quote, name, role, screenshot } = testimonial;
  if (screenshot) {
    return (
      <figure className="hw-quote hw-quote--screenshot">
        <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes="(max-width: 800px) 100vw, 765px" />
        <figcaption className="hw-quote__by">
          <span className="hw-quote__name">{isPlaceholder(name) ? <Placeholder label={name.label} inline /> : name}</span>
          <span className="hw-label">{screenshot.source}</span>
        </figcaption>
      </figure>
    );
  }
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
