import { type MetadataEntry } from "@/shared/lib";
import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const goods = pgTable("goods", {
  id: serial("id").primaryKey(),
  name: text("name"),
  metadata: jsonb("metadata").$type<MetadataEntry[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
