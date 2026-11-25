import { SiteHeader } from "../components/layout/site-header";
import { SiteFooter } from "../components/layout/site-footer";
import { SiteInteractions } from "../components/site-interactions";
import { HeroSection } from "../components/sections/hero-section";
import { WhyChooseSection } from "../components/sections/why-choose-section";
import { AboutSection } from "../components/sections/about-section";
import { ServicesSection } from "../components/sections/services-section";
import { ProjectsSection } from "../components/sections/projects-section";
import { GallerySection } from "../components/sections/gallery-section";
import { ProcessSection } from "../components/sections/process-section";
import { TendersSection } from "../components/sections/tenders-section";
import { TeamSection } from "../components/sections/team-section";
import { ContactSection } from "../components/sections/contact-section";

export default function HomePage() {
  return (
    <SiteInteractions>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <WhyChooseSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <GallerySection />
        <ProcessSection />
        <TendersSection />
        <TeamSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </SiteInteractions>
  );
}
