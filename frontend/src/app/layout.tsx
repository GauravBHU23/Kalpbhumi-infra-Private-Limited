import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ClickLoader } from "../components/click-loader";
import { COMPANY_NAME } from "../lib/site-config";

export const metadata: Metadata = {
  title: `${COMPANY_NAME} | Building the way forward`,
  description: `${COMPANY_NAME} delivers building construction, road infrastructure and civil engineering works.`,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><head>
    <meta name="theme-color" content="#15271e" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head><body><ClickLoader />{children}</body></html>;
}
