import { type LocalizedTextEntry, type MetadataEntry } from "@/shared/lib";

export type LanguageData = LocalizedTextEntry;
export type MetaData = MetadataEntry;

export type Activity = {
  activeFrom: string;
  activeTo: string;
  activityType?: string;
  description?: string;
  metaData: MetaData[];
  metadata?: MetaData[];
  title: LanguageData[];
  id: number;
};

export type Sort = "latest" | "oldest";

export const EARLIEST_ACTIVITY_YEAR = 2022;

export const ActivityType = {
  PERFORMANCE: "PERFORMANCE",
} as const;
