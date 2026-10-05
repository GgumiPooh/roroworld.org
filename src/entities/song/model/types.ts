import { type LocalizedTextEntry, type MetadataEntry } from "@/shared/lib";

export type LanguageData = LocalizedTextEntry;
export type MetaData = MetadataEntry;

export type Song = {
  albumId: number;
  createdAt?: string;
  description?: LanguageData[];
  lyrics?: LanguageData[];
  metadata?: MetaData[];
  title?: LanguageData[];
  trackNumber?: number;
  id: number;
};

export type SongDetail = Song;

export type SongDetailView = Omit<Song, "description" | "lyrics" | "title"> & {
  description: string;
  imgUrl: string;
  lyrics: string;
  title: string;
  videoUrl: string;
};
