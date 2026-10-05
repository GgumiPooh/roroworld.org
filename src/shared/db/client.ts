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
  const client = globalThis.__dbClient ?? postgres(connectionString);

  if (process.env.NODE_ENV !== "production") {
    globalThis.__dbClient = client;
  }

  const db = drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__dbInstance = db;
  }

  return db;
}
