export function ProjectsSection() {
  const profilePages = Array.from({ length: 15 }, (_, index) => index + 6);

  return (
    <section className="project-section section" id="projects">
      <div className="container">
        <div className="section-heading project-heading reveal">
          <div>
            <p className="eyebrow light"><span></span> SUB-CONTRACTOR PROFILE</p>
            <h2>M/s Abhinandan<br /><em>Construction.</em></h2>
          </div>
          <p className="heading-aside">Complete company profile, project records, management, equipment, ongoing works and supporting certificates — pages 6 to 20.</p>
        </div>

        <div className="profile-actions reveal">
          <span>15 complete profile pages<em className="profile-swipe-hint"> · swipe to browse →</em></span>
          <a
            href="/company-profile/M-s-Abhinandan-Construction-Profile.pdf"
            className="text-link light-link"
            target="_blank"
            rel="noreferrer"
          >
            View / print full PDF <span>↗</span>
          </a>
        </div>

        <div className="profile-page-grid">
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
                  alt={`M/s Abhinandan Construction company profile page ${page}`}
                  loading="lazy"
                />
                <span className="profile-page-number">PAGE {page}</span>
                <span className="profile-page-open">↗</span>
              </a>
            </article>
          ))}
        </div>

        <div className="projects-foot">
          <span>As a Sub-Contractor | Complete projects and certificates</span>
          <a href="#contact" className="text-link light-link">Discuss a project <span>↗</span></a>
        </div>
      </div>
    </section>
  );
}
