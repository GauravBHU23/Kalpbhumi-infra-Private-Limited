"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "../../../lib/admin-api";
import { useAdmin } from "../../../components/admin/admin-shell";
import { formatDate } from "../../../components/admin/resource-manager";

type Dashboard = {
  projects: number; projects_published: number; tenders: number; tenders_open: number; team: number;
  enquiries: number; enquiries_unread: number; staff_pending: number;
  recent_enquiries: { id: number; name: string; service: string; created_at: string; is_read: boolean }[];
};

export default function AdminDashboardPage() {
  const { user, isAdmin, base, handleError } = useAdmin();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Dashboard>("dashboard").then(setData).catch((err) => setError(handleError(err)));
  }, [handleError]);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p>{isAdmin ? "Content and operations overview." : "Your staff workspace."}</p>
        </div>
      </div>
      {error && <div className="adm-alert" role="alert">{error}</div>}
      {!data && !error && <div className="adm-loading">Loading…</div>}
      {data && (
        <>
          {isAdmin && data.staff_pending > 0 && (
            <div className="adm-alert" role="status" style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span><strong>{data.staff_pending}</strong> staff registration{data.staff_pending === 1 ? " is" : "s are"} waiting for your approval.</span>
              <Link className="adm-btn adm-btn-sm" href={`${base}/staff`}>Review requests</Link>
            </div>
          )}
          <div className="adm-stats">
            <Link className="adm-stat" href={`${base}/enquiries`}><span>Enquiries</span><strong>{data.enquiries}</strong><small>{data.enquiries_unread} unread</small></Link>
            <Link className="adm-stat" href={`${base}/projects`}><span>Projects</span><strong>{data.projects}</strong><small>{data.projects_published} published</small></Link>
            <Link className="adm-stat" href={`${base}/tenders`}><span>Tenders</span><strong>{data.tenders}</strong><small>{data.tenders_open} open</small></Link>
            <Link className="adm-stat" href={`${base}/team`}><span>Team</span><strong>{data.team}</strong><small>members</small></Link>
          </div>
          <section className="adm-card">
            <h2>Recent enquiries</h2>
            {data.recent_enquiries.length === 0 ? <p className="adm-empty" style={{ padding: 16 }}>No enquiries yet.</p> : (
              <div className="adm-list">
                {data.recent_enquiries.map((e) => (
                  <Link key={e.id} href={`${base}/enquiries`} className={`adm-row${e.is_read ? "" : " is-unread"}`} style={{ textDecoration: "none" }}>
                    <div className="adm-row-title">{!e.is_read && <span className="adm-dot" aria-label="Unread" />}{e.name}</div>
                    <div className="adm-row-meta"><span>{e.service}</span><span>{formatDate(e.created_at)}</span></div>
                  </Link>
                ))}
              </div>
            )}
            <div style={{ marginTop: 14 }}><Link className="adm-btn adm-btn-ghost" href={`${base}/enquiries`}>View all enquiries →</Link></div>
          </section>
        </>
      )}
    </>
  );
}
