import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Only lib/dal.ts may import this module (docs/09-RULES.md §2).
// HTTP driver: no interactive transactions; atomic writes are single statements (G-006).
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

export const db = drizzle({ client: neon(url), schema });
