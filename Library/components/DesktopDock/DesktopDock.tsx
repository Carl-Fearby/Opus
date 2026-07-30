"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { DesktopIcon, type DesktopIconTone } from "@/components/DesktopIcon";
import styles from "./DesktopDock.module.css";

export type DesktopDockItem = {
  active?: boolean;
  icon: string;
  id: string;
  label: string;
  minimized?: boolean;
  tone?: DesktopIconTone;
};

export type DesktopDockProps = {
  autoHide?: boolean;
  className?: string;
  items: DesktopDockItem[];
  maxSize?: number;
  minSize?: number;
  onItemClick?: (item: DesktopDockItem) => void;
  onSizeChange?: (size: number) => void;
  position?: "bottom" | "left" | "right";
  resizable?: boolean;
  size?: number;
};

export function DesktopDock({
  autoHide = false,
  className,
  items,
  maxSize = 76,
  minSize = 24,
  onItemClick,
  onSizeChange,
  position = "bottom",
  resizable = true,
  size: controlledSize,
}: DesktopDockProps) {
  const [internalSize, setInternalSize] = useState(40);
  const size = controlledSize ?? internalSize;
  const dragRef = useRef<{ origin: number; startX: number; startY: number } | null>(null);
  const setSize = (next: number) => {
    const bounded = Math.max(minSize, Math.min(maxSize, Math.round(next)));
    if (controlledSize === undefined) setInternalSize(bounded);
    onSizeChange?.(bounded);
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta =
        position === "bottom"
          ? drag.startY - event.clientY
          : position === "left"
            ? event.clientX - drag.startX
            : drag.startX - event.clientX;
      setSize(drag.origin + delta);
    };
    const end = () => { dragRef.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  });

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { origin: size, startX: event.clientX, startY: event.clientY };
  };

  return (
    <nav
      aria-label="Desktop dock"
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-auto-hide={autoHide || undefined}
      data-position={position}
      style={{ "--desktop-dock-size": `${size}px` } as CSSProperties}
    >
      {resizable ? (
        <div
          aria-label="Resize desktop dock"
          aria-orientation={position === "bottom" ? "horizontal" : "vertical"}
          aria-valuemax={maxSize}
          aria-valuemin={minSize}
          aria-valuenow={size}
          className={styles.resizeHandle}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowRight") setSize(size + 2);
            if (event.key === "ArrowDown" || event.key === "ArrowLeft") setSize(size - 2);
          }}
          onPointerDown={startResize}
          role="separator"
          tabIndex={0}
        />
      ) : null}
      {items.map((item) => (
        <span
          className={styles.item}
          data-active={item.active || undefined}
          key={item.id}
          onClick={() => onItemClick?.(item)}
        >
          <DesktopIcon
            active={item.active}
            icon={item.icon}
            label={item.label}
            onOpen={() => onItemClick?.(item)}
            tone={item.tone}
          />
          {item.active ? (
            <span
              aria-hidden="true"
              className={styles.indicator}
              data-minimized={item.minimized || undefined}
            />
          ) : null}
        </span>
      ))}
    </nav>
  );
}
