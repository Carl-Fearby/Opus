import type { SplitterOrientation } from "@/components/Splitter";

const PLAYGROUND_PANEL_SIZE_KEY = "opus-playground-panel-size";

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
