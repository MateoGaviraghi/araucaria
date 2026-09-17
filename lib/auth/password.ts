import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// C-02. Stored as scrypt$N$r$p$saltB64$hashB64.
const N = 131072;
const R = 8;
const P = 1;
const SALT_BYTES = 16;
const KEY_BYTES = 64;
// N = 2^17 with r = 8 needs ~128 MiB; Node's 32 MiB default throws (G-005).
const MAXMEM = 256 * 1024 * 1024;

function derive(passphrase: string, salt: Buffer, n: number, r: number, p: number, keyBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // NFKC so the same passphrase typed on a phone or a PC hashes the same.
    scrypt(passphrase.normalize("NFKC"), salt, keyBytes, { N: n, r, p, maxmem: MAXMEM }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(passphrase: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(passphrase, salt, N, R, P, KEY_BYTES);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

type ParsedHash = { n: number; r: number; p: number; salt: Buffer; key: Buffer };

function parseHash(stored: string): ParsedHash | null {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [n, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
  if (![n, r, p].every((value) => Number.isInteger(value) && value > 0)) return null;
  const salt = Buffer.from(parts[4] ?? "", "base64");
  const key = Buffer.from(parts[5] ?? "", "base64");
  if (salt.length === 0 || key.length === 0) return null;
  return { n, r, p, salt, key };
}

// `stored` is null when no credential exists: the work is still done so timing reveals nothing.
export async function verifyPassword(passphrase: string, stored: string | null): Promise<boolean> {
  const parsed = stored ? parseHash(stored) : null;
  if (!parsed) {
    await derive(passphrase, randomBytes(SALT_BYTES), N, R, P, KEY_BYTES);
    return false;
  }
  const candidate = await derive(passphrase, parsed.salt, parsed.n, parsed.r, parsed.p, parsed.key.length);
  return timingSafeEqual(candidate, parsed.key);
}
