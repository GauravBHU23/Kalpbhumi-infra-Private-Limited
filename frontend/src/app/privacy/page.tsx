import type { Metadata } from "next";
import { LEGAL_CONTACT as C, LegalPage, type LegalSection } from "../../components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Kalpbhumi Infra",
  description: "How Kalpbhumi Infra collects, uses, stores and protects personal information shared through this website.",
};

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        This website is operated by {C.company} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), a registered Government and private
        civil contractor (GSTIN {C.gstin}) based in {C.address}. This policy explains how we handle personal data in line with the Digital Personal Data
        Protection Act, 2023 and the Information Technology Act, 2000 and the rules made under them.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>We only collect information that you choose to give us, or that is needed to run the website securely:</p>
        <ul>
          <li><strong>Enquiry form:</strong> your name, email address, phone number (optional), the service you are interested in, request type, project location, budget range (optional) and your message.</li>
          <li><strong>Staff portal accounts:</strong> for employees who register, we store name, username, work email, mobile number, designation and a securely hashed password. We never store passwords in readable form.</li>
          <li><strong>Technical data:</strong> your IP address and basic request details, used briefly to prevent spam, abuse and repeated sign-in attempts.</li>
        </ul>
        <p>We do not ask for sensitive data such as bank details, Aadhaar numbers or health information through this website.</p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To reply to your enquiry, prepare quotations and discuss projects, tenders or partnerships you asked about.</li>
        <li>To give approved employees access to the staff portal and keep a record of who manages website content.</li>
        <li>To keep the website secure, prevent misuse and meet our legal obligations.</li>
      </ul>
    ),
  },
  {
    id: "consent",
    title: "Consent",
    body: (
      <p>
        By submitting the enquiry form or registering for a staff account, you agree that we may use the details you provide
        for the purposes above. You can withdraw your consent at any time by writing to us at{" "}
        <a href={`mailto:${C.email}`}>{C.email}</a>. Withdrawing consent will not affect anything we did with your data before
        that, but we may no longer be able to respond to your enquiry or give portal access.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and third-party content",
    body: (
      <>
        <p>
          The public website does not use advertising or analytics cookies. The staff and admin portals use strictly necessary
          cookies only: a session cookie to keep you signed in and a security (CSRF) cookie that protects forms.
        </p>
        <p>
          Some content is loaded from trusted third parties, which may receive your IP address when your browser loads it:
          Google Maps (office location map), Google Fonts (typefaces) and Unsplash (illustrative photographs). Their own privacy
          policies apply to that data.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing your information",
    body: (
      <>
        <p>We do not sell or rent your personal data. We share it only when needed:</p>
        <ul>
          <li>With service providers who host the website, store files or deliver email for us, under confidentiality obligations.</li>
          <li>With government authorities, courts or regulators when the law requires it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "Storage and security",
    body: (
      <p>
        Data is stored on secured servers and sent over encrypted (HTTPS) connections. Only authorised administrators and
        approved staff can see enquiries, and every account is protected by a password. No method of transmission or storage is
        completely secure, but we take reasonable steps to protect your information.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep data",
    body: (
      <p>
        We keep enquiry details for as long as needed to respond and for our business records, normally no more than three years
        after our last contact with you, unless a longer period is required by law (for example tax or contract records). Staff
        portal accounts are kept while the employee needs access and are deleted or disabled when no longer required.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the Digital Personal Data Protection Act, 2023, you can ask us to:</p>
        <ul>
          <li>Tell you what personal data we hold about you and how we use it.</li>
          <li>Correct, complete or update inaccurate data.</li>
          <li>Erase your data when it is no longer needed for the purpose it was collected.</li>
          <li>Address a grievance about how we handle your data.</li>
          <li>Nominate another person to exercise these rights on your behalf in case of death or incapacity.</li>
        </ul>
        <p>Email <a href={`mailto:${C.email}`}>{C.email}</a> and we will respond within a reasonable time, and in any case within 30 days.</p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>This website is meant for adults and businesses. We do not knowingly collect personal data from anyone under 18.</p>,
  },
  {
    id: "grievance",
    title: "Grievance officer",
    body: (
      <>
        <p>If you have a concern about your personal data, contact our Grievance Officer:</p>
        <address className="legal-address">
          Grievance Officer, {C.company}<br />
          {C.address}<br />
          GSTIN: {C.gstin}<br />
          Email: <a href={`mailto:${C.email}`}>{C.email}</a><br />
          Phone: <a href={C.phoneHref}>{C.phone}</a>
        </address>
        <p>If you are not satisfied with our response, you may approach the Data Protection Board of India.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top shows when it was last changed.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Privacy Policy"
      intro="How we collect, use and protect the information you share with us through this website."
      updated="21 November 2026"
      sections={sections}
    />
  );
}
