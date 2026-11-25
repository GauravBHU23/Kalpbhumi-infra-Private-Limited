import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ["*.ngrok-free.dev", "192.168.1.14"],
  async rewrites() {
    return [
      // Staff-only admin JSON API used by the Next.js admin panel at /admin.
      { source: "/backend-api/admin/:path*", destination: `${backendApiUrl}/api/admin/:path*/` },
      { source: "/media/:path*", destination: `${backendApiUrl}/media/:path*` },
      { source: "/backend-api/company", destination: `${backendApiUrl}/api/company/` },
      { source: "/backend-api/projects", destination: `${backendApiUrl}/api/projects/` },
      { source: "/backend-api/tenders", destination: `${backendApiUrl}/api/tenders/` },
      { source: "/backend-api/team", destination: `${backendApiUrl}/api/team/` },
      { source: "/backend-api/enquiries", destination: `${backendApiUrl}/api/enquiries/` },
      { source: "/backend-api/visits", destination: `${backendApiUrl}/api/visits/` },
      { source: "/backend-media/media/:path*", destination: `${backendApiUrl}/media/:path*` },
    ];
  },
};

export default nextConfig;
