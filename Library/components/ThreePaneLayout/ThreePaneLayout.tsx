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
  type ReactNode,
} from "react";
import { ResizeHandle, type ResizeHandleBackground, type ResizeHandleHeight } from "../ResizeHandle";
import { CustomScrollbar } from "../CustomScrollbar";
import styles from "./ThreePaneLayout.module.css";

export type ThreePaneLayoutSize = {
  leftWidth: number;
  rightWidth: number;
};

type ThreePaneLayoutPersistedState = Partial<ThreePaneLayoutSize> & {
  leftCollapsed?: boolean;
  rightCollapsed?: boolean;
};

export type ThreePaneLayoutHandleBackground = ResizeHandleBackground;
export type ThreePaneLayoutHandleHeight = ResizeHandleHeight;

export type ThreePaneLayoutProps = {
  children: ReactNode;
  className?: string;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
  handleBackground?: ThreePaneLayoutHandleBackground;
  handleBorderRadius?: number | string;
  handleHeight?: ThreePaneLayoutHandleHeight;
  handleMarginBlock?: number | string;
  left?: ReactNode;
  leftCollapsed?: boolean;
  leftCollapsedWidth?: number;
  leftLabel?: string;
  maxLeftWidth?: number;
  maxRightWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  onLeftCollapsedChange?: (collapsed: boolean) => void;
  onRightCollapsedChange?: (collapsed: boolean) => void;
  onSizeChange?: (size: ThreePaneLayoutSize) => void;
  persist?: boolean;
  right?: ReactNode;
  rightCollapsed?: boolean;
  rightCollapsedWidth?: number;
  rightLabel?: string;
  storageKey?: string;
  style?: CSSProperties;
  transitionsEnabled?: boolean;
};

type ResizeSide = "left" | "right";

