// Operator-only (docs/08-SECURITY.md §6). Creates the admin credential or rotates it, which logs out
// every session. Runs on Node 24 directly: `npm run rotate-password` (uses .env.local) or
// `npm run rotate-password -- <env file>`. It never prints or logs the passphrase.

import { neon } from "@neondatabase/serverless";
import { createInterface } from "node:readline/promises";
import { MIN_PASSPHRASE_LENGTH } from "../lib/auth/config.ts";
import { hashPassword } from "../lib/auth/password.ts";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function askVisible(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(prompt);
  rl.close();
  return answer;
}

// Reads a line in raw mode so nothing typed or pasted is echoed.
function askHidden(prompt: string): Promise<string> {
  const stdin = process.stdin;
  if (!stdin.isTTY) fail("Corré el script en una terminal interactiva.");
  process.stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = "";
    const finish = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          finish();
          resolve(value);
          return;
        }
        if (char === "") {
          finish();
          reject(new Error("Cancelado."));
          return;
        }
        if (char === "" || char === "\b") {
          value = [...value].slice(0, -1).join("");
          continue;
        }
        value += char;
      }
    };
    stdin.on("data", onData);
  });
}

const envFile = process.argv[2] ?? ".env.local";
try {
  process.loadEnvFile(envFile);
} catch {
  fail(`No pude leer ${envFile}.`);
}
const url = process.env.DATABASE_URL;
if (!url) fail(`DATABASE_URL no está en ${envFile}.`);

console.log(`Base de destino: ${new URL(url).hostname}`);
if ((await askVisible('Escribí "rotar" para continuar: ')).trim() !== "rotar") fail("Cancelado.");

const passphrase = await askHidden("Nueva frase: ");
if ((await askHidden("Repetila: ")) !== passphrase) fail("No coinciden. No se cambió nada.");
if ([...passphrase.normalize("NFKC")].length < MIN_PASSPHRASE_LENGTH) {
  fail(`Tiene que tener al menos ${MIN_PASSPHRASE_LENGTH} caracteres. No se cambió nada.`);
}

const passwordHash = await hashPassword(passphrase);
const sql = neon(url);

// One statement: upsert the single credential row and audit it atomically.
const rows = await sql`
  with credential as (
    insert into admin_credential (id, password_hash)
    values (1, ${passwordHash})
    on conflict (id) do update
      set password_hash = excluded.password_hash,
          credential_version = admin_credential.credential_version + 1,
          rotated_at = now()
    returning credential_version
  )
  insert into admin_audit (action, detail)
  select 'password_rotated', jsonb_build_object('credential_version', credential_version)
  from credential
  returning (detail ->> 'credential_version')::int as version
`;

const version = rows[0]?.version;
console.log(
  version === 1
    ? "Credencial creada (versión 1)."
    : `Contraseña rotada (versión ${version}). Todas las sesiones abiertas quedaron cerradas.`,
);
