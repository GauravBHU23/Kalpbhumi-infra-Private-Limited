"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../../../lib/admin-api";
import { useAdmin } from "../../../../components/admin/admin-shell";
import { REQUEST_TYPES } from "../../../../components/admin/choices";
import { formatDate, labelFor } from "../../../../components/admin/resource-manager";

type Enquiry = {
  id: number; name: string; email: string; phone: string; service: string; request_type: string;
  project_location: string; budget_range: string; message: string; created_at: string; is_read: boolean;
};

export default function EnquiriesAdminPage() {
  const { handleError, refreshUnread } = useAdmin();
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<"all" | "unread" | "read">("all");
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(() => {
    adminFetch<Enquiry[]>("enquiries").then((d) => { setRows(d); setError(""); }).catch((err) => setError(handleError(err)));
  }, [handleError]);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((e) =>
      (show === "all" || (show === "unread" ? !e.is_read : e.is_read)) &&
      (!q || `${e.name} ${e.email} ${e.phone} ${e.service} ${e.project_location} ${e.message}`.toLowerCase().includes(q)));
  }, [rows, query, show]);

  async function setRead(item: Enquiry, isRead: boolean) {
    try {
      const updated = await adminFetch<Enquiry>(`enquiries/${item.id}`, { method: "PATCH", body: { is_read: isRead } });
      setRows((list) => list?.map((e) => (e.id === item.id ? updated : e)) ?? null);
      refreshUnread();
    } catch (err) {
      window.alert(handleError(err));
    }
  }

  function toggle(item: Enquiry) {
    const opening = open !== item.id;
    setOpen(opening ? item.id : null);
    if (opening && !item.is_read) setRead(item, true);
  }

  async function remove(item: Enquiry) {
    if (!window.confirm(`Delete the enquiry from ${item.name}? This cannot be undone.`)) return;
    try {
      await adminFetch(`enquiries/${item.id}`, { method: "DELETE" });
      setRows((list) => list?.filter((e) => e.id !== item.id) ?? null);
      refreshUnread();
    } catch (err) {
      window.alert(handleError(err));
    }
  }

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Enquiries</h1>
          <p>Quotation requests and messages from the website contact form.</p>
        </div>
      </div>
      <div className="adm-toolbar">
        <input className="adm-input" type="search" placeholder="Search name, email, message…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search enquiries" />
        <select className="adm-input" value={show} onChange={(e) => setShow(e.target.value as typeof show)} aria-label="Filter">
          <option value="all">All</option><option value="unread">Unread</option><option value="read">Read</option>
        </select>
      </div>
      {error && <div className="adm-alert" role="alert">{error}</div>}
      {!rows && !error && <div className="adm-loading">Loading…</div>}
      {rows && visible.length === 0 && <div className="adm-card adm-empty">{rows.length ? "No matches." : "No enquiries yet."}</div>}
      <div className="adm-list">
        {visible.map((e) => (
          <article key={e.id} className={`adm-row${e.is_read ? "" : " is-unread"}`}>
            <button type="button" onClick={() => toggle(e)} aria-expanded={open === e.id}
              style={{ all: "unset", cursor: "pointer", display: "grid", gap: 6, minWidth: 0 }}>
              <span className="adm-row-title">{!e.is_read && <span className="adm-dot" aria-label="Unread" />}{e.name}</span>
              <span className="adm-row-meta">
                <span>{e.service}</span>
                <span>{labelFor(REQUEST_TYPES, e.request_type)}</span>
                <span>{formatDate(e.created_at)}</span>
              </span>
            </button>
            {open === e.id && (
              <div>
                <dl className="adm-dl">
                  <dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd>
                  {e.phone && <><dt>Phone</dt><dd><a href={`tel:${e.phone}`}>{e.phone}</a></dd></>}
                  {e.project_location && <><dt>Location</dt><dd>{e.project_location}</dd></>}
                  {e.budget_range && <><dt>Budget</dt><dd>{e.budget_range}</dd></>}
                  <dt>Received</dt><dd>{new Date(e.created_at).toLocaleString("en-IN")}</dd>
                </dl>
                <p className="adm-enquiry-msg">{e.message}</p>
              </div>
            )}
            <div className="adm-row-actions">
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => toggle(e)}>{open === e.id ? "Hide" : "View"}</button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setRead(e, !e.is_read)}>Mark {e.is_read ? "unread" : "read"}</button>
              <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(e)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
