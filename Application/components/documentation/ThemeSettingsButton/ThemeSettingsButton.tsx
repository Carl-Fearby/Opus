"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AccentColorPicker,
  DEFAULT_TILE_ACCENT,
  DEFAULT_TILE_ACCENT_SECONDARY,
} from "@/components/AccentColorPicker";
import { ColourClouds, type ColourCloudsDesignation } from "opus-react";
import { Button } from "opus-react";
import type { Theme } from "opus-react";
import type { GoogleFontFamily } from "opus-react";
import styles from "./ThemeSettingsButton.module.css";

export type OpusThemeExport = {
  version: 1;
  theme: Theme;
  fontFamily?: string;
  accent: string;
  accentSecondary: string;
  tileAccent: string;
  tileAccentSecondary: string;
};

type ThemeSettingsButtonProps = {
  accent: string;
  accentSecondary: string;
  compact?: boolean;
  fontFamily?: GoogleFontFamily;
  idPrefix: string;
  onAccentChange: (value: string) => void;
  onAccentSecondaryChange: (value: string) => void;
  onFontFamilyChange?: (value: string) => void;
  onResetAccent: () => void;
  onResetTileAccent: () => void;
  onThemeChange?: (theme: Theme) => void;
  onTileAccentChange: (value: string) => void;
  onTileAccentSecondaryChange: (value: string) => void;
  theme?: Theme;
  /** @deprecated Kept for callers; colours panel does not show a theme toggle. */
  themeLabel?: string;
  tileAccent: string;
  tileAccentSecondary: string;
};

type WindowRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type DragSession = {
  kind: "move";
  originX: number;
  originY: number;
  startX: number;
  startY: number;
};

type ResizeSession = {
  kind: "resize";
  edge: "e" | "s" | "se";
  originHeight: number;
  originWidth: number;
  startX: number;
  startY: number;
};

const WINDOW_STORAGE_KEY = "opus-theme-settings-window";
const MIN_WIDTH = 280;
const MIN_HEIGHT = 320;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function defaultRect(): WindowRect {
  if (typeof window === "undefined") {
    return { x: 24, y: 80, width: 420, height: 560 };
  }

  const width = clamp(Math.round(window.innerWidth * 0.3), MIN_WIDTH, window.innerWidth - 48);
  const height = clamp(Math.round(window.innerHeight * 0.72), MIN_HEIGHT, window.innerHeight - 48);

  return {
    x: 24,
    y: 80,
    width,
    height,
  };
}

function constrainRect(rect: WindowRect): WindowRect {
  if (typeof window === "undefined") {
    return rect;
  }

  const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - 16);
  const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - 16);
  const width = clamp(Number(rect.width) || MIN_WIDTH, MIN_WIDTH, maxWidth);
  const height = clamp(Number(rect.height) || MIN_HEIGHT, MIN_HEIGHT, maxHeight);
  const x = clamp(Number(rect.x) || 0, 8, Math.max(8, window.innerWidth - width - 8));
  const y = clamp(Number(rect.y) || 0, 8, Math.max(8, window.innerHeight - height - 8));

  return { x, y, width, height };
}

function readStoredRect(): WindowRect {
  if (typeof window === "undefined") {
    return defaultRect();
  }

  try {
    const raw = window.localStorage.getItem(WINDOW_STORAGE_KEY);
    if (!raw) {
      return defaultRect();
    }

    const parsed = JSON.parse(raw) as Partial<WindowRect>;
    return constrainRect({
      x: typeof parsed.x === "number" ? parsed.x : 24,
      y: typeof parsed.y === "number" ? parsed.y : 80,
      width: typeof parsed.width === "number" ? parsed.width : Math.round(window.innerWidth * 0.3),
      height: typeof parsed.height === "number" ? parsed.height : Math.round(window.innerHeight * 0.72),
    });
  } catch {
    return defaultRect();
  }
}

function persistRect(rect: WindowRect) {
  try {
    window.localStorage.setItem(WINDOW_STORAGE_KEY, JSON.stringify(rect));
  } catch {
    // ignore
  }
}

