"use client";

import { useState, type FormEvent } from "react";
import { AdminApiError, adminFetch, type AdminUser } from "../../lib/admin-api";
import { useAdmin } from "./admin-shell";
import { Modal } from "./resource-manager";

export function ResetPasswordModal({ endpoint, target, onClose, onDone }: { endpoint: string; target: AdminUser; onClose: () => void; onDone: (message: string) => void }) {
  const { handleError } = useAdmin();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch<{ detail: string }>(endpoint, { method: "POST", body: { password } });
      onDone(res.detail);
    } catch (err) {
      setError(err instanceof AdminApiError && !err.isAuthError ? [err.message, ...Object.values(err.fieldErrors)].filter(Boolean).join(" ") : handleError(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={`Reset password: ${target.name}`} onClose={onClose} footer={<>
      <button type="button" className="adm-btn adm-btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
      <button type="submit" form="adm-reset-form" className="adm-btn" disabled={busy || !password}>{busy ? <><span className="btn-spinner" aria-hidden="true" />Saving…</> : "Set new password"}</button>
    </>}>
      <div className="adm-modal-body">
        <form id="adm-reset-form" className="adm-form" onSubmit={onSubmit} noValidate>
          {error && <div className="adm-alert" role="alert">{error}</div>}
          <p className="adm-hint">They will be signed out everywhere and must use this new password. Share it with them securely.</p>
          <label className="adm-field"><span>New password</span>
            <input className="adm-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="adm-field"><span>Confirm new password</span>
            <input className="adm-input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
        </form>
      </div>
    </Modal>
  );
}
