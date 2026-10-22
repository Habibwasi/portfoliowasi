import { AiWorkflow } from "@/components/ai-workflow";
import { ContactSection } from "@/components/contact-section";
import { FeaturedWork } from "@/components/featured-work";
import { Hero } from "@/components/hero";
import { Proof } from "@/components/proof";
import { Stack } from "@/components/stack";

/** Home: hero → featured work → how I build with AI → proof → stack → contact. */
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <AiWorkflow />
      <Proof />
      <Stack />
      <ContactSection />
    </>
  );
}
