import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../admin/admin.css";

export const metadata: Metadata = {
  title: { default: "Staff portal | Kalpbhumi Infra", template: "%s | Kalpbhumi Infra Staff" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#15271e" };

export default function StaffRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="adm">{children}</div>;
}
