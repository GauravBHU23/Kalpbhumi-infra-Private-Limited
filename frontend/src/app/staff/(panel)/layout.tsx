import type { ReactNode } from "react";
import { AdminShell } from "../../../components/admin/admin-shell";

export default function StaffPanelLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AdminShell portal="staff">{children}</AdminShell>;
}
