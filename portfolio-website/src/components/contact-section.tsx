import { anchors } from "@/content/anchors";
import { home, site } from "@/content/site";
import { ContactForm } from "./contact-form";
import { ActionButton, Button } from "./hw";

/**
 * The end of Home (C20, G4): email, CV and a call as equal secondary actions, then the
 * form, whose submit button is the one primary on this screen.
 */
export function ContactSection() {
  const mailto = `mailto:${site.email}`;
  const [firstLine, secondLine] = home.contact.heading.split(/ (?=in mind)/);

  return (
    <section id={anchors.contact} className="hw-container hw-section hw-contact" aria-labelledby="contact-heading">
      <span className="hw-label">{home.contact.eyebrow}</span>
      <h2 id="contact-heading" className="hw-contact__heading">
        {firstLine} <br />
        {secondLine}
      </h2>
      <p className="hw-contact__lede">{home.contact.subline}</p>
      <div className="hw-actions">
        <Button href={mailto}>Email me</Button>
        <ActionButton href={site.cv} download>
          View CV
        </ActionButton>
        <ActionButton href={site.calendly} target="_blank" rel="noopener noreferrer">
          Book a call
        </ActionButton>
        <a className="hw-btn hw-btn--text hw-contact__address" href={mailto}>
          {site.email}
        </a>
      </div>
      <div className="hw-contact__form">
        <h3 className="hw-h3">{home.contact.formHeading}</h3>
        <ContactForm email={site.email} />
      </div>
    </section>
  );
}
