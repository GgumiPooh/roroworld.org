import "server-only";

import { ensureEnv } from "@/shared/config";
import { type Optional } from "@/shared/lib";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

declare global {
  var __dbInstance: Optional<Database>;
  var __dbClient: Optional<postgres.Sql>;
}

export function getDb(): Database {
  if (globalThis.__dbInstance) {
    return globalThis.__dbInstance;
  }

  // INFO: Lazy evaluate DATABASE_URL so Next.js build succeeds without env vars present.
  const connectionString = ensureEnv("DATABASE_URL");
  const isProduction = process.env.NODE_ENV === "production";

  // INFO: prepare: false is required for Supabase transaction pooler (port 6543) compatibility.
  const client =
    globalThis.__dbClient ??
    postgres(connectionString, {
      connect_timeout: 10,
      idle_timeout: 20,
      max: isProduction ? 1 : 10,
      prepare: false,
    });

  const db = drizzle(client, { schema });

  globalThis.__dbClient = client;
  globalThis.__dbInstance = db;

  return db;
}
