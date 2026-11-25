"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch, type AdminRole, type AdminUser } from "../../../../lib/admin-api";
import { useAdmin } from "../../../../components/admin/admin-shell";
import { formatDate } from "../../../../components/admin/resource-manager";
import { ResetPasswordModal } from "../../../../components/admin/reset-password-modal";

const ROLE_LABEL: Record<AdminRole, string> = { admin: "Admin", staff: "Approved", pending: "Pending approval", disabled: "Disabled" };
const ROLE_PILL: Record<AdminRole, string> = { admin: "adm-pill-ok", staff: "adm-pill-ok", pending: "adm-pill-warn", disabled: "adm-pill-off" };
type StaffRole = Exclude<AdminRole, "admin">;
type Tab = "all" | StaffRole;

export default function StaffAdminPage() {
  const { isAdmin, handleError, refreshUnread } = useAdmin();
  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [resetFor, setResetFor] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    adminFetch<AdminUser[]>("staff").then((d) => { setRows(d); setError(""); }).catch((err) => setError(handleError(err)));
  }, [handleError]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: 0, staff: 0, pending: 0, disabled: 0 };
    for (const u of rows ?? []) { c.all += 1; if (u.role !== "admin") c[u.role] += 1; }
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((u) => (tab === "all" || u.role === tab) &&
      (!q || `${u.name} ${u.username} ${u.email} ${u.phone} ${u.designation}`.toLowerCase().includes(q)));
  }, [rows, tab, query]);

  async function setRole(target: AdminUser, role: StaffRole) {
    if (role === target.role) return;
    setBusyId(target.id);
    try {
      const updated = await adminFetch<AdminUser>(`staff/${target.id}`, { method: "PATCH", body: { role } });
      setRows((list) => list?.map((u) => (u.id === target.id ? updated : u)) ?? null);
      setNotice(`${target.name}: ${ROLE_LABEL[updated.role]}.`);
      refreshUnread();
    } catch (err) {
      window.alert(handleError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(target: AdminUser) {
    const verb = target.role === "pending" ? "Reject and delete" : "Delete";
    if (!window.confirm(`${verb} the account for ${target.name} (${target.username})? This cannot be undone.`)) return;
    setBusyId(target.id);
    try {
      await adminFetch(`staff/${target.id}`, { method: "DELETE" });
      setRows((list) => list?.filter((u) => u.id !== target.id) ?? null);
      setNotice(`${target.name}'s account was deleted.`);
      refreshUnread();
    } catch (err) {
      window.alert(handleError(err));
    } finally {
      setBusyId(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="adm-card adm-empty">
        Only administrators can manage staff accounts.
      </div>
    );
  }

  const actions = (u: AdminUser) => {
    const busy = busyId === u.id;
    if (u.role === "pending") {
      return (
        <>
          <button type="button" className="adm-btn adm-btn-sm" disabled={busy} onClick={() => setRole(u, "staff")}>Approve</button>
          <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" disabled={busy} onClick={() => remove(u)}>Reject</button>
        </>
      );
    }
    return (
      <>
        <select className="adm-input adm-role-select" aria-label={`Status for ${u.name}`} value={u.role} disabled={busy}
          onChange={(e) => setRole(u, e.target.value as StaffRole)}>
          <option value="staff">Approved</option>
          <option value="disabled">Disabled</option>
        </select>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={busy} onClick={() => setResetFor(u)}>Reset password</button>
        <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" disabled={busy} onClick={() => remove(u)}>Delete</button>
      </>
    );
  };

  const tabs: Tab[] = ["all", "pending", "staff", "disabled"];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Staff accounts</h1>
          <p>Approve employee registrations from the staff portal and control who can sign in there.</p>
        </div>
      </div>

      {notice && <div className="adm-alert adm-alert-ok" role="status" style={{ marginBottom: 14 }}>{notice}</div>}

      <div className="adm-tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`adm-tab${tab === t ? " is-active" : ""}`} onClick={() => setTab(t)}>
            {t === "all" ? "All" : ROLE_LABEL[t]} {t === "pending" && counts.pending > 0 ? <b>{counts.pending}</b> : <span>({counts[t]})</span>}
          </button>
        ))}
      </div>
      <div className="adm-toolbar">
        <input className="adm-input" type="search" placeholder="Search name, email, phone…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search staff" />
      </div>

      {error && <div className="adm-alert" role="alert">{error}</div>}
      {!rows && !error && <div className="adm-loading">Loading…</div>}
      {rows && visible.length === 0 && <div className="adm-card adm-empty">{tab === "pending" ? "No registrations waiting for approval." : "No accounts found."}</div>}

      {rows && visible.length > 0 && (
        <>
          <div className="adm-list has-table">
            {visible.map((u) => (
              <article key={u.id} className={`adm-row${u.role === "pending" ? " is-unread" : ""}`}>
                <div className="adm-row-title">{u.name}</div>
                <div className="adm-row-meta">
                  <span className={`adm-pill ${ROLE_PILL[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                  {u.designation && <span>{u.designation}</span>}
                  <span>{u.email || u.username}</span>
                  {u.phone && <span><a href={`tel:${u.phone}`}>{u.phone}</a></span>}
                  <span>Joined {formatDate(u.date_joined)}</span>
                </div>
                <div className="adm-row-actions">{actions(u)}</div>
              </article>
            ))}
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Contact</th><th>Designation</th><th>Status</th><th>Last sign in</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong><br /><small style={{ color: "var(--adm-muted)" }}>@{u.username}</small></td>
                    <td>{u.email}{u.phone && <><br /><small>{u.phone}</small></>}</td>
                    <td>{u.designation || "—"}</td>
                    <td><span className={`adm-pill ${ROLE_PILL[u.role]}`}>{ROLE_LABEL[u.role]}</span></td>
                    <td>{u.last_login ? formatDate(u.last_login) : "Never"}</td>
                    <td className="adm-actions-cell"><div className="adm-row-actions" style={{ justifyContent: "flex-end", marginTop: 0 }}>{actions(u)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {resetFor && <ResetPasswordModal endpoint={`staff/${resetFor.id}/set-password`} target={resetFor} onClose={() => setResetFor(null)} onDone={(msg) => { setResetFor(null); setNotice(msg); }} />}
    </>
  );
}
