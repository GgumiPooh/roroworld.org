import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { users } from "./users";

export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  galleryId: integer("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const galleryLikes = pgTable(
  "gallery_likes",
  {
    id: serial("id").primaryKey(),
    galleryId: integer("gallery_id")
      .notNull()
      .references(() => galleries.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("uk_gallery_likes_gallery_user").on(table.galleryId, table.userId)],
);

export const galleryComments = pgTable("gallery_comments", {
  id: serial("id").primaryKey(),
  galleryId: integer("gallery_id")
    .notNull()
    .references(() => galleries.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const galleriesRelations = relations(galleries, ({ many, one }) => ({
  user: one(users, {
    fields: [galleries.userId],
    references: [users.id],
  }),
  images: many(galleryImages),
  likes: many(galleryLikes),
  comments: many(galleryComments),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryImages.galleryId],
    references: [galleries.id],
  }),
}));

export const galleryLikesRelations = relations(galleryLikes, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryLikes.galleryId],
    references: [galleries.id],
  }),
  user: one(users, {
    fields: [galleryLikes.userId],
    references: [users.id],
  }),
}));

export const galleryCommentsRelations = relations(galleryComments, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryComments.galleryId],
    references: [galleries.id],
  }),
  user: one(users, {
    fields: [galleryComments.userId],
    references: [users.id],
  }),
}));
