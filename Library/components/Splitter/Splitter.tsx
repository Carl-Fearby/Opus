"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ResizeHandle } from "../ResizeHandle";
import styles from "./Splitter.module.css";

export type SplitterOrientation = "horizontal" | "vertical";

export type SplitterProps = {
  children: [ReactNode, ReactNode];
  className?: string;
  defaultSize?: number;
  flush?: boolean;
  minSize?: number;
  onSizeChange?: (size: number) => void;
  orientation?: SplitterOrientation;
  size?: number;
  style?: CSSProperties;
};

export function Splitter({
  children,
  className,
  defaultSize = 40,
  flush = false,
  minSize = 15,
  onSizeChange,
  orientation = "horizontal",
  size: controlledSize,
  style,
}: SplitterProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultSize);
  const size = controlledSize ?? uncontrolled;
  const rootRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const labelId = useId();

  const setSize = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, minSize), 100 - minSize);
      if (controlledSize == null) setUncontrolled(clamped);
      onSizeChange?.(clamped);
    },
    [controlledSize, minSize, onSizeChange],
  );

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!dragging.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const next =
        orientation === "horizontal"
          ? ((event.clientX - rect.left) / rect.width) * 100
          : ((event.clientY - rect.top) / rect.height) * 100;
      setSize(next);
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
  }, [orientation, setSize]);

  const firstStyle =
    orientation === "horizontal"
      ? { width: `calc(${size}% - 4px)` }
      : { height: `calc(${size}% - 4px)` };
  const secondStyle =
    orientation === "horizontal"
      ? { width: `calc(${100 - size}% - 4px)` }
      : { height: `calc(${100 - size}% - 4px)` };
  const handleOrientation = orientation === "horizontal" ? "vertical" : "horizontal";

  return (
    <div
      aria-labelledby={labelId}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-flush={flush ? "" : undefined}
      data-orientation={orientation}
      ref={rootRef}
      style={style}
    >
      <span className={styles.srOnly} id={labelId}>
        Splitter
      </span>
      <div className={styles.pane} style={firstStyle}>
        {children[0]}
      </div>
      <ResizeHandle
        aria-label="Resize panes"
        aria-valuemax={100 - minSize}
        aria-valuemin={minSize}
        aria-valuenow={Math.round(size)}
        orientation={handleOrientation}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 2;
          if (orientation === "horizontal") {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              setSize(size - step);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              setSize(size + step);
            }
          } else {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setSize(size - step);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setSize(size + step);
            }
          }
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          dragging.current = true;
          document.body.style.cursor = orientation === "horizontal" ? "col-resize" : "row-resize";
          document.body.style.userSelect = "none";
        }}
      />
      <div className={styles.pane} style={secondStyle}>
        {children[1]}
      </div>
    </div>
  );
}
