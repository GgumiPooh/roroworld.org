import { type LocalizedTextEntry, type MetadataEntry } from "@/shared/lib";
import { date, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type ActivityType = "ALBUM_RELEASE" | "AWARD" | "PERFORMANCE";

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: jsonb("title").$type<LocalizedTextEntry[]>().notNull(),
  description: jsonb("description").$type<LocalizedTextEntry[]>(),
  type: text("type").$type<ActivityType>().notNull(),
  metadata: jsonb("meta_data").$type<MetadataEntry[]>(),
  activeFrom: date("active_from"),
  activeTo: date("active_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
