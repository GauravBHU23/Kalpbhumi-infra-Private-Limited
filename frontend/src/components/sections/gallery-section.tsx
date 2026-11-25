// Gallery: certificate-free company profile pages, renumbered from 1.
type GalleryItem = { page: number; type: "photo" | "document"; status?: "completed"; title: string };

const GALLERY_ITEMS: GalleryItem[] = [
  { page: 1, type: "document", title: "Completed project records" },
  { page: 2, type: "photo", status: "completed", title: "Conference hall & auditorium renovation — Medical College, Prayagraj" },
  { page: 3, type: "photo", status: "completed", title: "Residential buildings — Rajkiya Engineering College, Churk, Sonbhadra" },
  { page: 4, type: "photo", status: "completed", title: "ITI college workshops — Varanasi & Bhadohi" },
  { page: 5, type: "photo", status: "completed", title: "Rajkiya Inter College & Bhadrakali Mandir renovation — Varanasi & Sonbhadra" },
  { page: 6, type: "photo", status: "completed", title: "Kasturba Gandhi Girls Hostel — Bisa, Pratapgarh" },
  { page: 7, type: "photo", status: "completed", title: "Building works — Manikpur, Hathigawa & Vivechana, Pratapgarh" },
  { page: 8, type: "photo", status: "completed", title: "Kalika Dham development & renovation — Varanasi" },
  { page: 9, type: "photo", status: "completed", title: "Faculty residence & fire station — Sonbhadra and Ballia" },
  { page: 10, type: "photo", status: "completed", title: "ITI college construction — Bihar, Pratapgarh" },
];

const pageUrl = (page: number) => `/company-profile/page-${String(page).padStart(2, "0")}.png`;

export function GallerySection() {
  return (
    <section className="section gallery-section" id="gallery">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span></span> ON THE GROUND</p>
            <h2>Completed work.<br /><em>Built to last.</em></h2>
          </div>
          <p className="heading-aside">Completed project sites and records — profile pages 1 to 10.</p>
        </div>
        <div className="gallery-filters" role="group" aria-label="Filter gallery">
          <button className="gallery-filter active" data-gallery-filter="all">All</button>
          <button className="gallery-filter" data-gallery-filter="project:completed">Completed projects</button>
          <button className="gallery-filter" data-gallery-filter="document">Company records</button>
        </div>
        <div className="gallery-grid gallery-profile" id="project-gallery">
          {GALLERY_ITEMS.map((item) => (
            <figure key={item.page} data-media-type={item.type} data-project-status={item.status ?? ""}>
              <a href={pageUrl(item.page)} target="_blank" rel="noreferrer" aria-label={`Open page ${item.page}: ${item.title}`}>
                <img src={pageUrl(item.page)} alt={item.title} loading="lazy" />
                <span className="gallery-page-no">PAGE {item.page}</span>
              </a>
              <figcaption>
                {item.status && <span className="gallery-status is-completed">Completed</span>}
                {item.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
