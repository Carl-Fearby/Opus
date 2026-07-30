"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./DesktopWindow.module.css";

export type DesktopWindowRect = { height: number; width: number; x: number; y: number };
type ResizeEdge = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
type Session =
  | { boundsHeight: number; boundsWidth: number; kind: "move"; next: DesktopWindowRect; origin: DesktopWindowRect; startX: number; startY: number }
  | { boundsHeight: number; boundsWidth: number; edge: ResizeEdge; kind: "resize"; next: DesktopWindowRect; origin: DesktopWindowRect; startX: number; startY: number };

export type DesktopWindowProps = {
  active?: boolean;
  children?: ReactNode;
  className?: string;
  defaultRect?: DesktopWindowRect;
  icon?: string;
  maximized?: boolean;
  minHeight?: number;
  minWidth?: number;
  minimizeTarget?: "bottom" | "left" | "right";
  minimized?: boolean;
  open?: boolean;
  onActivate?: () => void;
  onClose?: () => void;
  onMaximize?: (maximized: boolean) => void;
  onMinimize?: () => void;
  onRectChange?: (rect: DesktopWindowRect) => void;
  rect?: DesktopWindowRect;
  title: string;
  tone?: "purple" | "blue";
  zIndex?: number;
};

const fallbackRect: DesktopWindowRect = { height: 330, width: 520, x: 130, y: 70 };