function buildThemeExport({
  accent,
  accentSecondary,
  fontFamily,
  theme,
  tileAccent,
  tileAccentSecondary,
}: Pick<
  ThemeSettingsButtonProps,
  | "accent"
  | "accentSecondary"
  | "fontFamily"
  | "theme"
  | "tileAccent"
  | "tileAccentSecondary"
>): OpusThemeExport {
  return {
    version: 1,
    theme: theme ?? "dark",
    ...(fontFamily ? { fontFamily } : {}),
    accent,
    accentSecondary,
    tileAccent,
    tileAccentSecondary,
  };
}

export function ThemeSettingsButton({
  accent,
  accentSecondary,
  compact = false,
  fontFamily,
  idPrefix,
  onAccentChange,
  onAccentSecondaryChange,
  onResetAccent,
  onResetTileAccent,
  onTileAccentChange,
  onTileAccentSecondaryChange,
  theme,
  tileAccent,
  tileAccentSecondary,
}: ThemeSettingsButtonProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [jsonPreview, setJsonPreview] = useState<string | null>(null);
  const [rect, setRect] = useState<WindowRect>(() => defaultRect());
  const [interaction, setInteraction] = useState<"idle" | "move" | "resize">("idle");
  const sessionRef = useRef<DragSession | ResizeSession | null>(null);

  const themeJson = useMemo(
    () =>
      JSON.stringify(
        buildThemeExport({
          accent,
          accentSecondary,
          fontFamily,
          theme,
          tileAccent,
          tileAccentSecondary,
        }),
        null,
        2,
      ),
    [accent, accentSecondary, fontFamily, theme, tileAccent, tileAccentSecondary],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setRect(readStoredRect());
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSaveNotice(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onResize = () => {
      setRect((current) => {
        const next = constrainRect(current);
        persistRect(next);
        return next;
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const session = sessionRef.current;
    if (!session) {
      return;
    }

    setRect((current) => {
      let next = current;

      if (session.kind === "move") {
        next = {
          ...current,
          x: session.originX + (clientX - session.startX),
          y: session.originY + (clientY - session.startY),
        };
      } else if (session.edge === "e") {
        next = {
          ...current,
          width: session.originWidth + (clientX - session.startX),
        };
      } else if (session.edge === "s") {
        next = {
          ...current,
          height: session.originHeight + (clientY - session.startY),
        };
      } else {
        next = {
          ...current,
          width: session.originWidth + (clientX - session.startX),
          height: session.originHeight + (clientY - session.startY),
        };
      }

      return constrainRect(next);
    });
  }, []);

  const endSession = useCallback(() => {
    if (!sessionRef.current) {
      return;
    }

    sessionRef.current = null;
    setInteraction("idle");
    setRect((current) => {
      const next = constrainRect(current);
      persistRect(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (interaction === "idle") {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      updateFromPointer(event.clientX, event.clientY);
    };

    const onPointerUp = () => {
      endSession();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [endSession, interaction, updateFromPointer]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSaveNotice(null);
  }, []);

  const handleResetColours = useCallback(() => {
    onResetAccent();
    onResetTileAccent();
    setSaveNotice(null);
    setJsonPreview(null);
  }, [onResetAccent, onResetTileAccent]);

  const colourClouds = useMemo<ColourCloudsDesignation>(
    () => ({
      clouds: [
        {
          id: "ui",
          label: "Base UI",
          color: accent,
          secondary: accentSecondary,
        },
        {
          id: "tiles",
          label: "Tiles",
          color: tileAccent,
          secondary: tileAccentSecondary,
        },
      ],
    }),
    [accent, accentSecondary, tileAccent, tileAccentSecondary],
  );

  const handleSaveTheme = useCallback(async () => {
    setJsonPreview(themeJson);

    try {
      await navigator.clipboard.writeText(themeJson);
      setSaveNotice("Theme JSON copied to clipboard.");
    } catch {
      setSaveNotice("Theme JSON ready below — copy it manually.");
    }

    const blob = new Blob([themeJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "opus-theme.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [themeJson]);

  const startMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    sessionRef.current = {
      kind: "move",
      originX: rect.x,
      originY: rect.y,
      startX: event.clientX,
      startY: event.clientY,
    };
    setInteraction("move");
  };

  const startResize = (edge: ResizeSession["edge"]) => (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    sessionRef.current = {
      kind: "resize",
      edge,
      originHeight: rect.height,
      originWidth: rect.width,
      startX: event.clientX,
      startY: event.clientY,
    };
    setInteraction("resize");
  };

  const floatingWindow =
    mounted && open
      ? createPortal(
          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="false"
            className={styles.themeWindow}
            data-interaction={interaction}
            role="dialog"
            style={
              {
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
              } as CSSProperties
            }
          >
            <header className={styles.windowHeader} onPointerDown={startMove}>
              <div className={styles.windowHeading}>
                <h2 className={styles.windowTitle} id={titleId}>
                  Colour settings
                </h2>
                <p className={styles.windowDescription} id={descriptionId}>
                  Drag to move · resize from edges · Save Theme exports JSON
                </p>
              </div>
              <button
                aria-label="Close colour settings"
                className={styles.windowClose}
                type="button"
                onClick={handleClose}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <svg aria-hidden="true" className={styles.windowCloseIcon} viewBox="0 0 16 16">
                  <path
                    d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.75"
                  />
                </svg>
              </button>
            </header>

            <div className={styles.windowBody}>
              <div className={styles.panel}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Base UI</h3>
                  <p className={styles.sectionHint}>
                    App chrome, focus rings, buttons, and atmospheric washes — not tiles.
                  </p>
                  <AccentColorPicker
                    id={`${idPrefix}-accent-picker`}
                    label="Base UI"
                    primarySectionLabel="UI accent"
                    secondarySectionLabel="UI second accent"
                    secondaryValue={accentSecondary}
                    value={accent}
                    variant="panel"
                    onChange={onAccentChange}
                    onReset={onResetAccent}
                    onSecondaryChange={onAccentSecondaryChange}
                  />
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Tiles</h3>
                  <p className={styles.sectionHint}>Purple and blue tile tones / icon gradients.</p>
                  <AccentColorPicker
                    defaultSecondaryValue={DEFAULT_TILE_ACCENT_SECONDARY}
                    defaultValue={DEFAULT_TILE_ACCENT}
                    id={`${idPrefix}-tile-accent-picker`}
                    label="Tiles"
                    primarySectionLabel="Tiles accent"
                    secondarySectionLabel="Tiles second accent"
                    secondaryValue={tileAccentSecondary}
                    value={tileAccent}
                    variant="panel"
                    onChange={onTileAccentChange}
                    onReset={onResetTileAccent}
                    onSecondaryChange={onTileAccentSecondaryChange}
                  />
                </section>

                {saveNotice || jsonPreview ? (
                  <section className={styles.export}>
                    {saveNotice ? <p className={styles.exportNotice}>{saveNotice}</p> : null}
                    {jsonPreview ? (
                      <pre className={styles.json} tabIndex={0}>
                        {jsonPreview}
                      </pre>
                    ) : null}
                  </section>
                ) : null}
              </div>
            </div>

            <footer className={styles.windowFooter}>
              <Button variant="secondary" onClick={handleResetColours}>
                Reset
              </Button>
              <span className={styles.footerSpacer} />
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleSaveTheme}>
                Save Theme
              </Button>
            </footer>

            <div aria-hidden="true" className={styles.resizeE} onPointerDown={startResize("e")} />
            <div aria-hidden="true" className={styles.resizeS} onPointerDown={startResize("s")} />
            <div aria-hidden="true" className={styles.resizeSe} onPointerDown={startResize("se")} />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <ColourClouds
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Colours"
        compact={compact}
        label="Colours"
        title="Colours"
        value={colourClouds}
        onClick={() => setOpen(true)}
      />
      {floatingWindow}
    </>
  );
}
