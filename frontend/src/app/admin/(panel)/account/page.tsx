"use client";

import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { AdminApiError, adminFetch, type AdminUser } from "../../../../lib/admin-api";
import { useAdmin } from "../../../../components/admin/admin-shell";
import { formatDate } from "../../../../components/admin/resource-manager";

type Msg = { ok: boolean; text: string } | null;

export default function MyAccountPage() {
  const { user, isAdmin, setUser, handleError } = useAdmin();

  const [profile, setProfile] = useState({
    first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone, designation: user.designation,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [savingPw, setSavingPw] = useState(false);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true); setProfileErrors({}); setProfileMsg(null);
    try {
      const res = await adminFetch<{ user: AdminUser }>("auth/me", { method: "PATCH", body: profile });
      setUser(res.user);
      setProfileMsg({ ok: true, text: "Profile updated." });
    } catch (err) {
      if (err instanceof AdminApiError && !err.isAuthError) setProfileErrors(err.fieldErrors);
      setProfileMsg({ ok: false, text: handleError(err) });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setPwErrors({}); setPwMsg(null);
    if (pw.new_password !== pw.confirm_password) { setPwErrors({ confirm_password: "Passwords do not match." }); return; }
    setSavingPw(true);
    try {
      await adminFetch("auth/password", { method: "POST", body: pw });
      setPw({ current_password: "", new_password: "", confirm_password: "" });
      setPwMsg({ ok: true, text: "Password changed." });
    } catch (err) {
      if (err instanceof AdminApiError && !err.isAuthError) setPwErrors(err.fieldErrors);
      setPwMsg({ ok: false, text: err instanceof AdminApiError && err.status === 400 ? "Please fix the highlighted fields." : handleError(err) });
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>My account</h1>
          <p>{isAdmin ? "Administrator" : "Staff"} · @{user.username} · joined {formatDate(user.date_joined)}</p>
        </div>
      </div>

      <div className="adm-form">
        <form className="adm-card adm-form" onSubmit={saveProfile} noValidate>
          <h2>Profile</h2>
          {profileMsg && <div className={`adm-alert${profileMsg.ok ? " adm-alert-ok" : ""}`} role={profileMsg.ok ? "status" : "alert"}>{profileMsg.text}</div>}
          <div className="adm-form-grid">
            <TextField label="First name" value={profile.first_name} error={profileErrors.first_name} onChange={(v) => setProfile((s) => ({ ...s, first_name: v }))} required autoComplete="given-name" />
            <TextField label="Last name" value={profile.last_name} error={profileErrors.last_name} onChange={(v) => setProfile((s) => ({ ...s, last_name: v }))} autoComplete="family-name" />
            <TextField label="Email" value={profile.email} error={profileErrors.email} onChange={(v) => setProfile((s) => ({ ...s, email: v }))} type="email" required autoComplete="email" />
            <TextField label="Mobile number" value={profile.phone} error={profileErrors.phone} onChange={(v) => setProfile((s) => ({ ...s, phone: v }))} type="tel" autoComplete="tel" />
            <TextField label="Designation" value={profile.designation} error={profileErrors.designation} onChange={(v) => setProfile((s) => ({ ...s, designation: v }))} />
          </div>
          <div><button type="submit" className="adm-btn" disabled={savingProfile}>{savingProfile ? <><span className="btn-spinner" aria-hidden="true" />Saving…</> : "Save profile"}</button></div>
        </form>

        <form className="adm-card adm-form" onSubmit={changePassword} noValidate>
          <h2>Change password</h2>
          {pwMsg && <div className={`adm-alert${pwMsg.ok ? " adm-alert-ok" : ""}`} role={pwMsg.ok ? "status" : "alert"}>{pwMsg.text}</div>}
          <div className="adm-form-grid">
            <TextField label="Current password" value={pw.current_password} error={pwErrors.current_password} onChange={(v) => setPw((s) => ({ ...s, current_password: v }))} type="password" autoComplete="current-password" />
            <span aria-hidden="true" />
            <TextField label="New password" value={pw.new_password} error={pwErrors.new_password} onChange={(v) => setPw((s) => ({ ...s, new_password: v }))} type="password" autoComplete="new-password" />
            <TextField label="Confirm new password" value={pw.confirm_password} error={pwErrors.confirm_password} onChange={(v) => setPw((s) => ({ ...s, confirm_password: v }))} type="password" autoComplete="new-password" />
          </div>
          <p className="adm-hint">At least 8 characters; avoid common passwords and anything similar to your name or email.</p>
          <div><button type="submit" className="adm-btn" disabled={savingPw || !pw.current_password || !pw.new_password}>{savingPw ? <><span className="btn-spinner" aria-hidden="true" />Saving…</> : "Change password"}</button></div>
        </form>
      </div>
    </>
  );
}

function TextField({ label, value, error, onChange, ...props }: {
  label: string; value: string; error?: string; onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className={`adm-field${error ? " has-error" : ""}`}>
      <span>{label}{props.required ? " *" : ""}</span>
      <input className="adm-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...props} />
      {error && <span className="adm-field-error">{error}</span>}
    </label>
  );
}
