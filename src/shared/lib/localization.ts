import { type Maybe } from "./nullish";

export type LocalizedTextEntry = {
  content: string;
  language: string;
};

export function resolveLocalizedText(
  items: Maybe<LocalizedTextEntry[] | string>,
  preferredLanguages: string[] = ["ko", "en"],
): string {
  if (!items) {
    return "";
  }
  if (typeof items === "string") {
    return items;
  }
  if (items.length === 0) {
    return "";
  }

  const matchedContent = preferredLanguages
    .map((language) => items.find((item) => item.language?.toLowerCase() === language))
    .find((matched) => Boolean(matched?.content))?.content;

  return matchedContent ?? items[0]?.content ?? "";
}

export const selectLocalizedText = resolveLocalizedText;
