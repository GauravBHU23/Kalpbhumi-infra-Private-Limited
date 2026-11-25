import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../admin/admin.css";
import { COMPANY_NAME } from "../../lib/site-config";

export const metadata: Metadata = {
  title: { default: `Staff portal | ${COMPANY_NAME}`, template: `%s | ${COMPANY_NAME} Staff` },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#15271e" };

export default function StaffRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="adm">{children}</div>;
}
