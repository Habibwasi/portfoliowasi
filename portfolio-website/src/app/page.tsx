import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { anchors } from "@/content/anchors";
// Legacy sections: kept rendering on the new palette until Phase 1 replaces them.
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id={anchors.main} className="w-full">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
