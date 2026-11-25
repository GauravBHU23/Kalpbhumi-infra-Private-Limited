"use client";

import { ResourceManager, labelFor, type Field, type Row } from "../../../../components/admin/resource-manager";
import { DEPARTMENTS } from "../../../../components/admin/choices";

type Member = Row & { name: string; designation: string; department: string; experience_years: number; position: number; published: boolean };

const fields: Field[] = [
  { name: "name", label: "Full name", type: "text", required: true },
  { name: "designation", label: "Designation", type: "text", required: true },
  { name: "department", label: "Department", type: "select", options: DEPARTMENTS, required: true },
  { name: "experience_years", label: "Experience (years)", type: "number", required: true },
  { name: "biography", label: "Short biography", type: "textarea" },
  { name: "photo", label: "Photo", type: "file", accept: ".jpg,.jpeg,.png,.webp", fileUrlKey: "photo_url", removeKey: "remove_photo" },
  { name: "image_url", label: "…or photo URL", type: "url", help: "Used when no photo is uploaded." },
  { name: "position", label: "Display order", type: "number", help: "Lower numbers appear first." },
  { name: "published", label: "Show on website", type: "checkbox" },
];

export default function TeamAdminPage() {
  return (
    <ResourceManager<Member>
      title="Team"
      description="Leadership, engineers and site staff shown in the team section."
      endpoint="team"
      singular="Team member"
      multipart
      fields={fields}
      defaults={{ department: "technical", experience_years: 0, position: 0, published: false }}
      rowTitle={(r) => r.name}
      searchText={(r) => `${r.name} ${r.designation}`}
      filters={[{ name: "department", label: "Departments", options: DEPARTMENTS }]}
      columns={[
        { label: "Name", render: (r) => <strong>{r.name}</strong> },
        { label: "Designation", render: (r) => r.designation },
        { label: "Department", render: (r) => labelFor(DEPARTMENTS, r.department) },
        { label: "Experience", render: (r) => `${r.experience_years} yrs` },
        { label: "Order", render: (r) => `#${r.position}` },
        { label: "Website", render: (r) => <span className={`adm-pill${r.published ? " adm-pill-ok" : " adm-pill-off"}`}>{r.published ? "Published" : "Hidden"}</span> },
      ]}
    />
  );
}
