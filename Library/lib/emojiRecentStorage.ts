export const EMOJI_RECENT_STORAGE_KEY = "opus-emoji-recent-v2";
export const EMOJI_RECENT_LEGACY_KEYS = ["opus-emoji-recent", "opus-emoji-frequency"] as const;
export const EMOJI_RECENT_MAX = 24;

function normaliseRecentEmojis(emojis: readonly string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];

  for (const emoji of emojis) {
    const trimmed = emoji.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    next.push(trimmed);

    if (next.length >= EMOJI_RECENT_MAX) {
      break;
    }
  }

  return next;
}

function clearLegacyEmojiHistory() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of EMOJI_RECENT_LEGACY_KEYS) {
    window.localStorage.removeItem(key);
  }
}

function readStoredRecentEmojis(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  clearLegacyEmojiHistory();

  try {
    const raw = window.localStorage.getItem(EMOJI_RECENT_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(EMOJI_RECENT_STORAGE_KEY);
      return [];
    }

    return normaliseRecentEmojis(
      parsed.filter((entry): entry is string => typeof entry === "string" && entry.length > 0),
    );
  } catch {
    window.localStorage.removeItem(EMOJI_RECENT_STORAGE_KEY);
    return [];
  }
}

export function readRecentEmojis(): string[] {
  return readStoredRecentEmojis();
}

export function clearRecentEmojis(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  clearLegacyEmojiHistory();
  window.localStorage.removeItem(EMOJI_RECENT_STORAGE_KEY);
  return [];
}

export function addRecentEmoji(emoji: string): string[] {
  const trimmed = emoji.trim();
  if (!trimmed || typeof window === "undefined") {
    return readRecentEmojis();
  }

  const next = normaliseRecentEmojis([trimmed, ...readStoredRecentEmojis()]);
  window.localStorage.setItem(EMOJI_RECENT_STORAGE_KEY, JSON.stringify(next));
  clearLegacyEmojiHistory();
  return next;
}
