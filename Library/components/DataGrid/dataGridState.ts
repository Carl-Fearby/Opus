/**
 * Saved column widths for a single data grid.
 *
 * Widths are treated as the user's intent. They are written only when the user
 * commits a resize; the responsive fit below derives what is rendered so a
 * narrow window can never overwrite the widths the user chose.
 */
export type DataGridColumnWidths = Record<string, number>;

export type DataGridSavedState = {
  updatedAt: number;
  version: number;
  widths: DataGridColumnWidths;
};

export type DataGridSaveStateOptions = {
  /** Stable identity for this grid. Each grid keeps its own widths. */
  key: string;
  /** Storage area used for the saved widths. Defaults to "local". */
  storage?: "local" | "session";
};

/**
 * `true` derives a key from the grid's shape, a string is used as the key, and
 * an options object sets the key and storage area explicitly.
 */
export type DataGridSaveState = boolean | string | DataGridSaveStateOptions;

export const DATA_GRID_STATE_VERSION = 1;
export const DATA_GRID_STATE_PREFIX = "opus-datagrid";
export const DATA_GRID_DEFAULT_COLUMN_WIDTH = 130;
export const DATA_GRID_TEAM_COLUMN_WIDTH = 180;

/** Defensive floor when a column has no measured minimum. */
const FALLBACK_MIN_COLUMN_WIDTH = 48;

function hashKey(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

export function resolveDataGridStorage(saveState: DataGridSaveState | undefined): Storage | null {
  if (!saveState || typeof window === "undefined") {
    return null;
  }

  const area = typeof saveState === "object" ? saveState.storage ?? "local" : "local";

  try {
    return area === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    // Private browsing and disabled storage both throw on access.
    return null;
  }
}

export function resolveDataGridStateKey(
  saveState: DataGridSaveState | undefined,
  fallbackShape: string,
): string | null {
  if (!saveState) {
    return null;
  }

  if (typeof saveState === "string") {
    const key = saveState.trim();
    return key ? `${DATA_GRID_STATE_PREFIX}:${key}` : null;
  }

  if (typeof saveState === "object") {
    const key = saveState.key?.trim();
    return key ? `${DATA_GRID_STATE_PREFIX}:${key}` : null;
  }

  return `${DATA_GRID_STATE_PREFIX}:${hashKey(fallbackShape)}`;
}

export function readDataGridState(
  storage: Storage | null,
  key: string | null,
): DataGridSavedState | null {
  if (!storage || !key) {
    return null;
  }

  try {
    const raw = storage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<DataGridSavedState> | null;

    if (
      !parsed
      || parsed.version !== DATA_GRID_STATE_VERSION
      || typeof parsed.widths !== "object"
      || parsed.widths === null
    ) {
      return null;
    }

    const widths: DataGridColumnWidths = {};

    for (const [columnKey, width] of Object.entries(parsed.widths)) {
      if (typeof width === "number" && Number.isFinite(width) && width > 0) {
        widths[columnKey] = Math.round(width);
      }
    }

    return {
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
      version: DATA_GRID_STATE_VERSION,
      widths,
    };
  } catch {
    return null;
  }
}

export function writeDataGridState(
  storage: Storage | null,
  key: string | null,
  widths: DataGridColumnWidths,
) {
  if (!storage || !key) {
    return;
  }

  try {
    const state: DataGridSavedState = {
      updatedAt: Date.now(),
      version: DATA_GRID_STATE_VERSION,
      widths,
    };

    storage.setItem(key, JSON.stringify(state));
  } catch {
    // Quota errors should never break a resize.
  }
}

export type FitDataGridColumnWidthsOptions = {
  /** Measured width of the grid's scroll container, in pixels. 0 means unknown. */
  available: number;
  /** Visible column keys, in render order. */
  columns: string[];
  defaultWidths: DataGridColumnWidths;
  minWidths: DataGridColumnWidths;
  /** Saved widths; may be sparse or empty. */
  widths: DataGridColumnWidths;
};

/**
 * Returns the widths to render for the current container width.
 *
 * An empty object means "render the saved intent as-is" — nothing has been
 * resized, everything already fits, or the container is too narrow to honour
 * even the column minimums, in which case the grid scrolls instead. A
 * populated object is a temporary, scaled rendering that is never written back
 * to storage.
 */
export function fitDataGridColumnWidths({
  available,
  columns,
  defaultWidths,
  minWidths,
  widths,
}: FitDataGridColumnWidthsOptions): DataGridColumnWidths {
  if (!columns.length || !Number.isFinite(available) || available <= 0) {
    return {};
  }

  const hasIntent = columns.some((key) => typeof widths[key] === "number");

  if (!hasIntent) {
    return {};
  }

  const intended = columns.map((key) => ({
    key,
    min: minWidths[key] ?? FALLBACK_MIN_COLUMN_WIDTH,
    width: widths[key] ?? defaultWidths[key] ?? DATA_GRID_DEFAULT_COLUMN_WIDTH,
  }));

  const total = intended.reduce((sum, column) => sum + column.width, 0);

  if (total <= available) {
    return {};
  }

  const minimum = intended.reduce((sum, column) => sum + column.min, 0);

  if (minimum >= available) {
    // Not even the minimums fit. Scrolling the user's widths is better than
    // crushing every column to its floor, which would lose the layout entirely.
    return {};
  }

  const scale = available / total;
  const fitted: DataGridColumnWidths = {};

  for (const column of intended) {
    // Columns stop at their minimum; if the minimums alone overflow, the
    // wrapper scrolls horizontally rather than crushing the columns.
    fitted[column.key] = Math.max(column.min, Math.floor(column.width * scale));
  }

  return fitted;
}
