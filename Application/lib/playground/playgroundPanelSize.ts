import type { SplitterOrientation } from "@/components/Splitter";

const PLAYGROUND_PANEL_SIZE_KEY = "opus-playground-panel-size";
const PLAYGROUND_CHAT_SPLIT_SIZE_KEY = "opus-playground-chat-split-size-v1";

type StoredPanelSizes = Partial<Record<SplitterOrientation, number>>;

function readStoredPanelSizes(): StoredPanelSizes {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(PLAYGROUND_PANEL_SIZE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as StoredPanelSizes;
  } catch {
    return {};
  }
}

export function readPlaygroundPanelSize(orientation: SplitterOrientation, fallback: number) {
  const stored = readStoredPanelSizes()[orientation];
  if (typeof stored !== "number" || Number.isNaN(stored)) {
    return fallback;
  }

  return stored;
}

export function storePlaygroundPanelSize(orientation: SplitterOrientation, size: number) {
  if (typeof window === "undefined") {
    return;
  }

  const sizes = readStoredPanelSizes();
  sizes[orientation] = size;
  localStorage.setItem(PLAYGROUND_PANEL_SIZE_KEY, JSON.stringify(sizes));
}

export function readPlaygroundChatSplitSize(fallback = 62) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(PLAYGROUND_CHAT_SPLIT_SIZE_KEY);
    const stored = raw == null ? Number.NaN : Number(raw);
    if (!Number.isFinite(stored)) {
      return fallback;
    }
    return Math.min(Math.max(stored, 20), 80);
  } catch {
    return fallback;
  }
}

export function storePlaygroundChatSplitSize(size: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      PLAYGROUND_CHAT_SPLIT_SIZE_KEY,
      String(Math.min(Math.max(size, 20), 80)),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}
