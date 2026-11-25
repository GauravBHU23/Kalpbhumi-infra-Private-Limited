import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin | Kalpbhumi Infra", template: "%s | Kalpbhumi Infra Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#15271e" };

export default function AdminRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="adm">{children}</div>;
}
