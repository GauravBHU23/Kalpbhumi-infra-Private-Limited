"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AdminApiError, adminFetch, toFormData } from "../../lib/admin-api";
import { publicAssetUrl } from "../../lib/api";
import { useAdmin } from "./admin-shell";

export type Option = { value: string; label: string };

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "date" | "checkbox" | "url" | "email" | "file";
  options?: Option[];
  required?: boolean;
  full?: boolean;
  help?: string;
  placeholder?: string;
  /** file fields: accepted types, the read-only URL key returned by the API, and the "remove" flag name */
  accept?: string;
  fileUrlKey?: string;
  removeKey?: string;
};

export type Column<T> = { label: string; render: (row: T) => ReactNode };

export type Row = { id: number } & Record<string, unknown>;

type Props<T extends Row> = {
  title: string;
  description?: string;
  endpoint: string;
  singular: string;
  fields: Field[];
  columns: Column<T>[];
  rowTitle: (row: T) => string;
  searchText: (row: T) => string;
  filters?: { name: string; label: string; options: Option[] }[];
  multipart?: boolean;
  defaults: Record<string, unknown>;
  /** Extra editor content shown only when editing an existing row (e.g. project media). */
  renderEditorExtra?: (row: T, reload: () => void) => ReactNode;
};

export function labelFor(options: Option[], value: unknown): string {
  return options.find((o) => o.value === value)?.label ?? String(value ?? "");
}

