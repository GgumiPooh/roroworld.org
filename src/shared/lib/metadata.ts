import { type Maybe } from "./nullish";

export type MetadataEntry = {
  type: string;
  url: string;
};

export function findMetadataUrl(metadata: Maybe<MetadataEntry[]>, targetType: string): string {
  if (!metadata || metadata.length === 0) {
    return "";
  }
  const matched = metadata.find((item) => item.type === targetType);
  return matched?.url ?? metadata[0]?.url ?? "";
}

export function findCoverUrl(metadata: Maybe<MetadataEntry[]>): string {
  if (!metadata || metadata.length === 0) {
    return "";
  }
  const normalizedMetadata = metadata.map((item) => ({
    type: (item.type || "").toLowerCase(),
    url: item.url,
  }));

  return (
    normalizedMetadata.find((item) => item.type.includes("cover"))?.url ||
    normalizedMetadata.find((item) => item.type.includes("image"))?.url ||
    normalizedMetadata[0]?.url ||
    ""
  );
}
