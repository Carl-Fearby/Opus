import { generatedEmojiCategories } from "./emojiCatalog.generated";
import type { EmojiCategory, EmojiCategoryId, EmojiEntry } from "./emojiCatalog.types";

export type { EmojiCategory, EmojiCategoryId, EmojiEntry } from "./emojiCatalog.types";
export { generatedEmojiCount } from "./emojiCatalog.generated";

export const emojiCategories: EmojiCategory[] = [...generatedEmojiCategories];

export const RECENT_EMOJI_CATEGORY = {
  iconName: "clock-rotate-left",
  id: "recent",
  label: "Frequently used",
} as const;

export function getRecentEmojiEntries(recentEmojis: readonly string[]): EmojiEntry[] {
  return recentEmojis.map((emoji) => ({
    emoji,
    keywords: ["frequent", "frequently used", "recent", "recently used"],
  }));
}

export function filterEmojiCatalog(
  query: string,
  categoryId: EmojiCategoryId,
  recentEmojis: readonly string[] = [],
) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    if (categoryId === "recent") {
      return getRecentEmojiEntries(recentEmojis);
    }

    const category = emojiCategories.find((entry) => entry.id === categoryId);
    return category?.emojis ?? [];
  }

  const seen = new Set<string>();

  return emojiCategories.flatMap((category) =>
    category.emojis.filter((entry) => {
      if (seen.has(entry.emoji)) {
        return false;
      }

      const matches =
        entry.emoji.includes(normalized) ||
        entry.keywords.some((keyword) => keyword.toLowerCase().includes(normalized));

      if (matches) {
        seen.add(entry.emoji);
      }

      return matches;
    }),
  );
}
