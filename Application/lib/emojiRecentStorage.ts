export const EMOJI_RECENT_STORAGE_KEY = "opus-emoji-recent";
export const EMOJI_FREQUENT_STORAGE_KEY = "opus-emoji-frequency";
export const EMOJI_RECENT_MAX = 24;

type StoredFrequentEmoji = {
  count: number;
  emoji: string;
  lastUsed: number;
};

function isStoredFrequentEmoji(entry: unknown): entry is StoredFrequentEmoji {
  return (
    typeof entry === "object" &&
    entry !== null &&
    typeof (entry as StoredFrequentEmoji).emoji === "string" &&
    typeof (entry as StoredFrequentEmoji).count === "number" &&
    typeof (entry as StoredFrequentEmoji).lastUsed === "number"
  );
}

function sortFrequentEmojis(entries: StoredFrequentEmoji[]) {
  return entries
    .filter((entry) => entry.emoji.trim().length > 0 && entry.count > 0)
    .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
    .slice(0, EMOJI_RECENT_MAX);
}

function readLegacyRecentEmojis(): string[] {
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

function readFrequentEmojiEntries(): StoredFrequentEmoji[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(EMOJI_FREQUENT_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sortFrequentEmojis(parsed.filter(isStoredFrequentEmoji));
      }
    }

    const now = Date.now();
    const migrated = readLegacyRecentEmojis().map((emoji, index) => ({
      count: 1,
      emoji,
      lastUsed: now - index,
    }));

    if (migrated.length) {
      window.localStorage.setItem(EMOJI_FREQUENT_STORAGE_KEY, JSON.stringify(sortFrequentEmojis(migrated)));
    }

    return sortFrequentEmojis(migrated);
  } catch {
    return [];
  }
}

export function readRecentEmojis(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  return readFrequentEmojiEntries().map((entry) => entry.emoji);
}

export function addRecentEmoji(emoji: string): string[] {
  const trimmed = emoji.trim();
  if (!trimmed || typeof window === "undefined") {
    return readRecentEmojis();
  }

  const now = Date.now();
  const existing = readFrequentEmojiEntries();
  const current = existing.find((entry) => entry.emoji === trimmed);
  const next = sortFrequentEmojis([
    {
      count: (current?.count ?? 0) + 1,
      emoji: trimmed,
      lastUsed: now,
    },
    ...existing.filter((entry) => entry.emoji !== trimmed),
  ]);

  window.localStorage.setItem(EMOJI_FREQUENT_STORAGE_KEY, JSON.stringify(next));
  return next.map((entry) => entry.emoji);
}
