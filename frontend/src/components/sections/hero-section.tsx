import { CinematicSlides, type CinematicSlide } from "../cinematic-slides";

// Illustrative Unsplash photography; each one was checked to show construction / infrastructure work.
const HERO_SLIDES: CinematicSlide[] = [
  { src: "1517089596392-fb9a9033e05b", alt: "Road construction site at golden hour", caption: "Road construction", position: "center 48%" },
  { src: "1429497419816-9ca5cfb4571a", alt: "Tower cranes over a multi-storey building under construction", caption: "Building construction", position: "center 40%" },
  { src: "1531834685032-c34bf0d84c77", alt: "Workers fixing steel reinforcement on a structure", caption: "Structural works", position: "center 35%" },
  { src: "1473042904451-00171c69419d", alt: "Multi-lane highway at dusk", caption: "Highways & infrastructure", position: "center 60%" },
  { src: "1508450859948-4e04fabaa4ea", alt: "Framework of a large building under construction", caption: "Project delivery", position: "center 40%" },
];

export function HeroSection() {
  return (
    <section className="hero">
      <CinematicSlides slides={HERO_SLIDES} className="hero-cine" hud hudClassName="hero-hud" interval={6500} eager />
      <div className="hero-shade"></div>
      <div className="container hero-content">
        <p className="eyebrow light"><span></span> BUILT ON TRUST. BUILT TO LAST.</p>
        <h1>Building the<br />way <em>forward.</em></h1>
        <p className="hero-copy">We shape the infrastructure that moves communities, connects opportunity and stands the test of time.</p>
        <div className="hero-actions"><a className="button button-lime" href="#projects">Explore our work <span>↗</span></a><a className="text-link light-link" href="#about">Discover Kalpbhumi <span>↓</span></a></div>
      </div>
      <div className="hero-bottom container"><span>REGISTERED GOVT &amp; PRIVATE CIVIL CONTRACTOR</span><span>VARANASI&nbsp;&nbsp; · &nbsp;&nbsp;INDIA</span></div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to about section">↓</a>
    </section>
  );
}
