import { ContactSection } from "@/components/contact-section";
import { FeaturedWork } from "@/components/featured-work";
import { Hero } from "@/components/hero";
import { Proof } from "@/components/proof";

/** Home in Phase 1: hero → featured work → proof → contact. AI workflow and Stack join in Phase 4. */
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <Proof />
      <ContactSection />
    </>
  );
}
