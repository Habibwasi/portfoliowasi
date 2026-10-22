import { AiWorkflow } from "@/components/ai-workflow";
import { ContactSection } from "@/components/contact-section";
import { FeaturedWork } from "@/components/featured-work";
import { Hero } from "@/components/hero";
import { ObjectNav } from "@/components/object-nav";
import { Proof } from "@/components/proof";
import { Stack } from "@/components/stack";

/** Home: hero → object nav → featured work → how I build with AI → proof → stack → contact. */
export default function Home() {
  return (
    <>
      <Hero />
      <ObjectNav />
      <FeaturedWork />
      <AiWorkflow />
      <Proof />
      <Stack />
      <ContactSection />
    </>
  );
}
