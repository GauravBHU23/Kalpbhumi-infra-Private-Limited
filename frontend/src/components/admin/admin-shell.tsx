"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminApiError, adminFetch, type AdminUser } from "../../lib/admin-api";

/** "admin" -> /admin/* (administrators only), "staff" -> /staff/* (staff only). The two never link to each other. */
export type Portal = "admin" | "staff";

type ShellContext = {
  portal: Portal;
  /** Base path of the current portal, e.g. "/admin" or "/staff". */
  base: string;
  user: AdminUser;
  isAdmin: boolean;
  setUser: (user: AdminUser) => void;
  unread: number;
  pendingStaff: number;
  refreshUnread: () => void;
  /** Call from pages when an API call fails; redirects to login on auth errors. */
  handleError: (error: unknown) => string;
};

const AdminContext = createContext<ShellContext | null>(null);

export function useAdmin(): ShellContext {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminShell");
  return ctx;
}

type IconName = "dashboard" | "inbox" | "projects" | "tenders" | "team" | "company" | "staff" | "admins" | "account";
type NavItem = { path: string; label: string; icon: IconName; badge?: "unread" | "pending" };
type NavGroup = { title: string; items: NavItem[] };

const NAV: Record<Portal, NavGroup[]> = {
  admin: [
    { title: "Overview", items: [
      { path: "", label: "Dashboard", icon: "dashboard" },
      { path: "/enquiries", label: "Enquiries", icon: "inbox", badge: "unread" },
    ] },
    { title: "Website content", items: [
      { path: "/projects", label: "Projects", icon: "projects" },
      { path: "/tenders", label: "Tenders", icon: "tenders" },
      { path: "/team", label: "Team section", icon: "team" },
      { path: "/company", label: "Company profile", icon: "company" },
    ] },
    { title: "Accounts", items: [
      { path: "/staff", label: "Staff accounts", icon: "staff", badge: "pending" },
      { path: "/admins", label: "Admin accounts", icon: "admins" },
      { path: "/account", label: "My account", icon: "account" },
    ] },
  ],
  staff: [
    { title: "Overview", items: [
      { path: "", label: "Dashboard", icon: "dashboard" },
      { path: "/enquiries", label: "Enquiries", icon: "inbox", badge: "unread" },
    ] },
    { title: "Website content", items: [
      { path: "/projects", label: "Projects", icon: "projects" },
      { path: "/tenders", label: "Tenders", icon: "tenders" },
      { path: "/team", label: "Team section", icon: "team" },
    ] },
    { title: "Account", items: [{ path: "/account", label: "My account", icon: "account" }] },
  ],
};

const ICON_PATHS: Record<IconName | "external" | "logout", string> = {
  dashboard: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  inbox: "M4 5h16v14H4zM4 13h5l1.5 2.5h3L15 13h5",
  projects: "M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6",
  tenders: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  team: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5.5M18 14.5c1.8.9 3 2.9 3 5.5",
  company: "M4 21V5l8-2v18M12 8h8v13M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01",
  staff: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7",
  admins: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM9 12l2 2 4-4",
  account: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};

function Icon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg className="adm-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "")).toUpperCase() || "K";
}

const COPY: Record<Portal, { short: string; long: string; role: string }> = {
  admin: { short: "ADMIN", long: "ADMINISTRATION", role: "Administrator" },
  staff: { short: "STAFF", long: "STAFF PORTAL", role: "Staff" },
};

