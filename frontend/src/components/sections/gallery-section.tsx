// Gallery: company profile pages 6–20 (project photos, records and certificates).
type GalleryItem = { page: number; type: "photo" | "document" | "certificate"; status?: "completed" | "ongoing"; title: string };

const GALLERY_ITEMS: GalleryItem[] = [
  { page: 9, type: "photo", status: "completed", title: "Conference hall & auditorium renovation — Medical College, Prayagraj" },
  { page: 10, type: "photo", status: "completed", title: "Residential buildings — Rajkiya Engineering College, Churk, Sonbhadra" },
  { page: 11, type: "photo", status: "completed", title: "ITI college workshops — Varanasi & Bhadohi" },
  { page: 12, type: "photo", status: "completed", title: "Rajkiya Inter College & Bhadrakali Mandir renovation — Varanasi & Sonbhadra" },
  { page: 13, type: "photo", status: "ongoing", title: "Kasturba Gandhi Girls Hostel — Bisa, Pratapgarh" },
  { page: 14, type: "photo", status: "ongoing", title: "Building works — Manikpur, Hathigawa & Vivechana, Pratapgarh" },
  { page: 15, type: "photo", status: "ongoing", title: "Kalika Dham development & renovation — Varanasi" },
  { page: 16, type: "photo", status: "ongoing", title: "Faculty residence & fire station — Sonbhadra and Ballia" },
  { page: 17, type: "photo", status: "ongoing", title: "ITI college construction — Bihar, Pratapgarh" },
  { page: 6, type: "document", title: "Organisation structure & management team" },
  { page: 7, type: "document", title: "List of tools & plant (T&P)" },
  { page: 8, type: "document", title: "Ongoing and completed projects list" },
  { page: 18, type: "certificate", title: "Experience, grade, turnover & solvency certificates" },
  { page: 19, type: "certificate", title: "Certificates (continued)" },
  { page: 20, type: "certificate", title: "Registration certificates" },
];

const pageUrl = (page: number) => `/company-profile/page-${String(page).padStart(2, "0")}.png`;

export function GallerySection() {
  return (
    <section className="section gallery-section" id="gallery">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span></span> ON THE GROUND</p>
            <h2>Work in progress.<br /><em>Built to last.</em></h2>
          </div>
          <p className="heading-aside">Completed and ongoing project sites, company records and certificates — profile pages 6 to 20.</p>
        </div>
        <div className="gallery-filters" role="group" aria-label="Filter gallery">
          <button className="gallery-filter active" data-gallery-filter="all">All</button>
          <button className="gallery-filter" data-gallery-filter="project:completed">Completed projects</button>
          <button className="gallery-filter" data-gallery-filter="project:ongoing">Ongoing projects</button>
          <button className="gallery-filter" data-gallery-filter="document">Company records</button>
          <button className="gallery-filter" data-gallery-filter="certificate">Certificates</button>
        </div>
        <div className="gallery-grid gallery-profile" id="project-gallery">
          {GALLERY_ITEMS.map((item) => (
            <figure key={item.page} data-media-type={item.type} data-project-status={item.status ?? ""}>
              <a href={pageUrl(item.page)} target="_blank" rel="noreferrer" aria-label={`Open page ${item.page}: ${item.title}`}>
                <img src={pageUrl(item.page)} alt={item.title} loading="lazy" />
                <span className="gallery-page-no">PAGE {item.page}</span>
              </a>
              <figcaption>
                {item.status && <span className={`gallery-status is-${item.status}`}>{item.status === "completed" ? "Completed" : "Ongoing"}</span>}
                {item.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
