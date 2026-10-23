import { AiWorkflow } from "@/components/ai-workflow";
import { ContactSection } from "@/components/contact-section";
import { FeaturedWork } from "@/components/featured-work";
import { Hero } from "@/components/hero";
import { ObjectNav } from "@/components/object-nav";
import { Proof } from "@/components/proof";
import { Stack } from "@/components/stack";

/**
 * Home: hero → object nav → featured work → how I build with AI → proof → stack → contact.
 * The hero and object nav fill the first screen on their own; the sections start below it.
 */
export default function Home() {
  return (
    <>
      <div className="hw-landing">
        <Hero />
        <ObjectNav />
      </div>
      <FeaturedWork />
      <AiWorkflow />
      <Proof />
      <Stack />
      <ContactSection />
    </>
  );
}
