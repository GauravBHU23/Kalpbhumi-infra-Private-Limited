import type { ReactNode } from "react";
import { AdminShell } from "../../../components/admin/admin-shell";

export default function AdminPanelLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AdminShell portal="admin">{children}</AdminShell>;
}
