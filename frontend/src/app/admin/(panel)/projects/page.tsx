"use client";

import { ResourceManager, formatDate, labelFor, type Field, type Row } from "../../../../components/admin/resource-manager";
import { PROJECT_CATEGORIES, PROJECT_CLIENT_TYPES, PROJECT_STATUSES } from "../../../../components/admin/choices";
import { ProjectMediaManager, type ProjectMedia } from "../../../../components/admin/project-media";

type Project = Row & {
  name: string; slug: string; category: string; location: string; client_name: string; client_type: string;
  status: string; completion_date: string | null; featured: boolean; published: boolean; images: ProjectMedia[];
};

const fields: Field[] = [
  { name: "name", label: "Project name", type: "text", required: true, full: true },
  { name: "category", label: "Category", type: "select", options: PROJECT_CATEGORIES, required: true },
  { name: "status", label: "Status", type: "select", options: PROJECT_STATUSES, required: true },
  { name: "location", label: "Location", type: "text", required: true },
  { name: "client_name", label: "Client name", type: "text" },
  { name: "client_type", label: "Client type", type: "select", options: PROJECT_CLIENT_TYPES, required: true },
  { name: "slug", label: "URL slug", type: "text", help: "Leave blank to generate from the name." },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "completion_date", label: "Completion date", type: "date" },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "image_url", label: "Fallback cover image URL", type: "url", full: true, help: "Used only when no site photo is uploaded below." },
  { name: "published", label: "Published on website", type: "checkbox" },
  { name: "featured", label: "Featured project", type: "checkbox" },
];

export default function ProjectsAdminPage() {
  return (
    <ResourceManager<Project>
      title="Projects"
      description="Projects shown in the portfolio and gallery. Save a project to add photos and drawings."
      endpoint="projects"
      singular="Project"
      fields={fields}
      defaults={{ category: "roads", status: "ongoing", client_type: "government", published: false, featured: false }}
      rowTitle={(r) => r.name}
      searchText={(r) => `${r.name} ${r.location} ${r.client_name}`}
      filters={[
        { name: "category", label: "Categories", options: PROJECT_CATEGORIES },
        { name: "status", label: "Statuses", options: PROJECT_STATUSES },
      ]}
      columns={[
        { label: "Project", render: (r) => <strong>{r.name}</strong> },
        { label: "Category", render: (r) => labelFor(PROJECT_CATEGORIES, r.category) },
        { label: "Location", render: (r) => r.location },
        { label: "Status", render: (r) => <span className={`adm-pill${r.status === "completed" ? " adm-pill-ok" : r.status === "ongoing" ? " adm-pill-warn" : ""}`}>{labelFor(PROJECT_STATUSES, r.status)}</span> },
        { label: "Completed", render: (r) => formatDate(r.completion_date) },
        { label: "Media", render: (r) => `${r.images?.length ?? 0} items` },
        { label: "Website", render: (r) => <span className={`adm-pill${r.published ? " adm-pill-ok" : " adm-pill-off"}`}>{r.published ? "Published" : "Draft"}{r.featured ? " ★" : ""}</span> },
      ]}
      renderEditorExtra={(row, reload) => <ProjectMediaManager projectId={row.id} media={row.images ?? []} onChange={reload} />}
    />
  );
}
