import { CinematicSlides, type CinematicSlide } from "../cinematic-slides";

const ABOUT_SLIDES: CinematicSlide[] = [
  { src: "1541888946425-d81bb19240f5", alt: "Engineers and site team inspecting a large construction site" },
  { src: "1626885930974-4b69aa21bbf9", alt: "Engineers in safety gear reviewing work on site" },
  { src: "1589939705384-5185137a7f0f", alt: "Skilled worker cutting timber on a construction site" },
];

export function AboutSection() {
  return (
    <section className="section about-section" id="about"><div className="container about-grid">
                <div className="about-visual reveal"><div className="about-cine"><CinematicSlides slides={ABOUT_SLIDES} interval={5500} hud hudClassName="about-hud" sizes="(max-width: 900px) 100vw, 50vw" /></div><div className="image-caption"><span className="caption-mark caption-logo"><img src="/kalpbhumi-logo.png" alt="" /></span><span>Thoughtful engineering.<br />Real-world impact.</span></div></div>
                <div className="about-copy reveal"><p className="eyebrow"><span></span> WHO WE ARE</p><h2>We build with purpose.<br /><em>We deliver with pride.</em></h2><p className="body-copy" data-company-field="short_profile">Kalpbhumi Infra is a multidisciplinary construction and civil engineering company committed to creating dependable infrastructure. From the first survey to the final handover, we bring clear thinking, skilled people and rigorous execution to every site.</p><p className="body-copy">Our work is grounded in safety, transparency and a belief that the best projects make life better for the people who use them.</p><a href="#contact" className="text-link">More about our approach <span>↗</span></a><div className="values"><div><b>01</b><span>Safety first,<br />always</span></div><div><b>02</b><span>Built around<br />people</span></div><div><b>03</b><span>Accountable<br />delivery</span></div></div></div>
              </div><div className="container about-pillars"><article><span>OUR HISTORY</span><h3>Built around dependable delivery.</h3><p data-company-field="history">Our company story, milestones and verified experience belong here. Add the approved company history from Company profile in the admin panel.</p></article><article><span>OUR MISSION</span><h3>Build useful infrastructure, responsibly.</h3><p data-company-field="mission">We plan and deliver civil works with care for safety, quality, people and the communities that depend on each project.</p></article><article><span>OUR VISION</span><h3>Make every connection count.</h3><p data-company-field="vision">We aim to be a trusted engineering partner whose work helps communities grow and infrastructure endure.</p></article><article><span>OUR EXPERIENCE</span><h3>Practical knowledge on every site.</h3><p data-company-field="experience">Add verified project experience, sectors served and delivery capabilities in the company profile.</p></article><article><span>OUR EXPERTISE</span><h3>From concept to closeout.</h3><p data-company-field="expertise">Multidisciplinary engineering, architectural drawings, procurement, site execution, quality assurance and maintenance coordination.</p></article></div></section>
  );
}
