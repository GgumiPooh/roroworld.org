import { type LocalizedTextEntry, type Maybe, type MetadataEntry } from "@/shared/lib";

export type LanguageData = LocalizedTextEntry;
export type MetaData = MetadataEntry;

export type AlbumSong = {
  trackNumber?: number;
  id: number;
};

export type Album = {
  albumType?: Maybe<string>;
  description?: Maybe<LanguageData[]>;
  metadata?: Maybe<MetaData[]>;
  publishedAt?: Maybe<string>;
  songs?: Maybe<AlbumSong[]>;
  title: LanguageData[];
  id: number;
};

export type AlbumDetail = {
  createdAt?: string;
  description?: LanguageData[];
  metadata?: MetaData[];
  publishedAt?: string;
  title: LanguageData[];
  id: number;
};

export type AlbumView = Album & {
  coverUrl: string;
  descriptionText: string;
  titleText: string;
};
