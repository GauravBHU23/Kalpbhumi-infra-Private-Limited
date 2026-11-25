import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";

export type LegalSection = { id: string; title: string; body: ReactNode };

export const LEGAL_CONTACT = {
  company: "Kalpbhumi Infra",
  email: "kalpbhumi.infra@gmail.com",
  phone: "+91 94151 42821",
  phoneHref: "tel:+919415142821",
  address: "Seer Govardhanpur (Near Ashok Puram Colony), Varanasi, Uttar Pradesh 221005",
  gstin: "09BYBPK4905N1Z3",
};

export function LegalPage({ eyebrow, title, intro, updated, sections }: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <a className="skip-link" href="#legal-content">Skip to content</a>
      <header className="legal-header" id="top">
        <div className="container legal-header-row">
          <a className="brand" href="/" aria-label="Kalpbhumi Infra home">
            <span className="brand-mark brand-logo" aria-hidden="true"><img src="/kalpbhumi-logo.png" alt="" /></span>
            <span className="brand-copy"><strong>KALPBHUMI</strong><small>INFRA</small></span>
          </a>
          <a className="legal-home" href="/">← Back to website</a>
        </div>
        <div className="container legal-hero">
          <p className="eyebrow light"><span></span> {eyebrow}</p>
          <h1>{title}</h1>
          <p className="legal-intro">{intro}</p>
          <p className="legal-updated">Last updated: {updated}</p>
        </div>
      </header>

      <main className="legal-main" id="legal-content">
        <div className="container legal-layout">
          <nav className="legal-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
          </nav>
          <article className="legal-body">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
