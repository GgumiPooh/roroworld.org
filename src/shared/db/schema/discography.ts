import { type LocalizedTextEntry, type MetadataEntry } from "@/shared/lib";
import { relations } from "drizzle-orm";
import { date, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export type AlbumType = "DIGITAL_SINGLE" | "EP" | "REGULAR";

export const albums = pgTable("albums", {
  id: serial("id").primaryKey(),
  title: jsonb("title").$type<LocalizedTextEntry[]>().notNull(),
  description: jsonb("description").$type<LocalizedTextEntry[]>(),
  type: text("type").$type<AlbumType>().notNull(),
  publishedAt: date("published_at"),
  metadata: jsonb("metadata").$type<MetadataEntry[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  albumId: integer("album_id")
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  trackNumber: integer("track_number"),
  title: jsonb("title").$type<LocalizedTextEntry[]>().notNull(),
  description: jsonb("description").$type<LocalizedTextEntry[]>(),
  lyrics: jsonb("lyrics").$type<LocalizedTextEntry[]>(),
  metadata: jsonb("metadata").$type<MetadataEntry[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const commentSongs = pgTable("song_comments", {
  id: serial("id").primaryKey(),
  songId: integer("song_id")
    .notNull()
    .references(() => songs.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  commentedAt: timestamp("commented_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const albumsRelations = relations(albums, ({ many }) => ({
  songs: many(songs),
}));

export const songsRelations = relations(songs, ({ many, one }) => ({
  album: one(albums, {
    fields: [songs.albumId],
    references: [albums.id],
  }),
  comments: many(commentSongs),
}));

export const commentSongsRelations = relations(commentSongs, ({ one }) => ({
  song: one(songs, {
    fields: [commentSongs.songId],
    references: [songs.id],
  }),
  user: one(users, {
    fields: [commentSongs.userId],
    references: [users.id],
  }),
}));
