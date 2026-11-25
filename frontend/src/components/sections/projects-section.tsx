"use client";

import { useEffect, useRef, useState } from "react";

export function ProjectsSection() {
  const profilePages = Array.from({ length: 10 }, (_, index) => index + 1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [autoSwipe, setAutoSwipe] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateAutoSwipe = () => setAutoSwipe(!reducedMotion.matches);
    updateAutoSwipe();
    reducedMotion.addEventListener("change", updateAutoSwipe);
    return () => reducedMotion.removeEventListener("change", updateAutoSwipe);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !autoSwipe) return;

    let visible = !("IntersectionObserver" in window);
    let lastInteraction = 0;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
      }, { threshold: 0.1 })
      : null;
    observer?.observe(carousel);

    const noteInteraction = () => { lastInteraction = Date.now(); };
    carousel.addEventListener("pointerdown", noteInteraction);
    carousel.addEventListener("wheel", noteInteraction, { passive: true });
    carousel.addEventListener("keydown", noteInteraction);

    const timer = window.setInterval(() => {
      if (!visible || document.hidden || (canHover && carousel.matches(":hover"))
        || carousel.contains(document.activeElement) || Date.now() - lastInteraction < 5000) return;

      const cards = Array.from(carousel.querySelectorAll<HTMLElement>(".profile-page-card"));
      const carouselLeft = carousel.getBoundingClientRect().left;
      const next = cards.find((card) => card.getBoundingClientRect().left > carouselLeft + 8);
      const nextLeft = next
        ? carousel.scrollLeft + next.getBoundingClientRect().left - carouselLeft
        : 0;
      const left = next && nextLeft <= carousel.scrollWidth - carousel.clientWidth + 1 ? nextLeft : 0;
      carousel.scrollTo({ left, behavior: "smooth" });
    }, 4200);

    return () => {
      window.clearInterval(timer);
      observer?.disconnect();
      carousel.removeEventListener("pointerdown", noteInteraction);
      carousel.removeEventListener("wheel", noteInteraction);
      carousel.removeEventListener("keydown", noteInteraction);
    };
  }, [autoSwipe]);

  return (
    <section className="project-section section" id="projects">
      <div className="container">
        <div className="section-heading project-heading reveal">
          <div>
            <p className="eyebrow light"><span></span> COMPANY PROFILE</p>
            <h2>Kalpbhumi<br /><em>Infra.</em></h2>
          </div>
          <p className="heading-aside">Completed project records — pages 1 to 10.</p>
        </div>

        <div className="profile-actions reveal">
          <span>10 profile pages<em className="profile-swipe-hint"> · auto-swipe · swipe to browse →</em></span>
          <a
            href="/company-profile/Kalpbhumi-Infra-Profile.pdf"
            className="text-link light-link"
            target="_blank"
            rel="noreferrer"
          >
            View / print company profile <span>↗</span>
          </a>
        </div>

        <div
          ref={carouselRef}
          className="profile-page-grid"
          id="profile-pages"
          role="region"
          aria-label="Company profile pages"
          tabIndex={0}
        >
          {profilePages.map((page) => (
            <article className="profile-page-card reveal" key={page}>
              <a
                href={`/company-profile/page-${String(page).padStart(2, "0")}.png`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open company profile page ${page}`}
              >
                <img
                  src={`/company-profile/page-${String(page).padStart(2, "0")}.png`}
                  alt={`Kalpbhumi Infra company profile page ${page}`}
                  loading="lazy"
                />
                <span className="profile-page-number">PAGE {page}</span>
                <span className="profile-page-open">↗</span>
              </a>
            </article>
          ))}
        </div>

        <div className="projects-foot">
          <span>Completed projects and company records</span>
          <a href="#contact" className="text-link light-link">Discuss a project <span>↗</span></a>
        </div>
      </div>
    </section>
  );
}
