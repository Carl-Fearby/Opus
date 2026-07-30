"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { DesktopDock, type DesktopDockItem } from "@/components/DesktopDock";
import { DesktopIcon, type DesktopIconTone } from "@/components/DesktopIcon";
import { DesktopWindow, type DesktopWindowRect } from "@/components/DesktopWindow";
import styles from "./Desktop.module.css";

export type DesktopShortcut = {
  icon: string;
  id: string;
  label: string;
  tone?: DesktopIconTone;
  x?: number;
  y?: number;
};

export type DesktopWindowItem = {
  content: ReactNode;
  icon?: string;
  id: string;
  maximized?: boolean;
  minimized?: boolean;
  open?: boolean;
  rect: DesktopWindowRect;
  title: string;
  tone?: DesktopIconTone;
  zIndex?: number;
};

export type DesktopProps = {
  className?: string;
  dockItems?: DesktopDockItem[];
  dockAutoHide?: boolean;
  dockPosition?: "bottom" | "left" | "right";
  dockSize?: number;
  /** Removes the outer frame so the desktop fills its host surface edge-to-edge. */
  edgeToEdge?: boolean;
  onDockSizeChange?: (size: number) => void;
  onAction?: (action: string, id: string) => void;
  shortcuts?: DesktopShortcut[];
  wallpaper?: "aurora" | "gradient" | "plain";
  windows?: DesktopWindowItem[];
};

export function Desktop({
  className,
  dockItems = [],
  dockAutoHide = false,
  dockPosition = "bottom",
  dockSize,
  edgeToEdge = false,
  onDockSizeChange,
  onAction,
  shortcuts = [],
  wallpaper = "aurora",
  windows = [],
}: DesktopProps) {
  const [items, setItems] = useState(windows);
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  const [shortcutPositions, setShortcutPositions] = useState<Record<string, { x: number; y: number }>>(
    () =>
      Object.fromEntries(
        shortcuts.map((shortcut, index) => [
          shortcut.id,
          { x: shortcut.x ?? 14, y: shortcut.y ?? 18 + index * 92 },
        ]),
      ),
  );
  const rootRef = useRef<HTMLElement>(null);
  const shortcutDragRef = useRef<{
    id: string;
    moved: boolean;
    originX: number;
    originY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const suppressShortcutOpenRef = useRef<string | null>(null);
  const maxZ = Math.max(1, ...items.map((item) => item.zIndex ?? 1));
  const activeId = [...items]
    .filter((item) => item.open !== false && !item.minimized)
    .sort((a, b) => (b.zIndex ?? 1) - (a.zIndex ?? 1))[0]?.id;

  const update = (id: string, patch: Partial<DesktopWindowItem>) =>
    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) => item.id === id ? { ...item, ...patch } : item);
      }

      const definition = windows.find((item) => item.id === id);
      return definition ? [...current, { ...definition, ...patch }] : current;
    });
  const activate = (id: string) => update(id, { zIndex: maxZ + 1 });
  const open = (id: string, tone: DesktopIconTone = "purple") => {
    update(id, { minimized: false, open: true, tone, zIndex: maxZ + 1 });
    onAction?.("open", id);
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = shortcutDragRef.current;
      const root = rootRef.current;
      if (!drag || !root) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      const bounds = root.getBoundingClientRect();
      setShortcutPositions((current) => ({
        ...current,
        [drag.id]: {
          x: Math.max(4, Math.min(bounds.width - 92, drag.originX + dx)),
          y: Math.max(4, Math.min(bounds.height - 92, drag.originY + dy)),
        },
      }));
    };
    const end = () => {
      const drag = shortcutDragRef.current;
      if (drag?.moved) suppressShortcutOpenRef.current = drag.id;
      shortcutDragRef.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  useEffect(() => {
    setItems((current) => {
      const existingIds = new Set(current.map((item) => item.id));
      const additions = windows.filter((item) => !existingIds.has(item.id));
      return additions.length > 0 ? [...current, ...additions] : current;
    });

    setShortcutPositions((current) => {
      const additions = shortcuts.filter((shortcut) => current[shortcut.id] === undefined);
      if (additions.length === 0) return current;

      const next = { ...current };
      additions.forEach((shortcut) => {
        const index = shortcuts.findIndex((item) => item.id === shortcut.id);
        next[shortcut.id] = {
          x: shortcut.x ?? 14,
          y: shortcut.y ?? 18 + Math.max(0, index) * 92,
        };
      });
      return next;
    });
  }, [shortcuts, windows]);

  const startShortcutDrag = (shortcut: DesktopShortcut) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressShortcutOpenRef.current = null;
    const position = shortcutPositions[shortcut.id] ?? { x: 14, y: 18 };
    setSelectedShortcut(shortcut.id);
    shortcutDragRef.current = {
      id: shortcut.id,
      moved: false,
      originX: position.x,
      originY: position.y,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  return (
    <section
      aria-label="Desktop"
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-component="desktop"
      data-edge-to-edge={edgeToEdge ? "true" : "false"}
      data-wallpaper={wallpaper}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) setSelectedShortcut(null);
      }}
      ref={rootRef}
    >
      <div className={styles.shortcuts} aria-label="Desktop shortcuts">
        {shortcuts.map((shortcut) => {
          const position = shortcutPositions[shortcut.id] ?? { x: 14, y: 18 };
          return (
          <div
            className={styles.shortcut}
            key={shortcut.id}
            onDragStart={(event) => event.preventDefault()}
            onPointerDown={startShortcutDrag(shortcut)}
            style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
          >
          <DesktopIcon
            icon={shortcut.icon}
            label={shortcut.label}
            onOpen={() => {
              if (suppressShortcutOpenRef.current === shortcut.id) {
                suppressShortcutOpenRef.current = null;
                return;
              }
              open(shortcut.id, shortcut.tone ?? "purple");
            }}
            onSelect={() => setSelectedShortcut(shortcut.id)}
            selected={selectedShortcut === shortcut.id}
            tone={shortcut.tone}
          />
          </div>
        );
        })}
      </div>

      {items.map((item) => (
        <DesktopWindow
          active={item.id === activeId}
          icon={item.icon}
          key={item.id}
          maximized={item.maximized}
          minimizeTarget={dockPosition}
          minimized={item.minimized}
          open={item.open !== false}
          onActivate={() => activate(item.id)}
          onClose={() => {
            update(item.id, { open: false });
            onAction?.("close", item.id);
          }}
          onMaximize={(maximized) => {
            update(item.id, { maximized, minimized: false, zIndex: maxZ + 1 });
            onAction?.(maximized ? "maximize" : "restore", item.id);
          }}
          onMinimize={() => {
            update(item.id, { minimized: true });
            onAction?.("minimize", item.id);
          }}
          onRectChange={(rect) => update(item.id, { rect })}
          rect={item.rect}
          title={item.title}
          tone={item.tone ?? dockItems.find((dockItem) => dockItem.id === item.id)?.tone}
          zIndex={item.zIndex}
        >
          {item.content}
        </DesktopWindow>
      ))}

      <DesktopDock
        autoHide={dockAutoHide}
        items={dockItems.map((item) => ({
          ...item,
          active: items.some((window) => window.id === item.id && window.open !== false),
          minimized: items.find((window) => window.id === item.id)?.minimized,
        }))}
        onItemClick={(item) => open(item.id, item.tone ?? "purple")}
        onSizeChange={onDockSizeChange}
        position={dockPosition}
        size={dockSize}
      />
    </section>
  );
}
