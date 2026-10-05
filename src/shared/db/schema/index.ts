export * from "./activities";
export * from "./discography";
export * from "./galleries";
export * from "./goods";
export * from "./messages";
export * from "./user-favorites";
export * from "./users";

import { type activities } from "./activities";
import { type albums, type commentSongs, type songs } from "./discography";
import {
  type galleries,
  type galleryComments,
  type galleryImages,
  type galleryLikes,
} from "./galleries";
import { type goods } from "./goods";
import { type messagesToArtist } from "./messages";
import { type userFavoriteSongs } from "./user-favorites";
import { type refreshTokens, type users } from "./users";

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;

export type CommentSong = typeof commentSongs.$inferSelect;
export type NewCommentSong = typeof commentSongs.$inferInsert;

export type Gallery = typeof galleries.$inferSelect;
export type NewGallery = typeof galleries.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;

export type GalleryLike = typeof galleryLikes.$inferSelect;
export type NewGalleryLike = typeof galleryLikes.$inferInsert;

export type GalleryComment = typeof galleryComments.$inferSelect;
export type NewGalleryComment = typeof galleryComments.$inferInsert;

export type MessageToArtist = typeof messagesToArtist.$inferSelect;
export type NewMessageToArtist = typeof messagesToArtist.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type Goods = typeof goods.$inferSelect;
export type NewGoods = typeof goods.$inferInsert;

export type UserFavoriteSong = typeof userFavoriteSongs.$inferSelect;
export type NewUserFavoriteSong = typeof userFavoriteSongs.$inferInsert;
