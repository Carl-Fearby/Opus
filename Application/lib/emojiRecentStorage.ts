export const EMOJI_RECENT_STORAGE_KEY = "opus-emoji-recent";
export const EMOJI_RECENT_MAX = 24;

export function readRecentEmojis(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(EMOJI_RECENT_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
  } catch {
    return [];
  }
}

export function addRecentEmoji(emoji: string): string[] {
  const trimmed = emoji.trim();
  if (!trimmed || typeof window === "undefined") {
    return readRecentEmojis();
  }

  const next = [trimmed, ...readRecentEmojis().filter((entry) => entry !== trimmed)].slice(
    0,
    EMOJI_RECENT_MAX,
  );

  window.localStorage.setItem(EMOJI_RECENT_STORAGE_KEY, JSON.stringify(next));
  return next;
}
