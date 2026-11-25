import { CinematicSlides, type CinematicSlide } from "../cinematic-slides";
import { COMPANY_NAME } from "../../lib/site-config";

const ABOUT_SLIDES: CinematicSlide[] = [
  { src: "1541888946425-d81bb19240f5", alt: "Engineers and site team inspecting a large construction site" },
  { src: "1626885930974-4b69aa21bbf9", alt: "Engineers in safety gear reviewing work on site" },
  { src: "1589939705384-5185137a7f0f", alt: "Skilled worker cutting timber on a construction site" },
];

export function AboutSection() {
  return (
    <section className="section about-section" id="about"><div className="container about-grid">
                <div className="about-visual reveal"><div className="about-cine"><CinematicSlides slides={ABOUT_SLIDES} interval={5500} hud hudClassName="about-hud" sizes="(max-width: 900px) 100vw, 50vw" /></div><div className="image-caption"><span className="caption-mark caption-logo"><img src="/kalpbhumi-logo.png" alt="" /></span><span>Thoughtful engineering.<br />Real-world impact.</span></div></div>
                <div className="about-copy reveal"><p className="eyebrow"><span></span> WHO WE ARE</p><h2>We build with purpose.<br /><em>We deliver with pride.</em></h2><p className="body-copy" data-company-field="short_profile">{COMPANY_NAME} undertakes building construction, road infrastructure, renovation and civil engineering works. Explore the company profile below for project records and management details.</p><p className="body-copy">Our work is grounded in safety, transparency and a belief that the best projects make life better for the people who use them.</p><a href="#projects" className="text-link">View the company profile <span>↗</span></a><div className="values"><div><b>01</b><span>Safety first,<br />always</span></div><div><b>02</b><span>Built around<br />people</span></div><div><b>03</b><span>Accountable<br />delivery</span></div></div></div>
              </div><div className="container about-pillars"><article><span>OUR HISTORY</span><h3>Built around dependable delivery.</h3><p data-company-field="history">Company history, management and project information are included in the company profile.</p></article><article><span>OUR MISSION</span><h3>Build useful infrastructure, responsibly.</h3><p data-company-field="mission">Deliver civil construction works with attention to practical coordination and quality.</p></article><article><span>OUR VISION</span><h3>Make every connection count.</h3><p data-company-field="vision">Build infrastructure that serves communities and stands the test of time.</p></article><article><span>OUR EXPERIENCE</span><h3>Practical knowledge on every site.</h3><p data-company-field="experience">Browse the company profile for project records and work examples.</p></article><article><span>OUR EXPERTISE</span><h3>From concept to closeout.</h3><p data-company-field="expertise">The portfolio includes building construction, road infrastructure, renovation and drawing services.</p></article></div></section>
  );
}
