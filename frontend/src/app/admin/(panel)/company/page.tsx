"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminApiError, adminFetch } from "../../../../lib/admin-api";
import { useAdmin } from "../../../../components/admin/admin-shell";
import { FieldInput, type Field } from "../../../../components/admin/resource-manager";

const sections: { title: string; fields: Field[] }[] = [
  {
    title: "Company",
    fields: [
      { name: "company_name", label: "Company name", type: "text", required: true, full: true },
      { name: "short_profile", label: "Short profile", type: "textarea" },
      { name: "history", label: "History", type: "textarea" },
      { name: "mission", label: "Mission", type: "textarea" },
      { name: "vision", label: "Vision", type: "textarea" },
      { name: "experience", label: "Experience", type: "textarea" },
      { name: "expertise", label: "Expertise", type: "textarea" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "address", label: "Address", type: "text", full: true },
      { name: "map_embed_url", label: "Google Maps embed URL", type: "url", full: true },
    ],
  },
  {
    title: "Verified statistics",
    fields: [
      { name: "founded_year", label: "Founded year", type: "number" },
      { name: "projects_delivered", label: "Projects delivered", type: "number" },
      { name: "states_covered", label: "States covered", type: "number" },
    ],
  },
];
const ALL_FIELDS = sections.flatMap((s) => s.fields);

export default function CompanyAdminPage() {
  const { handleError } = useAdmin();
  const [values, setValues] = useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<Record<string, unknown>>("company")
      .then((d) => setValues(Object.fromEntries(ALL_FIELDS.map((f) => [f.name, d[f.name] ?? ""]))))
      .catch((err) => setMessage({ ok: false, text: handleError(err) }));
  }, [handleError]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values) return;
    setSaving(true);
    setErrors({});
    setMessage(null);
    const body = Object.fromEntries(ALL_FIELDS.map((f) => [f.name, f.type === "number" && values[f.name] === "" ? null : values[f.name]]));
    try {
      await adminFetch("company", { method: "PUT", body });
      setMessage({ ok: true, text: "Company profile saved." });
    } catch (err) {
      if (err instanceof AdminApiError && !err.isAuthError) setErrors(err.fieldErrors);
      setMessage({ ok: false, text: handleError(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Company profile</h1>
          <p>About, contact details and statistics shown on the website.</p>
        </div>
      </div>
      {!values && !message && <div className="adm-loading">Loading…</div>}
      {values && (
        <form className="adm-form" onSubmit={onSubmit} noValidate>
          {message && <div className={`adm-alert${message.ok ? " adm-alert-ok" : ""}`} role={message.ok ? "status" : "alert"}>{message.text}</div>}
          {sections.map((section) => (
            <section key={section.title} className="adm-card">
              <h2>{section.title}</h2>
              <div className="adm-form-grid">
                {section.fields.map((field) => (
                  <FieldInput key={field.name} field={field} value={values[field.name]} error={errors[field.name]}
                    onChange={(v) => setValues((s) => ({ ...s, [field.name]: v }))} />
                ))}
              </div>
            </section>
          ))}
          <div><button type="submit" className="adm-btn" disabled={saving}>{saving ? <><span className="btn-spinner" aria-hidden="true" />Saving…</> : "Save profile"}</button></div>
        </form>
      )}
      {!values && message && <div className="adm-alert" role="alert">{message.text}</div>}
    </>
  );
}
