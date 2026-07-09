"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./ResizablePanel.module.css";

export type ResizablePanelProps = {
  children: ReactNode;
  className?: string;
  defaultHeight?: number;
  defaultWidth?: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  onResize?: (size: { height: number; width: number }) => void;
  style?: CSSProperties;
};

export function ResizablePanel({
  children,
  className,
  defaultHeight = 200,
  defaultWidth = 320,
  maxHeight = 480,
  maxWidth = 640,
  minHeight = 120,
  minWidth = 180,
  onResize,
  style,
}: ResizablePanelProps) {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const applySize = useCallback(
    (width: number, height: number) => {
      const next = {
        width: Math.min(Math.max(width, minWidth), maxWidth),
        height: Math.min(Math.max(height, minHeight), maxHeight),
      };
      setSize(next);
      onResize?.(next);
    },
    [maxHeight, maxWidth, minHeight, minWidth, onResize],
  );

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!dragging.current) return;
      applySize(
        origin.current.width + (event.clientX - origin.current.x),
        origin.current.height + (event.clientY - origin.current.y),
      );
    }

    function onUp() {
      dragging.current = false;
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [applySize]);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={{ ...style, width: size.width, height: size.height }}
    >
      <div className={styles.body}>{children}</div>
      <button
        aria-label="Resize panel"
        className={styles.handle}
        onPointerDown={(event) => {
          event.preventDefault();
          dragging.current = true;
          origin.current = {
            x: event.clientX,
            y: event.clientY,
            width: size.width,
            height: size.height,
          };
          document.body.style.cursor = "nwse-resize";
          document.body.style.userSelect = "none";
        }}
        type="button"
      />
    </div>
  );
}
