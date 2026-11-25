import type { Metadata } from "next";
import { LEGAL_CONTACT as C, LegalPage, type LegalSection } from "../../components/layout/legal-page";
import { COMPANY_NAME } from "../../lib/site-config";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${COMPANY_NAME}`,
  description: `The terms that apply when you use the ${COMPANY_NAME} website, enquiry form, tender listings and staff portal.`,
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: (
      <p>
        By using this website you agree to these Terms &amp; Conditions and to our <a href="/privacy">Privacy Policy</a>. If you do
        not agree, please do not use the website. In these terms, &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean {C.company}.
      </p>
    ),
  },
  {
    id: "about-website",
    title: "About this website",
    body: (
      <p>
        The website gives general information about our company, services, projects and business opportunities. Nothing on it is
        an offer, guarantee or binding commitment to carry out any work.
      </p>
    ),
  },
  {
    id: "project-information",
    title: "Project and company information",
    body: (
      <p>
        We try to keep information accurate and up to date, but project details, figures, timelines and statistics are indicative
        and may change. Some photographs are illustrative stock images and may not show our own sites. Please confirm any detail
        that matters to you directly with us.
      </p>
    ),
  },
  {
    id: "enquiries",
    title: "Enquiries and quotations",
    body: (
      <p>
        Sending an enquiry does not create a contract. Any estimate or quotation we share is for discussion only. Work is agreed
        only through a written contract or work order signed by both parties, and the terms of that document will apply.
      </p>
    ),
  },
  {
    id: "tenders",
    title: "Tenders and opportunities",
    body: (
      <p>
        Tender notices, work orders and vendor opportunities are listed for convenience. The official notice and documents of the
        issuing authority always take priority. Check dates, eligibility and requirements with the issuing authority before you
        act. We are not responsible for losses caused by errors, delays or changes in listed information.
      </p>
    ),
  },
  {
    id: "portals",
    title: "Staff and admin portals",
    body: (
      <>
        <p>The staff and admin portals are only for authorised employees and administrators of {C.company}.</p>
        <ul>
          <li>Staff accounts become active only after an administrator approves them, and can be disabled at any time.</li>
          <li>You are responsible for keeping your password confidential and for all activity under your account.</li>
          <li>Tell an administrator at once if you suspect your account has been misused.</li>
          <li>Unauthorised access or attempts to access the portals may be an offence under the Information Technology Act, 2000.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>When using the website, you must not:</p>
        <ul>
          <li>Submit false, misleading or someone else&rsquo;s information.</li>
          <li>Send spam, harmful code or content that is unlawful, abusive or defamatory.</li>
          <li>Try to disrupt, overload, scrape or gain unauthorised access to the website or its systems.</li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <p>
        The text, logo, design and original content on this website belong to {C.company} or are used with permission. Stock
        photographs are used under their providers&rsquo; licences. You may view and share pages for personal or business reference,
        but you may not copy, modify or reuse content commercially without our written permission.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party links and content",
    body: (
      <p>
        The website may link to or display content from other services, such as government tender portals or Google Maps. We do not
        control those services and are not responsible for their content, availability or privacy practices.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Disclaimer and limitation of liability",
    body: (
      <p>
        The website is provided &ldquo;as is&rdquo;. To the extent permitted by law, we are not liable for any indirect or consequential
        loss arising from your use of the website or reliance on its content, or for temporary unavailability. Nothing in these
        terms limits any liability that cannot be limited under Indian law.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and jurisdiction",
    body: (
      <p>
        These terms are governed by the laws of India. Any dispute relating to the website will be subject to the exclusive
        jurisdiction of the courts at Varanasi, Uttar Pradesh.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: <p>We may update these terms from time to time. Continued use of the website after changes means you accept the updated terms.</p>,
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <address className="legal-address">
        {C.company}<br />
        {C.address}<br />
        GSTIN: {C.gstin}<br />
        Email: <a href={`mailto:${C.email}`}>{C.email}</a><br />
        Phone: <a href={C.phoneHref}>{C.phone}</a>
      </address>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Terms & Conditions"
      intro="The rules that apply when you use our website, enquiry form, tender listings and staff portal."
      updated="21 November 2026"
      sections={sections}
    />
  );
}