const DEFAULT_LEFT_WIDTH = 260;
const DEFAULT_RIGHT_WIDTH = 320;
const DEFAULT_MIN_LEFT_WIDTH = 160;
const DEFAULT_MAX_LEFT_WIDTH = 520;
const DEFAULT_MIN_RIGHT_WIDTH = 180;
const DEFAULT_MAX_RIGHT_WIDTH = 560;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readPersistedState(storageKey: string | undefined) {
  if (!storageKey || typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as ThreePaneLayoutPersistedState;
    if (
      typeof parsed.leftWidth !== "number"
      && typeof parsed.rightWidth !== "number"
      && typeof parsed.leftCollapsed !== "boolean"
      && typeof parsed.rightCollapsed !== "boolean"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writePersistedState(storageKey: string | undefined, state: ThreePaneLayoutPersistedState) {
  if (!storageKey || typeof window === "undefined") {
    return;
  }

  const current = readPersistedState(storageKey) ?? {};
  window.localStorage.setItem(storageKey, JSON.stringify({ ...current, ...state }));
}

export function ThreePaneLayout({
  children,
  className,
  defaultLeftWidth = DEFAULT_LEFT_WIDTH,
  defaultRightWidth = DEFAULT_RIGHT_WIDTH,
  handleBackground = "subtle",
  handleBorderRadius = 0,
  handleHeight = "medium",
  handleMarginBlock = 0,
  left,
  leftCollapsed = false,
  leftCollapsedWidth = 88,
  leftLabel = "Left sidebar",
  maxLeftWidth = DEFAULT_MAX_LEFT_WIDTH,
  maxRightWidth = DEFAULT_MAX_RIGHT_WIDTH,
  minLeftWidth = DEFAULT_MIN_LEFT_WIDTH,
  minRightWidth = DEFAULT_MIN_RIGHT_WIDTH,
  onLeftCollapsedChange,
  onRightCollapsedChange,
  onSizeChange,
  persist = true,
  right,
  rightCollapsed = false,
  rightCollapsedWidth = 88,
  rightLabel = "Right sidebar",
  storageKey,
  style,
  transitionsEnabled = true,
}: ThreePaneLayoutProps) {
  const leftId = useId();
  const rightId = useId();
  const resolvedStorageKey = persist ? storageKey : undefined;
  const initialLeft = clamp(defaultLeftWidth, minLeftWidth, maxLeftWidth);
  const initialRight = clamp(defaultRightWidth, minRightWidth, maxRightWidth);
  const [size, setSizeState] = useState<ThreePaneLayoutSize>({
    leftWidth: initialLeft,
    rightWidth: initialRight,
  });
  const [resizing, setResizing] = useState(false);
  const [persistenceReady, setPersistenceReady] = useState(!resolvedStorageKey);
  const [motionReady, setMotionReady] = useState(!resolvedStorageKey);
  const latestSizeRef = useRef<ThreePaneLayoutSize>({
    leftWidth: size.leftWidth,
    rightWidth: size.rightWidth,
  });
  const resizeFrameRef = useRef<number | null>(null);
  const dragState = useRef<{
    collapsedForDrag: boolean;
    initialLeftWidth: number;
    initialRightWidth: number;
    startX: number;
    startedCollapsed: boolean;
    side: ResizeSide;
  } | null>(null);

  useEffect(() => {
    let motionFrame: number | null = null;
    let motionEnableFrame: number | null = null;
    let motionSettleTimeout: number | null = null;
    const enableMotionAfterPaint = () => {
      motionFrame = window.requestAnimationFrame(() => {
        motionEnableFrame = window.requestAnimationFrame(() => {
          motionSettleTimeout = window.setTimeout(() => setMotionReady(true), 100);
        });
      });
    };
    const timeout = window.setTimeout(() => {
      const persistedState = readPersistedState(resolvedStorageKey);
      if (!persistedState) {
        const nextSize = {
          leftWidth: initialLeft,
          rightWidth: initialRight,
        };
        latestSizeRef.current = nextSize;
        setSizeState(nextSize);
        setPersistenceReady(true);
        enableMotionAfterPaint();
        return;
      }

      const nextSize = {
        leftWidth: clamp(persistedState.leftWidth ?? initialLeft, minLeftWidth, maxLeftWidth),
        rightWidth: clamp(persistedState.rightWidth ?? initialRight, minRightWidth, maxRightWidth),
      };
      latestSizeRef.current = nextSize;
      setSizeState(nextSize);
      if (typeof persistedState.leftCollapsed === "boolean") {
        onLeftCollapsedChange?.(persistedState.leftCollapsed);
      }
      if (typeof persistedState.rightCollapsed === "boolean") {
        onRightCollapsedChange?.(persistedState.rightCollapsed);
      }
      setPersistenceReady(true);
      enableMotionAfterPaint();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      if (motionFrame !== null) {
        window.cancelAnimationFrame(motionFrame);
      }
      if (motionEnableFrame !== null) {
        window.cancelAnimationFrame(motionEnableFrame);
      }
      if (motionSettleTimeout !== null) {
        window.clearTimeout(motionSettleTimeout);
      }
    };
  }, [
    initialLeft,
    initialRight,
    maxLeftWidth,
    maxRightWidth,
    minLeftWidth,
    minRightWidth,
    onLeftCollapsedChange,
    onRightCollapsedChange,
    resolvedStorageKey,
  ]);

  useEffect(() => {
    if (!persistenceReady || !resolvedStorageKey) {
      return;
    }

    writePersistedState(resolvedStorageKey, { leftCollapsed, rightCollapsed });
  }, [leftCollapsed, persistenceReady, resolvedStorageKey, rightCollapsed]);

  const setSize = useCallback(
    (next: ThreePaneLayoutSize) => {
      const clampedSize = {
        leftWidth: clamp(next.leftWidth, minLeftWidth, maxLeftWidth),
        rightWidth: clamp(next.rightWidth, minRightWidth, maxRightWidth),
      };

      latestSizeRef.current = clampedSize;
      setSizeState(clampedSize);
      writePersistedState(resolvedStorageKey, clampedSize);
      onSizeChange?.(clampedSize);
    },
    [maxLeftWidth, maxRightWidth, minLeftWidth, minRightWidth, onSizeChange, resolvedStorageKey],
  );

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragState.current) {
        return;
      }

      const delta = event.clientX - dragState.current.startX;
      const rawLeftWidth = dragState.current.initialLeftWidth + delta;
      const rawRightWidth = dragState.current.initialRightWidth - delta;
      if (dragState.current.side === "left") {
        const collapseThreshold = dragState.current.startedCollapsed ? leftCollapsedWidth : minLeftWidth;
        const expandThreshold = collapseThreshold + 8;

        if (!dragState.current.collapsedForDrag && rawLeftWidth < collapseThreshold) {
          dragState.current.collapsedForDrag = true;
          onLeftCollapsedChange?.(true);
        } else if (dragState.current.collapsedForDrag && rawLeftWidth >= expandThreshold) {
          dragState.current.collapsedForDrag = false;
          onLeftCollapsedChange?.(false);
        }
      } else {
        const collapseThreshold = dragState.current.startedCollapsed ? rightCollapsedWidth : minRightWidth;
        const expandThreshold = collapseThreshold + 8;

        if (!dragState.current.collapsedForDrag && rawRightWidth < collapseThreshold) {
          dragState.current.collapsedForDrag = true;
          onRightCollapsedChange?.(true);
        } else if (dragState.current.collapsedForDrag && rawRightWidth >= expandThreshold) {
          dragState.current.collapsedForDrag = false;
          onRightCollapsedChange?.(false);
        }
      }

      const nextSize = dragState.current.side === "left"
        ? {
            leftWidth: rawLeftWidth,
            rightWidth: dragState.current.initialRightWidth,
          }
        : {
          leftWidth: dragState.current.initialLeftWidth,
          rightWidth: rawRightWidth,
        };
      latestSizeRef.current = {
        leftWidth: clamp(nextSize.leftWidth, minLeftWidth, maxLeftWidth),
        rightWidth: clamp(nextSize.rightWidth, minRightWidth, maxRightWidth),
      };

      if (resizeFrameRef.current === null) {
        resizeFrameRef.current = window.requestAnimationFrame(() => {
          resizeFrameRef.current = null;
          setSizeState(latestSizeRef.current);
        });
      }
    }

    function finishResize() {
      if (!dragState.current) {
        return;
      }

      dragState.current = null;
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      setSizeState(latestSizeRef.current);
      writePersistedState(resolvedStorageKey, latestSizeRef.current);
      onSizeChange?.(latestSizeRef.current);
      setResizing(false);
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishResize);
    window.addEventListener("pointercancel", finishResize);
    window.addEventListener("blur", finishResize);

    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishResize);
      window.removeEventListener("pointercancel", finishResize);
      window.removeEventListener("blur", finishResize);
    };
  }, [leftCollapsed, leftCollapsedWidth, maxLeftWidth, maxRightWidth, minLeftWidth, minRightWidth, onLeftCollapsedChange, onRightCollapsedChange, onSizeChange, resolvedStorageKey, rightCollapsedWidth]);

  const cssVars = useMemo(
    () =>
      ({
        "--three-pane-left-width": left ? `${leftCollapsed ? leftCollapsedWidth : size.leftWidth}px` : "0px",
        "--three-pane-right-width": right ? `${rightCollapsed ? rightCollapsedWidth : size.rightWidth}px` : "0px",
        "--three-pane-handle-margin-block": typeof handleMarginBlock === "number" ? `${handleMarginBlock}px` : handleMarginBlock,
        "--three-pane-handle-radius": typeof handleBorderRadius === "number" ? `${handleBorderRadius}px` : handleBorderRadius,
        ...style,
      }) as CSSProperties,
    [handleBorderRadius, handleMarginBlock, left, leftCollapsed, leftCollapsedWidth, right, rightCollapsed, rightCollapsedWidth, size.leftWidth, size.rightWidth, style],
  );

  const startResize = useCallback(
    (side: ResizeSide, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragState.current = {
        collapsedForDrag: side === "left" ? leftCollapsed : rightCollapsed,
        initialLeftWidth: leftCollapsed ? leftCollapsedWidth : size.leftWidth,
        initialRightWidth: rightCollapsed ? rightCollapsedWidth : size.rightWidth,
        side,
        startX: event.clientX,
        startedCollapsed: side === "left" ? leftCollapsed : rightCollapsed,
      };
      setResizing(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [leftCollapsed, leftCollapsedWidth, rightCollapsed, rightCollapsedWidth, size.leftWidth, size.rightWidth],
  );

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-has-left={left ? "true" : "false"}
      data-has-right={right ? "true" : "false"}
      data-left-collapsed={leftCollapsed ? "true" : "false"}
      data-motion-ready={motionReady ? "true" : "false"}
      data-persistence-ready={persistenceReady ? "true" : "false"}
      data-right-collapsed={rightCollapsed ? "true" : "false"}
      data-resizing={resizing ? "true" : "false"}
      data-transitions={transitionsEnabled && motionReady ? "true" : "false"}
      style={cssVars}
    >
      {left ? (
        <>
          <aside aria-label={leftLabel} className={styles.sidebar} data-side="left" id={leftId}>
            <CustomScrollbar label={leftLabel} orientation="vertical">{left}</CustomScrollbar>
          </aside>
          <ResizeHandle
            aria-controls={leftId}
            aria-label="Resize left sidebar"
            aria-valuemax={maxLeftWidth}
            aria-valuemin={minLeftWidth}
            aria-valuenow={Math.round(leftCollapsed ? leftCollapsedWidth : size.leftWidth)}
            background={handleBackground}
            className={styles.handle}
            data-side="left"
            height={handleHeight}
            orientation="vertical"
            onKeyDown={(event) => {
              const step = event.shiftKey ? 24 : 8;
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                setSize({ ...size, leftWidth: size.leftWidth - step });
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                setSize({ ...size, leftWidth: size.leftWidth + step });
              }
            }}
            onPointerDown={(event) => startResize("left", event)}
          />
        </>
      ) : null}
      <main className={styles.content}>
        <CustomScrollbar label="Main content" orientation="both">{children}</CustomScrollbar>
      </main>
      {right ? (
        <>
          <ResizeHandle
            aria-controls={rightId}
            aria-label="Resize right sidebar"
            aria-valuemax={maxRightWidth}
            aria-valuemin={minRightWidth}
            aria-valuenow={Math.round(rightCollapsed ? rightCollapsedWidth : size.rightWidth)}
            background={handleBackground}
            className={styles.handle}
            data-side="right"
            height={handleHeight}
            orientation="vertical"
            onKeyDown={(event) => {
              const step = event.shiftKey ? 24 : 8;
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                setSize({ ...size, rightWidth: size.rightWidth + step });
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                setSize({ ...size, rightWidth: size.rightWidth - step });
              }
            }}
            onPointerDown={(event) => startResize("right", event)}
          />
          <aside aria-label={rightLabel} className={styles.sidebar} data-side="right" id={rightId}>
            <CustomScrollbar label={rightLabel} orientation="vertical">{right}</CustomScrollbar>
          </aside>
        </>
      ) : null}
    </div>
  );
}
