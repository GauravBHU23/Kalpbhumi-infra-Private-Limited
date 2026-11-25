"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AdminApiError, adminFetch, type AdminUser } from "../../../../lib/admin-api";
import { useAdmin } from "../../../../components/admin/admin-shell";
import { Modal, formatDate } from "../../../../components/admin/resource-manager";
import { ResetPasswordModal } from "../../../../components/admin/reset-password-modal";

export default function AdminAccountsPage() {
  const { user: me, handleError } = useAdmin();
  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    adminFetch<AdminUser[]>("admins").then((d) => { setRows(d); setError(""); }).catch((err) => setError(handleError(err)));
  }, [handleError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  async function setActive(target: AdminUser, active: boolean) {
    if (!active && !window.confirm(`Disable admin access for ${target.name}?`)) return;
    setBusyId(target.id);
    try {
      const updated = await adminFetch<AdminUser>(`admins/${target.id}`, { method: "PATCH", body: { active } });
      setRows((list) => list?.map((u) => (u.id === target.id ? updated : u)) ?? null);
      setNotice(`${target.name} ${active ? "enabled" : "disabled"}.`);
    } catch (err) {
      window.alert(handleError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(target: AdminUser) {
    if (!window.confirm(`Delete the admin account for ${target.name} (${target.username})? This cannot be undone.`)) return;
    setBusyId(target.id);
    try {
      await adminFetch(`admins/${target.id}`, { method: "DELETE" });
      setRows((list) => list?.filter((u) => u.id !== target.id) ?? null);
      setNotice(`${target.name}'s admin account was deleted.`);
    } catch (err) {
      window.alert(handleError(err));
    } finally {
      setBusyId(null);
    }
  }

  const actions = (u: AdminUser) => {
    const self = u.id === me.id;
    const busy = busyId === u.id;
    return (
      <>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={busy} onClick={() => setResetFor(u)}>Reset password</button>
        {!self && (u.role === "disabled"
          ? <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={busy} onClick={() => setActive(u, true)}>Enable</button>
          : <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" disabled={busy} onClick={() => setActive(u, false)}>Disable</button>)}
        {!self && <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" disabled={busy} onClick={() => remove(u)}>Delete</button>}
      </>
    );
  };

  const pill = (u: AdminUser) => (
    <span className={`adm-pill ${u.role === "disabled" ? "adm-pill-off" : "adm-pill-ok"}`}>{u.role === "disabled" ? "Disabled" : "Active"}</span>
  );

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Admin accounts</h1>
          <p>Administrators sign in at the admin login. New admins can only be created here.</p>
        </div>
        <button type="button" className="adm-btn" onClick={() => setCreating(true)}>+ Add admin</button>
      </div>

      {notice && <div className="adm-alert adm-alert-ok" role="status" style={{ marginBottom: 14 }}>{notice}</div>}
      {error && <div className="adm-alert" role="alert">{error}</div>}
      {!rows && !error && <div className="adm-loading">Loading…</div>}

      {rows && (
        <>
          <div className="adm-list has-table">
            {rows.map((u) => (
              <article key={u.id} className="adm-row">
                <div className="adm-row-title">{u.name}{u.id === me.id ? " (you)" : ""}</div>
                <div className="adm-row-meta">
                  {pill(u)}
                  <span>{u.email || u.username}</span>
                  {u.phone && <span>{u.phone}</span>}
                  <span>Last sign in {u.last_login ? formatDate(u.last_login) : "never"}</span>
                </div>
                <div className="adm-row-actions">{actions(u)}</div>
              </article>
            ))}
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Last sign in</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong>{u.id === me.id ? " (you)" : ""}<br /><small style={{ color: "var(--adm-muted)" }}>@{u.username}</small></td>
                    <td>{u.email || "—"}</td>
                    <td>{u.phone || "—"}</td>
                    <td>{pill(u)}</td>
                    <td>{u.last_login ? formatDate(u.last_login) : "Never"}</td>
                    <td className="adm-actions-cell"><div className="adm-row-actions" style={{ justifyContent: "flex-end", marginTop: 0 }}>{actions(u)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {creating && (
        <CreateAdminModal
          onClose={() => setCreating(false)}
          onCreated={(u) => { setCreating(false); setRows((list) => [...(list ?? []), u]); setNotice(`Admin account created for ${u.name}.`); }}
        />
      )}
      {resetFor && (
        <ResetPasswordModal endpoint={`admins/${resetFor.id}/set-password`} target={resetFor}
          onClose={() => setResetFor(null)} onDone={(msg) => { setResetFor(null); setNotice(msg); }} />
      )}
    </>
  );
}

const EMPTY = { first_name: "", last_name: "", username: "", email: "", phone: "", password: "", confirm_password: "" };

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: (user: AdminUser) => void }) {
  const { handleError } = useAdmin();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    if (values.password !== values.confirm_password) { setErrors({ confirm_password: "Passwords do not match." }); return; }
    setBusy(true);
    try {
      onCreated(await adminFetch<AdminUser>("admins", { method: "POST", body: values }));
    } catch (err) {
      if (err instanceof AdminApiError && !err.isAuthError) { setErrors(err.fieldErrors); setFormError(err.message); }
      else setFormError(handleError(err));
      setBusy(false);
    }
  }

  const field = (key: keyof typeof EMPTY, label: string, props: Record<string, unknown> = {}) => (
    <label className={`adm-field${errors[key] ? " has-error" : ""}`}>
      <span>{label}{props.required ? " *" : ""}</span>
      <input className="adm-input" value={values[key]} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} {...props} />
      {errors[key] && <span className="adm-field-error">{errors[key]}</span>}
    </label>
  );

  return (
    <Modal title="Add admin" onClose={() => { if (!busy) onClose(); }} footer={<>
      <button type="button" className="adm-btn adm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
      <button type="submit" form="adm-create-admin" className="adm-btn" disabled={busy}>{busy ? <><span className="btn-spinner" aria-hidden="true" />Creating…</> : "Create admin"}</button>
    </>}>
      <div className="adm-modal-body">
        <form id="adm-create-admin" className="adm-form" onSubmit={onSubmit} noValidate>
          {formError && <div className="adm-alert" role="alert">{formError}</div>}
          <p className="adm-hint">This person gets full access, including company details and all staff and admin accounts.</p>
          <div className="adm-form-grid">
            {field("first_name", "First name", { required: true })}
            {field("last_name", "Last name")}
            {field("email", "Email", { type: "email", required: true, autoComplete: "off" })}
            {field("phone", "Mobile number", { type: "tel" })}
            {field("username", "Username", { required: true, autoCapitalize: "none", autoComplete: "off" })}
            <span aria-hidden="true" />
            {field("password", "Password", { type: "password", required: true, autoComplete: "new-password" })}
            {field("confirm_password", "Confirm password", { type: "password", required: true, autoComplete: "new-password" })}
          </div>
        </form>
      </div>
    </Modal>
  );
}
