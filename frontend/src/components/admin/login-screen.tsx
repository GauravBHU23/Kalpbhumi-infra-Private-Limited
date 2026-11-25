"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminApiError, adminFetch, type AdminUser } from "../../lib/admin-api";
import type { Portal } from "./admin-shell";
import { CinematicSlides, type CinematicSlide } from "../cinematic-slides";
import { BotCheck } from "../bot-check";

export const LOGIN_SLIDES: CinematicSlide[] = [
  { src: "1429497419816-9ca5cfb4571a", alt: "" },
  { src: "1531834685032-c34bf0d84c77", alt: "" },
  { src: "1626885930974-4b69aa21bbf9", alt: "" },
  { src: "1473042904451-00171c69419d", alt: "" },
];


const COPY: Record<Portal, { title: string; tag: string; eyebrow: string; heading: [string, string]; lead: string; intro: string; button: string }> = {
  admin: {
    title: "Admin sign in | Kalpbhumi Infra",
    tag: "ADMINISTRATION",
    eyebrow: "ADMINISTRATOR ACCESS",
    heading: ["Build with clarity.", "Lead with confidence."],
    lead: "Manage projects, tenders, company details, staff accounts and customer enquiries from one secure workspace.",
    intro: "Sign in with your administrator account.",
    button: "Sign in to admin panel",
  },
  staff: {
    title: "Staff sign in | Kalpbhumi Infra",
    tag: "STAFF PORTAL",
    eyebrow: "EMPLOYEE ACCESS",
    heading: ["One team.", "One workspace."],
    lead: "Update project progress, tenders, team details and follow up on customer enquiries.",
    intro: "Sign in with your approved staff account.",
    button: "Sign in to staff portal",
  },
};

function safeNext(base: string): string {
  if (typeof window === "undefined") return base;
  const next = new URLSearchParams(window.location.search).get("next") || "";
  return next.startsWith(base) && !next.startsWith("//") && !next.startsWith(`${base}/login`) ? next : base;
}

export function LoginScreen({ portal }: { portal: Portal }) {
  const router = useRouter();
  const base = `/${portal}`;
  const copy = COPY[portal];
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [botToken, setBotToken] = useState("");

  useEffect(() => {
    document.title = copy.title;
    // Already signed in to this portal? Go straight in.
    adminFetch<{ user: AdminUser }>("auth/me")
      .then((d) => { if (d.user.role === portal) router.replace(safeNext(base)); })
      .catch(() => undefined);
  }, [router, portal, base, copy.title]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await adminFetch("auth/login", { method: "POST", body: { username, password, portal, turnstile_token: botToken } });
      router.replace(safeNext(base));
    } catch (err) {
      const status = err instanceof AdminApiError ? err.status : 0;
      setError(status === 429 ? "Too many attempts. Please wait and try again later." : err instanceof Error ? err.message : "Sign in failed.");
      setBusy(false);
    }
  }

  return (
    <main className="adm-login">
      <section className="adm-login-story" aria-label="Kalpbhumi Infra">
        <CinematicSlides slides={LOGIN_SLIDES} interval={6000} sizes="(max-width: 900px) 100vw, 55vw" />
        <a className="adm-brand" href="/" aria-label="Kalpbhumi Infra home">
          <span className="adm-brand-mark adm-brand-logo" aria-hidden="true"><img src="/kalpbhumi-logo.png" alt="" /></span>
          <span><strong>KALPBHUMI INFRA</strong><small>{copy.tag}</small></span>
        </a>
        <div>
          <p className="adm-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.heading[0]}<br /><em>{copy.heading[1]}</em></h1>
          <p className="adm-login-lead">{copy.lead}</p>
        </div>
        <span className="adm-login-caption">BUILDING THE WAY FORWARD</span>
      </section>

      <section className="adm-login-panel">
        <div className="adm-login-card">
          <p className="adm-eyebrow">WELCOME BACK</p>
          <h2>{portal === "admin" ? "Admin sign in" : "Staff sign in"}</h2>
          <p className="adm-login-intro">{copy.intro}</p>
          <form className="adm-form" onSubmit={onSubmit} noValidate>
            {error && <div className="adm-alert" role="alert">{error}</div>}
            <label className="adm-field">
              <span>Email / username</span>
              <input className="adm-input" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false}
                value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label className="adm-field">
              <span>Password</span>
              <input className="adm-input" type="password" name="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <BotCheck onVerified={setBotToken} />
            <button className="adm-btn adm-btn-block" type="submit" disabled={busy || !username || !password || !botToken}>
              {busy ? <><span className="btn-spinner" aria-hidden="true" />Signing in…</> : <>{copy.button} <span className="adm-arrow" aria-hidden="true">↗</span></>}
            </button>
          </form>
          {portal === "staff" && (
            <p className="adm-login-switch">New employee? <a href="/staff/register">Create a staff account</a></p>
          )}
          <a className="adm-login-back" href="/">← Back to company website</a>
          <p className="adm-login-security">Restricted access · Authorized {portal === "admin" ? "administrators" : "staff"} only</p>
        </div>
      </section>
    </main>
  );
}
