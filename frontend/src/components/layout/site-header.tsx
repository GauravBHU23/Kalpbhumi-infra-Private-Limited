"use client";

import { useState } from "react";

const links = [
  ["Home", "#top"],
  ["About", "#about"],
  ["Services", "#services"],
  ["Projects", "#projects"],
  ["Tenders", "#tenders"],
  ["Our team", "#team"],
  ["Gallery", "#gallery"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header" id="top">
      <div className="container nav-wrap">
        <a className="brand" href="#top" aria-label="Kalpbhumi Infra home">
          <span className="brand-mark brand-logo" aria-hidden="true"><img src="/kalpbhumi-logo.png" alt="" /></span>
          <span className="brand-copy"><strong>KALPBHUMI</strong><small>INFRA</small></span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span><span></span>
        </button>
        <nav className={`primary-nav${menuOpen ? " open" : ""}`} id="primary-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a key={href} href={href} className={href === "#top" ? "nav-home" : undefined} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <span className="nav-portals">
            <a href="/staff/login" className="nav-portal">Staff</a>
            <a href="/admin/login" className="nav-portal">Admin</a>
          </span>
          <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>Let&apos;s talk <span>↗</span></a>
        </nav>
      </div>
    </header>
  );
}
