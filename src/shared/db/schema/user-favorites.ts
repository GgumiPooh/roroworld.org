import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { songs } from "./discography";
import { users } from "./users";

export const userFavoriteSongs = pgTable("user_favorite_song", {
  id: serial("id").primaryKey(),
  songId: integer("song_id")
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const userFavoriteSongsRelations = relations(userFavoriteSongs, ({ one }) => ({
  song: one(songs, {
    fields: [userFavoriteSongs.songId],
    references: [songs.id],
  }),
  user: one(users, {
    fields: [userFavoriteSongs.userId],
    references: [users.id],
  }),
}));
