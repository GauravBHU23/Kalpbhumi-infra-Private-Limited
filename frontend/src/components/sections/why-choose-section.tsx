import { COMPANY_NAME } from "../../lib/site-config";

export function WhyChooseSection() {
  return (
    <section className="trust-strip" aria-label={`Why choose ${COMPANY_NAME}`}><div className="container trust-grid"><div><strong>01</strong><small>Safety-led planning</small></div><div><strong>02</strong><small>Clear project controls</small></div><div><strong>03</strong><small>Skilled site teams</small></div><div className="trust-note">One accountable partner<br />from plan to handover.</div></div></section>
  );
}