export function formatDate(value: unknown): string {
  if (!value || typeof value !== "string") return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function FieldInput({ field, value, error, onChange, file, onFile, currentUrl, remove, onRemove }: {
  field: Field;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  file?: File | null;
  onFile?: (file: File | null) => void;
  currentUrl?: string;
  remove?: boolean;
  onRemove?: (remove: boolean) => void;
}) {
  const id = `f-${field.name}`;
  const cls = `adm-field${field.full || field.type === "textarea" ? " adm-field-full" : ""}${error ? " has-error" : ""}`;
  const text = value === null || value === undefined ? "" : String(value);

  if (field.type === "checkbox") {
    return (
      <div className={cls}>
        <label className="adm-check"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {field.label}</label>
        {field.help && <small>{field.help}</small>}
        {error && <span className="adm-field-error">{error}</span>}
      </div>
    );
  }

  let control: ReactNode;
  if (field.type === "textarea") {
    control = <textarea id={id} className="adm-input" value={text} required={field.required} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
  } else if (field.type === "select") {
    control = (
      <select id={id} className="adm-input" value={text} required={field.required} onChange={(e) => onChange(e.target.value)}>
        {!field.required && <option value="">—</option>}
        {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (field.type === "file") {
    control = (
      <div className="adm-file">
        {currentUrl && !file && (
          <div className="adm-file-current">
            <a href={publicAssetUrl(currentUrl)} target="_blank" rel="noreferrer">Current file ↗</a>
            {field.removeKey && onRemove && (
              <label className="adm-check" style={{ minHeight: 0 }}><input type="checkbox" checked={Boolean(remove)} onChange={(e) => onRemove(e.target.checked)} /> Remove</label>
            )}
          </div>
        )}
        <input id={id} className="adm-input" type="file" accept={field.accept} onChange={(e) => onFile?.(e.target.files?.[0] ?? null)} />
      </div>
    );
  } else {
    const inputType = field.type === "number" ? "number" : field.type;
    control = (
      <input id={id} className="adm-input" type={inputType} value={text} required={field.required} placeholder={field.placeholder}
        min={field.type === "number" ? 0 : undefined} inputMode={field.type === "number" ? "numeric" : undefined}
        onChange={(e) => onChange(e.target.value)} />
    );
  }

  return (
    <div className={cls}>
      <span><label htmlFor={id}>{field.label}{field.required ? " *" : ""}</label></span>
      {control}
      {field.help && <small>{field.help}</small>}
      {error && <span className="adm-field-error">{error}</span>}
    </div>
  );
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
  }, [onClose]);
  return (
    <div className="adm-modal-back" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-modal-head">
          <h2>{title}</h2>
          <button type="button" className="adm-modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ResourceManager<T extends Row>(props: Props<T>) {
  const { title, description, endpoint, singular, fields, columns, rowTitle, searchText, filters = [], multipart, defaults, renderEditorExtra } = props;
  const { handleError } = useAdmin();
  const [rows, setRows] = useState<T[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [removals, setRemovals] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await adminFetch<T[]>(endpoint);
      setRows(data);
      setLoadError("");
      setEditing((current) => (current && current !== "new" ? data.find((r) => r.id === current.id) ?? current : current));
    } catch (err) {
      setLoadError(handleError(err));
    }
  }, [endpoint, handleError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((row) =>
      (!q || searchText(row).toLowerCase().includes(q)) &&
      filters.every((f) => !filterValues[f.name] || String(row[f.name]) === filterValues[f.name]));
  }, [rows, query, filterValues, filters, searchText]);

  function openEditor(row: T | "new") {
    const initial: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "file") continue;
      const value = row === "new" ? defaults[field.name] : row[field.name];
      initial[field.name] = field.type === "checkbox" ? Boolean(value) : value ?? "";
    }
    setValues(initial);
    setFiles({});
    setRemovals({});
    setErrors({});
    setFormError("");
    setEditing(row);
  }

  const closeEditor = useCallback(() => { if (!saving) setEditing(null); }, [saving]);

  async function onSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!editing) return;
    setSaving(true);
    setErrors({});
    setFormError("");
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "file") {
        if (files[field.name]) payload[field.name] = files[field.name];
        else if (field.removeKey && removals[field.name]) payload[field.removeKey] = true;
        continue;
      }
      let value = values[field.name];
      if ((field.type === "number" || field.type === "date") && value === "") value = null;
      payload[field.name] = value;
    }
    const body = multipart ? toFormData(payload) : payload;
    try {
      const saved = editing === "new"
        ? await adminFetch<T>(endpoint, { method: "POST", body })
        : await adminFetch<T>(`${endpoint}/${editing.id}`, { method: "PATCH", body });
      await load();
      setNotice(`${singular} ${editing === "new" ? "added" : "saved"}.`);
      if (editing === "new" && renderEditorExtra) openEditor(saved);
      else setEditing(null);
    } catch (err) {
      if (err instanceof AdminApiError && !err.isAuthError) {
        setErrors(err.fieldErrors);
        setFormError(err.message);
      } else setFormError(handleError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    if (!window.confirm(`Delete "${rowTitle(row)}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`${endpoint}/${row.id}`, { method: "DELETE" });
      setNotice(`${singular} deleted.`);
      if (editing && editing !== "new" && editing.id === row.id) setEditing(null);
      load();
    } catch (err) {
      setNotice("");
      window.alert(handleError(err));
    }
  }

  const actions = (row: T) => (
    <>
      <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => openEditor(row)}>Edit</button>
      <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(row)}>Delete</button>
    </>
  );

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <button type="button" className="adm-btn" onClick={() => openEditor("new")}>+ Add {singular.toLowerCase()}</button>
      </div>

      {notice && <div className="adm-alert adm-alert-ok" role="status" style={{ marginBottom: 14 }}>{notice}</div>}

      <div className="adm-toolbar">
        <input className="adm-input" type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
        {filters.map((f) => (
          <select key={f.name} className="adm-input" aria-label={f.label} value={filterValues[f.name] ?? ""}
            onChange={(e) => setFilterValues((v) => ({ ...v, [f.name]: e.target.value }))}>
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>

      {loadError && <div className="adm-alert" role="alert">{loadError} <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load}>Retry</button></div>}
      {!rows && !loadError && <div className="adm-loading">Loading…</div>}
      {rows && visible.length === 0 && <div className="adm-card adm-empty">{rows.length ? "No matches." : `No ${title.toLowerCase()} yet.`}</div>}

      {rows && visible.length > 0 && (
        <>
          <div className="adm-list has-table">
            {visible.map((row) => (
              <article key={row.id} className="adm-row">
                <div className="adm-row-title">{rowTitle(row)}</div>
                <div className="adm-row-meta">{columns.slice(1).map((c) => <span key={c.label}>{c.render(row)}</span>)}</div>
                <div className="adm-row-actions">{actions(row)}</div>
              </article>
            ))}
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th aria-label="Actions" /></tr></thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => <td key={c.label}>{c.render(row)}</td>)}
                    <td className="adm-actions-cell">{actions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? `Add ${singular.toLowerCase()}` : `Edit: ${rowTitle(editing)}`}
          onClose={closeEditor}
          footer={<>
            <button type="button" className="adm-btn adm-btn-ghost" onClick={closeEditor} disabled={saving}>Cancel</button>
            <button type="submit" form="adm-resource-form" className="adm-btn" disabled={saving}>{saving ? <><span className="btn-spinner" aria-hidden="true" />Saving…</> : editing === "new" ? `Add ${singular.toLowerCase()}` : "Save changes"}</button>
          </>}
        >
          <div className="adm-modal-body">
            <form id="adm-resource-form" className="adm-form" onSubmit={onSubmit} noValidate>
              {formError && <div className="adm-alert" role="alert">{formError}</div>}
              <div className="adm-form-grid">
                {fields.map((field) => (
                  <FieldInput
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    error={errors[field.name] || (field.removeKey ? errors[field.removeKey] : undefined)}
                    onChange={(v) => setValues((s) => ({ ...s, [field.name]: v }))}
                    file={files[field.name]}
                    onFile={(f) => setFiles((s) => ({ ...s, [field.name]: f }))}
                    currentUrl={editing !== "new" && field.fileUrlKey ? String(editing[field.fileUrlKey] || "") : ""}
                    remove={removals[field.name]}
                    onRemove={(r) => setRemovals((s) => ({ ...s, [field.name]: r }))}
                  />
                ))}
              </div>
            </form>
            {editing !== "new" && renderEditorExtra?.(editing, load)}
          </div>
        </Modal>
      )}
    </>
  );
}
