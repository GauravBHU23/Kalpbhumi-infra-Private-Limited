"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminApiError, adminFetch } from "../../../lib/admin-api";
import { CinematicSlides } from "../../../components/cinematic-slides";
import { LOGIN_SLIDES } from "../../../components/admin/login-screen";
import { BotCheck } from "../../../components/bot-check";

type Values = {
  first_name: string; last_name: string; username: string; email: string;
  phone: string; designation: string; password: string; confirm_password: string;
};

const EMPTY: Values = { first_name: "", last_name: "", username: "", email: "", phone: "", designation: "", password: "", confirm_password: "" };

export default function StaffRegisterPage() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [botToken, setBotToken] = useState("");

  useEffect(() => { document.title = "Staff registration | Kalpbhumi Infra"; }, []);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    if (values.password !== values.confirm_password) {
      setErrors({ confirm_password: "Passwords do not match." });
      return;
    }
    setBusy(true);
    try {
      await adminFetch("auth/register", { method: "POST", body: { ...values, turnstile_token: botToken } });
      setDone(true);
      setValues(EMPTY);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setErrors(err.fieldErrors);
        setFormError(err.status === 429 ? "Too many registrations from this network. Please try again later." : err.message);
      } else setFormError("Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof Values, label: string, props: Record<string, unknown> = {}, full = false) => (
    <label className={`adm-field${full ? " adm-field-full" : ""}${errors[key] ? " has-error" : ""}`}>
      <span>{label}{props.required ? " *" : ""}</span>
      <input className="adm-input" name={key} value={values[key]} onChange={set(key)} {...props} />
      {errors[key] && <span className="adm-field-error">{errors[key]}</span>}
    </label>
  );

  return (
    <main className="adm-login">
      <section className="adm-login-story" aria-label="Kalpbhumi Infra">
        <CinematicSlides slides={LOGIN_SLIDES} interval={6000} sizes="(max-width: 900px) 100vw, 55vw" />
        <a className="adm-brand" href="/" aria-label="Kalpbhumi Infra home">
          <span className="adm-brand-mark adm-brand-logo" aria-hidden="true"><img src="/kalpbhumi-logo.png" alt="" /></span>
          <span><strong>KALPBHUMI INFRA</strong><small>STAFF PORTAL</small></span>
        </a>
        <div>
          <p className="adm-eyebrow">JOIN THE WORKSPACE</p>
          <h1>One team.<br /><em>One workspace.</em></h1>
          <p className="adm-login-lead">Employees can request access here. An administrator reviews every request before the account can sign in.</p>
        </div>
        <span className="adm-login-caption">BUILDING THE WAY FORWARD</span>
      </section>

      <section className="adm-login-panel">
        <div className="adm-login-card adm-login-card-wide">
          <p className="adm-eyebrow">STAFF REGISTRATION</p>
          <h2>Create your account</h2>
          {done ? (
            <div className="adm-success" role="status">
              <strong>Request submitted</strong>
              <span>Your account has been created and is waiting for administrator approval. You can sign in once it is approved.</span>
              <a className="adm-btn" href="/staff/login">Go to sign in</a>
            </div>
          ) : (
            <>
              <p className="adm-login-intro">Use your work details. Your account becomes active after an administrator approves it.</p>
              <form className="adm-form" onSubmit={onSubmit} noValidate>
                {formError && <div className="adm-alert" role="alert">{formError}</div>}
                <div className="adm-form-grid">
                  {field("first_name", "First name", { required: true, autoComplete: "given-name" })}
                  {field("last_name", "Last name", { autoComplete: "family-name" })}
                  {field("email", "Work email", { type: "email", required: true, autoComplete: "email", autoCapitalize: "none" })}
                  {field("phone", "Mobile number", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
                  {field("designation", "Designation", { placeholder: "e.g. Site Engineer" })}
                  {field("username", "Username", { required: true, autoComplete: "username", autoCapitalize: "none", spellCheck: false })}
                  {field("password", "Password", { type: "password", required: true, autoComplete: "new-password" })}
                  {field("confirm_password", "Confirm password", { type: "password", required: true, autoComplete: "new-password" })}
                </div>
                <p className="adm-hint">At least 8 characters; avoid common passwords, only numbers, or anything similar to your name or email.</p>
                <BotCheck onVerified={setBotToken} />
                <button className="adm-btn adm-btn-block" type="submit"
                  disabled={busy || !botToken || !values.first_name || !values.email || !values.username || !values.password || !values.confirm_password}>
                  {busy ? <><span className="btn-spinner" aria-hidden="true" />Submitting…</> : <>Request access <span className="adm-arrow" aria-hidden="true">↗</span></>}
                </button>
              </form>
            </>
          )}
          <p className="adm-login-switch">Already have an account? <a href="/staff/login">Sign in</a></p>
          <a className="adm-login-back" href="/">← Back to company website</a>
        </div>
      </section>
    </main>
  );
}
