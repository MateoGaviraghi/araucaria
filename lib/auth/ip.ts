import { createHmac } from "node:crypto";

type HeaderReader = { get(name: string): string | null };

// Vercel overwrites x-forwarded-for with the real client address, so it cannot be spoofed there.
// Locally the header is usually absent and every request shares one bucket.
export function clientIp(headers: HeaderReader): string {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "unknown";
}

// Raw IPs are never stored or logged (docs/08-SECURITY.md §5).
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set");
  return createHmac("sha256", salt).update(ip).digest("hex");
}
