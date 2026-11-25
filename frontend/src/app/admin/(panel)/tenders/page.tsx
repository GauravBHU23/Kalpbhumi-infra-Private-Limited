"use client";

import { ResourceManager, formatDate, labelFor, type Field, type Row } from "../../../../components/admin/resource-manager";
import { NOTICE_TYPES, TENDER_CLIENT_TYPES, TENDER_STATUSES } from "../../../../components/admin/choices";

type Tender = Row & { title: string; location: string; category: string; notice_type: string; status: string; closing_date: string | null; published: boolean };

const fields: Field[] = [
  { name: "title", label: "Title", type: "text", required: true, full: true },
  { name: "notice_type", label: "Notice type", type: "select", options: NOTICE_TYPES, required: true },
  { name: "status", label: "Status", type: "select", options: TENDER_STATUSES, required: true },
  { name: "location", label: "Location", type: "text", required: true },
  { name: "category", label: "Category / work type", type: "text", required: true },
  { name: "client_type", label: "Client type", type: "select", options: TENDER_CLIENT_TYPES, required: true },
  { name: "closing_date", label: "Closing date", type: "date" },
  { name: "notice_url", label: "Official notice URL", type: "url", full: true },
  { name: "document", label: "Tender document", type: "file", accept: ".pdf,.doc,.docx,.xls,.xlsx", fileUrlKey: "document_url", removeKey: "remove_document", help: "PDF, DOC/DOCX or XLS/XLSX.", full: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "published", label: "Show on website", type: "checkbox" },
];

export default function TendersAdminPage() {
  return (
    <ResourceManager<Tender>
      title="Tenders"
      description="Tender notices, work orders and vendor opportunities."
      endpoint="tenders"
      singular="Tender"
      multipart
      fields={fields}
      defaults={{ notice_type: "tender", status: "open", client_type: "government", published: false }}
      rowTitle={(r) => r.title}
      searchText={(r) => `${r.title} ${r.location} ${r.category}`}
      filters={[
        { name: "status", label: "Statuses", options: TENDER_STATUSES },
        { name: "notice_type", label: "Types", options: NOTICE_TYPES },
      ]}
      columns={[
        { label: "Title", render: (r) => <strong>{r.title}</strong> },
        { label: "Type", render: (r) => labelFor(NOTICE_TYPES, r.notice_type) },
        { label: "Location", render: (r) => r.location },
        { label: "Status", render: (r) => <span className={`adm-pill${r.status === "open" ? " adm-pill-ok" : r.status === "upcoming" ? " adm-pill-warn" : " adm-pill-off"}`}>{labelFor(TENDER_STATUSES, r.status)}</span> },
        { label: "Closes", render: (r) => formatDate(r.closing_date) },
        { label: "Website", render: (r) => <span className={`adm-pill${r.published ? " adm-pill-ok" : " adm-pill-off"}`}>{r.published ? "Published" : "Hidden"}</span> },
      ]}
    />
  );
}