export function DesktopWindow({
  active,
  children,
  className,
  defaultRect = fallbackRect,
  maximized = false,
  minHeight = 190,
  minWidth = 280,
  minimizeTarget = "bottom",
  minimized,
  open = true,
  onActivate,
  onClose,
  onMaximize,
  onMinimize,
  onRectChange,
  rect: controlledRect,
  title,
  tone = "purple",
  zIndex = 1,
}: DesktopWindowProps) {
  const [closing, setClosing] = useState(false);
  const [entering, setEntering] = useState(open && !minimized);
  const [internalRect, setInternalRect] = useState(defaultRect);
  const [motion, setMotion] = useState<"idle" | "minimizing" | "restoring">("idle");
  const [present, setPresent] = useState(open && !minimized);
  const rect = controlledRect ?? internalRect;
  const rootRef = useRef<HTMLElement>(null);
  const sessionRef = useRef<Session | null>(null);
  const dragLockRef = useRef(false);
  const selectionStyleRef = useRef<{
    bodyUserSelect: string;
    bodyWebkitUserSelect: string;
    rootUserSelect: string;
    rootWebkitUserSelect: string;
  } | null>(null);

  const lockSelection = () => {
    dragLockRef.current = true;
    const root = document.documentElement;
    const body = document.body;
    selectionStyleRef.current = {
      bodyUserSelect: body.style.userSelect,
      bodyWebkitUserSelect: body.style.getPropertyValue("-webkit-user-select"),
      rootUserSelect: root.style.userSelect,
      rootWebkitUserSelect: root.style.getPropertyValue("-webkit-user-select"),
    };
    root.style.userSelect = "none";
    root.style.setProperty("-webkit-user-select", "none");
    body.style.userSelect = "none";
    body.style.setProperty("-webkit-user-select", "none");
    window.getSelection()?.removeAllRanges();
  };

  const unlockSelection = () => {
    if (!dragLockRef.current) return;
    dragLockRef.current = false;
    const previous = selectionStyleRef.current;
    const root = document.documentElement;
    const body = document.body;
    root.style.userSelect = previous?.rootUserSelect ?? "";
    root.style.setProperty("-webkit-user-select", previous?.rootWebkitUserSelect ?? "");
    body.style.userSelect = previous?.bodyUserSelect ?? "";
    body.style.setProperty("-webkit-user-select", previous?.bodyWebkitUserSelect ?? "");
    selectionStyleRef.current = null;
    window.getSelection()?.removeAllRanges();
  };

  const updateRect = (next: DesktopWindowRect) => {
    if (!controlledRect) setInternalRect(next);
    onRectChange?.(next);
  };

  const finishInteraction = () => {
    const session = sessionRef.current;
    const root = rootRef.current;
    if (session && root) {
      root.style.height = `${session.next.height}px`;
      root.style.left = `${session.next.x}px`;
      root.style.top = `${session.next.y}px`;
      root.style.width = `${session.next.width}px`;
      root.style.transform = "translate3d(0, 0, 0) scale(1)";
      updateRect(session.next);
      requestAnimationFrame(() => root.removeAttribute("data-interacting"));
    }
    sessionRef.current = null;
    unlockSelection();
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setClosing(false);
      setPresent(true);
      setEntering(true);
      timer = setTimeout(() => setEntering(false), 170);
    } else if (present) {
      setEntering(false);
      setClosing(true);
      timer = setTimeout(() => {
        setClosing(false);
        setPresent(false);
      }, 160);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!open) return;
    if (minimized) {
      setPresent(true);
      setMotion("minimizing");
      timer = setTimeout(() => setPresent(false), 170);
    } else if (!present) {
      setPresent(true);
      setMotion("restoring");
      timer = setTimeout(() => setMotion("idle"), 180);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [minimized, open]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session) return;
      const samples = event.getCoalescedEvents?.() ?? [];
      const sample = samples[samples.length - 1] ?? event;
      const dx = sample.clientX - session.startX;
      const dy = sample.clientY - session.startY;
      if (session.kind === "move") {
        const visibleEdge = 40;
        const next = {
          ...session.origin,
          x: Math.max(
            visibleEdge - session.origin.width,
            Math.min(session.boundsWidth - visibleEdge, session.origin.x + dx),
          ),
          y: Math.max(
            visibleEdge - session.origin.height,
            Math.min(session.boundsHeight - visibleEdge, session.origin.y + dy),
          ),
        };
        session.next = next;
        const root = rootRef.current;
        if (root) {
          root.style.transform = `translate3d(${next.x - session.origin.x}px, ${next.y - session.origin.y}px, 0) scale(1)`;
        }
        return;
      }
      let { x, y, width, height } = session.origin;
      if (session.edge.includes("e")) width = Math.max(minWidth, Math.min(session.boundsWidth - x, width + dx));
      if (session.edge.includes("s")) height = Math.max(minHeight, Math.min(session.boundsHeight - y, height + dy));
      if (session.edge.includes("w")) {
        const nextWidth = Math.max(minWidth, width - dx);
        x += width - nextWidth;
        width = nextWidth;
      }
      if (session.edge.includes("n")) {
        const nextHeight = Math.max(minHeight, height - dy);
        y += height - nextHeight;
        height = nextHeight;
      }
      const next = { height, width, x: Math.max(0, x), y: Math.max(0, y) };
      session.next = next;
      const root = rootRef.current;
      if (root) {
        root.style.height = `${next.height}px`;
        root.style.left = `${next.x}px`;
        root.style.top = `${next.y}px`;
        root.style.width = `${next.width}px`;
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finishInteraction);
    window.addEventListener("pointercancel", finishInteraction);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finishInteraction);
      window.removeEventListener("pointercancel", finishInteraction);
    };
  });

  useEffect(() => () => {
    unlockSelection();
  }, []);

  if (!present) return null;

  const startMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || maximized || (event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onActivate?.();
    lockSelection();
    event.currentTarget.closest<HTMLElement>('[data-component="desktop-window"]')?.setAttribute("data-interacting", "move");
    const bounds = (rootRef.current?.offsetParent as HTMLElement | null)?.getBoundingClientRect();
    sessionRef.current = {
      boundsHeight: bounds?.height ?? window.innerHeight,
      boundsWidth: bounds?.width ?? window.innerWidth,
      kind: "move",
      next: rect,
      origin: rect,
      startX: event.clientX,
      startY: event.clientY,
    };
  };
  const startResize = (edge: ResizeEdge) => (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || maximized) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onActivate?.();
    lockSelection();
    rootRef.current?.setAttribute("data-interacting", "resize");
    const bounds = (rootRef.current?.offsetParent as HTMLElement | null)?.getBoundingClientRect();
    sessionRef.current = {
      boundsHeight: bounds?.height ?? window.innerHeight,
      boundsWidth: bounds?.width ?? window.innerWidth,
      edge,
      kind: "resize",
      next: rect,
      origin: rect,
      startX: event.clientX,
      startY: event.clientY,
    };
  };
  const style: CSSProperties = maximized
    ? { height: "100%", left: 0, top: 0, width: "100%", zIndex }
    : { height: rect.height, left: rect.x, top: rect.y, width: rect.width, zIndex };

  return (
    <article
      aria-label={`${title} window`}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-active={active || undefined}
      data-maximized={maximized || undefined}
      data-component="desktop-window"
      data-closing={closing || undefined}
      data-entering={entering || undefined}
      data-minimize-target={minimizeTarget}
      data-motion={motion === "idle" ? undefined : motion}
      data-tone={tone}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={onActivate}
      ref={rootRef}
      style={style}
    >
      <header className={styles.titlebar} onDoubleClick={() => onMaximize?.(!maximized)} onPointerDown={startMove}>
        <div aria-label="Window controls" className={styles.controls}>
          <button aria-label={`Close ${title}`} className={styles.close} onClick={onClose} type="button">
            <CatalogIcon iconName="xmark" />
          </button>
          <button aria-label={`Minimize ${title}`} className={styles.minimize} onClick={onMinimize} type="button">
            <CatalogIcon iconName="minus" />
          </button>
          <button
            aria-label={`${maximized ? "Restore" : "Maximize"} ${title}`}
            className={styles.maximize}
            onClick={() => onMaximize?.(!maximized)}
            type="button"
          >
            <CatalogIcon iconName={maximized ? "down-left-and-up-right-to-center" : "expand"} />
          </button>
        </div>
        <div className={styles.title}>
          <span>{title}</span>
        </div>
      </header>
      <div className={styles.body}>{children}</div>
      {(["n", "ne", "e", "se", "s", "sw", "w", "nw"] as ResizeEdge[]).map((edge) => (
        <span
          aria-hidden="true"
          className={styles.resize}
          data-edge={edge}
          key={edge}
          onPointerDown={startResize(edge)}
        />
      ))}
    </article>
  );
}
