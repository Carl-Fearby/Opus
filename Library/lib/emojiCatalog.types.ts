export type EmojiCategoryId =
  | "activities"
  | "food"
  | "nature"
  | "objects"
  | "people"
  | "recent"
  | "smileys"
  | "symbols"
  | "travel";

export type EmojiEntry = {
  emoji: string;
  keywords: string[];
};

export type EmojiCategory = {
  emojis: EmojiEntry[];
  iconName: string;
  id: Exclude<EmojiCategoryId, "recent">;
  label: string;
};
