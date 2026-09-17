import type { NextConfig } from "next";

// Site-wide security headers and CSP are added in WU-09 (docs/07-INFRASTRUCTURE.md).
const ADMIN_HEADERS = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  // Stops `next dev` from appending its own block to CLAUDE.md (G-011).
  agentRules: false,
  // Cache Components: `use cache` + cacheTag for the public availability read (D-021).
  cacheComponents: true,
  async headers() {
    return [
      { source: "/admin", headers: ADMIN_HEADERS },
      { source: "/admin/:path*", headers: ADMIN_HEADERS },
    ];
  },
};

export default nextConfig;