export function AdminShell({ portal, children }: { portal: Portal; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const base = `/${portal}`;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [wrongPortal, setWrongPortal] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pendingStaff, setPendingStaff] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const toLogin = useCallback(() => {
    router.replace(`${base}/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [router, base]);

  const refreshUnread = useCallback(() => {
    adminFetch<{ enquiries_unread: number; staff_pending: number }>("dashboard")
      .then((d) => { setUnread(d.enquiries_unread); setPendingStaff(d.staff_pending); })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    adminFetch<{ user: AdminUser }>("auth/me")
      .then((d) => {
        if (d.user.role !== portal) { setWrongPortal(true); return; }
        setUser(d.user);
        refreshUnread();
      })
      .catch(toLogin);
  }, [portal, toLogin, refreshUnread]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AdminApiError && error.isAuthError) {
      toLogin();
      return "Your session has expired. Please sign in again.";
    }
    return error instanceof Error ? error.message : "Something went wrong.";
  }, [toLogin]);

  async function logout() {
    setSigningOut(true);
    await adminFetch("auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace(`${base}/login`);
  }

  const center = { minHeight: "100svh", display: "grid", placeItems: "center", padding: 18 } as const;

  if (wrongPortal) {
    return (
      <div style={center}>
        <div className="adm-card" style={{ maxWidth: 420, textAlign: "center" }}>
          <h2>Not available for this account</h2>
          <p className="adm-hint" style={{ marginBottom: 16 }}>You are signed in with an account that cannot use this area. Sign out to continue.</p>
          <button type="button" className="adm-btn" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  }

  if (!user) return <div className="adm-loading" style={{ minHeight: "100svh", padding: 18 }} role="status">Loading…</div>;

  const isAdmin = user.role === "admin";
  const isActive = (path: string) => (path === "" ? pathname === base : pathname.startsWith(base + path));

  return (
    <AdminContext.Provider value={{ portal, base, user, isAdmin, setUser, unread, pendingStaff, refreshUnread, handleError }}>
      <div className="adm-shell">
        <header className="adm-topbar">
          <Link className="adm-brand" href={base}>
            <span className="adm-brand-mark adm-brand-logo" aria-hidden="true"><img src="/kalpbhumi-logo.png" alt="" /></span>
            <span><strong>KALPBHUMI</strong><small>{COPY[portal].short}</small></span>
          </Link>
          <div className="adm-topbar-right">
            <span className="adm-avatar adm-avatar-sm" aria-hidden="true">{initials(user.name)}</span>
            <button className="adm-menu-btn" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>☰</button>
          </div>
        </header>

        {menuOpen && <div className="adm-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

        <aside className={`adm-sidebar${menuOpen ? " is-open" : ""}`} aria-label="Navigation">
          <div className="adm-sidebar-head">
            <Link className="adm-brand" href={base}>
              <span className="adm-brand-mark adm-brand-logo" aria-hidden="true"><img src="/kalpbhumi-logo.png" alt="" /></span>
              <span><strong>KALPBHUMI INFRA</strong><small>{COPY[portal].long}</small></span>
            </Link>
            <button className="adm-menu-btn" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>✕</button>
          </div>
          <nav className="adm-nav" aria-label="Sections">
            {NAV[portal].map((group) => (
              <div key={group.title} className="adm-nav-group">
                <p className="adm-nav-title">{group.title}</p>
                {group.items.map((item) => (
                  <Link key={item.path} href={base + item.path} className={isActive(item.path) ? "is-active" : undefined}
                    aria-current={isActive(item.path) ? "page" : undefined}>
                    <Icon name={item.icon} />
                    <span className="adm-nav-label">{item.label}</span>
                    {item.badge === "unread" && unread > 0 && <span className="adm-nav-badge">{unread}</span>}
                    {item.badge === "pending" && pendingStaff > 0 && <span className="adm-nav-badge">{pendingStaff}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="adm-sidebar-foot">
            <div className="adm-usercard">
              <span className="adm-avatar" aria-hidden="true">{initials(user.name)}</span>
              <div className="adm-usercard-text">
                <span className="adm-usercard-label">Signed in as</span>
                <strong title={user.name}>{user.name}</strong>
                <span className="adm-role-pill">{COPY[portal].role}{user.designation ? ` · ${user.designation}` : ""}</span>
              </div>
            </div>
            <div className="adm-foot-actions">
              <a className="adm-foot-btn" href="/" target="_blank" rel="noreferrer"><Icon name="external" /> Website</a>
              <button type="button" className="adm-foot-btn adm-foot-btn-out" onClick={logout} disabled={signingOut}>
                {signingOut ? <span className="btn-spinner" aria-hidden="true" /> : <Icon name="logout" />} {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </aside>

        <main className="adm-main">{children}</main>
      </div>
    </AdminContext.Provider>
  );
}
