import type { NextConfig } from "next";

// Security headers and CSP are added in WU-09 (docs/07-INFRASTRUCTURE.md).
const nextConfig: NextConfig = {
  // Stops `next dev` from appending its own block to CLAUDE.md (G-011).
  agentRules: false,
};

export default nextConfig;
