const COMPANY_LINKS = [
  ["About us", "/#about"],
  ["Projects", "/#projects"],
  ["Tenders", "/#tenders"],
  ["Our team", "/#team"],
  ["Gallery", "/#gallery"],
  ["Contact", "/#contact"],
] as const;

const SERVICE_LINKS = [
  "Building & construction",
  "Roads & infrastructure",
  "Repair & maintenance",
  "Architecture & drawings",
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer ft">
      <div className="container ft-main">
        <div className="ft-brand-col">
          <a className="brand ft-brand" href="/#top" aria-label="Kalpbhumi Infra home">
            <span className="brand-mark brand-logo" aria-hidden="true"><img src="/kalpbhumi-logo.png" alt="" /></span>
            <span className="brand-copy"><strong>KALPBHUMI</strong><small>INFRA</small></span>
          </a>
          <p className="ft-badge">Registered Govt &amp; Private Civil Contractor</p>
          <p className="ft-tagline">Building the way forward.<br />With people, purpose and pride.</p>
          <ul className="ft-contact">
            <li><span>Call</span><a href="tel:+919415142821">+91 94151 42821</a></li>
            <li><span>Email</span><a href="mailto:kalpbhumi.infra@gmail.com">kalpbhumi.infra@gmail.com</a></li>
            <li><span>Office</span>Seer Govardhanpur (Near Ashok Puram Colony), Varanasi, Uttar Pradesh 221005</li>
            <li><span>GSTIN</span>09BYBPK4905N1Z3</li>
          </ul>
        </div>

        <nav className="ft-col" aria-label="Company">
          <h2>Company</h2>
          <ul>{COMPANY_LINKS.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
        </nav>

        <nav className="ft-col" aria-label="Services">
          <h2>Services</h2>
          <ul>{SERVICE_LINKS.map((label) => <li key={label}><a href="/#services">{label}</a></li>)}</ul>
        </nav>

        <nav className="ft-col" aria-label="Legal and access">
          <h2>Legal</h2>
          <ul>
            <li><a href="/privacy">Privacy policy</a></li>
            <li><a href="/terms">Terms &amp; conditions</a></li>
            <li><a href="/staff/login">Staff login</a></li>
            <li><a href="/admin/login">Admin login</a></li>
          </ul>
        </nav>
      </div>

      <div className="container ft-bottom">
        <div className="ft-bottom-text">
          <span>© {year} Kalpbhumi Infra. All rights reserved.</span>
          <span className="ft-credit">Designed &amp; developed by <strong>Gaurav Kumar</strong></span>
        </div>
        <a className="back-top ft-top" href="#top" aria-label="Back to top">↑</a>
      </div>
    </footer>
  );
}
