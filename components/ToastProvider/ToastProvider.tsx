"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AlertStatus, Theme, ToastViewportPosition } from "@/components/fields/types";
import { useOpusTheme } from "@/components/OpusThemeProvider";
import { Toast } from "@/components/Toast";
import styles from "./ToastProvider.module.css";

export const DEFAULT_TOAST_DURATION_MS = 3000;

export type ShowToastOptions = {
  description?: string;
  dismissible?: boolean;
  duration?: number;
  status?: AlertStatus;
  title: string;
};

type ToastPhase = "entering" | "visible" | "exiting";

type ToastRecord = ShowToastOptions & {
  id: string;
  phase: ToastPhase;
};

type ToastContextValue = {
  dismiss: (id: string) => void;
  dismissAll: () => void;
  setViewport: (position: ToastViewportPosition) => void;
  show: (options: ShowToastOptions) => string;
  viewport: ToastViewportPosition;
};

const defaultViewport: ToastViewportPosition = {
  horizontal: "right",
  vertical: "top",
};

const stackGap = 10;
const enterDurationMs = 480;
const exitDurationMs = 220;
const enterEase = "cubic-bezier(0.16, 1, 0.3, 1)";
const surfaceEnterTransition = `transform ${enterDurationMs}ms ${enterEase}`;
const surfaceExitTransition = `transform ${exitDurationMs}ms cubic-bezier(0.4, 0, 1, 1)`;

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function getItemSurface(element: HTMLDivElement) {
  return element.querySelector<HTMLElement>("[data-toast-surface]");
}

function measureSurfaceHeight(element: HTMLDivElement) {
  const surface = getItemSurface(element);
  return surface?.offsetHeight ?? element.offsetHeight;
}

function hiddenSurfaceTransform(vertical: ToastViewportPosition["vertical"]) {
  return vertical === "top" ? "translate3d(0, -100%, 0)" : "translate3d(0, 100%, 0)";
}

function clearSurfaceMotionStyles(surface: HTMLElement) {
  surface.style.transform = "";
  surface.style.transition = "";
  delete surface.dataset.motionArmed;
}

function computeStackOffsets(
  toasts: ToastRecord[],
  heights: Map<string, number>,
  vertical: ToastViewportPosition["vertical"],
) {
  const offsets: Record<string, number> = {};

  if (vertical === "top") {
    let cumulative = 0;

    for (let index = 0; index < toasts.length; index += 1) {
      const toast = toasts[index];
      offsets[toast.id] = cumulative;
      cumulative += (heights.get(toast.id) ?? 0) + (index < toasts.length - 1 ? stackGap : 0);
    }

    return offsets;
  }

  let cumulative = 0;

  for (let index = toasts.length - 1; index >= 0; index -= 1) {
    const toast = toasts[index];
    offsets[toast.id] = cumulative;
    cumulative += (heights.get(toast.id) ?? 0) + (index > 0 ? stackGap : 0);
  }

  return offsets;
}

function useAutoDismiss({
  active,
  duration,
  onDismiss,
  paused,
}: {
  active: boolean;
  duration?: number;
  onDismiss: () => void;
  paused: boolean;
}) {
  const remainingRef = useRef(duration ?? 0);
  const timerRef = useRef<number | undefined>(undefined);
  const startedAtRef = useRef(0);

  useEffect(() => {
    remainingRef.current = duration ?? 0;
  }, [duration, active]);

  useEffect(() => {
    if (!active || !duration || duration <= 0) {
      return;
    }

    if (paused) {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (Date.now() - startedAtRef.current),
        );
        startedAtRef.current = 0;
      }

      return;
    }

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      onDismiss();
    }, remainingRef.current);

    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (Date.now() - startedAtRef.current),
        );
        startedAtRef.current = 0;
      }
    };
  }, [active, duration, onDismiss, paused]);
}

function ToastEntry({
  itemRef,
  onDismiss,
  stackAnimate,
  stackIndex,
  stackOffset,
  toast,
}: {
  itemRef: (node: HTMLDivElement | null) => void;
  onDismiss: (id: string) => void;
  stackAnimate: boolean;
  stackIndex: number;
  stackOffset: number;
  toast: ToastRecord;
}) {
  const [hovered, setHovered] = useState(false);

  useAutoDismiss({
    active: toast.phase !== "exiting",
    duration: toast.duration,
    onDismiss: () => onDismiss(toast.id),
    paused: hovered,
  });

  return (
    <div
      ref={itemRef}
      className={styles.item}
      data-phase={toast.phase}
      data-stack-animate={stackAnimate ? "true" : undefined}
      data-toast-id={toast.id}
      style={{
        zIndex: stackIndex,
        ["--stack-offset" as string]: `${stackOffset}px`,
      }}
    >
      <div className={styles.itemClip} data-toast-clip>
        <div className={styles.itemSurface} data-status={toast.status} data-toast-surface>
          <div aria-hidden="true" className={styles.itemBackdrop} />
          <Toast
            description={toast.description}
            dismissible={toast.dismissible ?? true}
            duration={toast.duration}
            paused={hovered}
            phase={toast.phase}
            status={toast.status}
            title={toast.title}
            onDismiss={() => onDismiss(toast.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
        </div>
      </div>
    </div>
  );
}

type ToastProviderProps = {
  children: ReactNode;
  horizontal?: ToastViewportPosition["horizontal"];
  theme?: Theme;
  vertical?: ToastViewportPosition["vertical"];
};

export function ToastProvider({
  children,
  horizontal = defaultViewport.horizontal,
  theme: themeProp,
  vertical = defaultViewport.vertical,
}: ToastProviderProps) {
  const resolvedTheme = useOpusTheme();
  const theme = themeProp ?? resolvedTheme;
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [viewport, setViewportState] = useState<ToastViewportPosition>({ horizontal, vertical });
  const [stackOffsets, setStackOffsets] = useState<Record<string, number>>({});
  const [stackAnimate, setStackAnimate] = useState(false);
  const nextId = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const collapsingRef = useRef(new Set<string>());
  const enteringRef = useRef(new Set<string>());
  const stackLayoutReadyRef = useRef(false);

  const setViewport = useCallback((position: ToastViewportPosition) => {
    setViewportState(position);
  }, []);

  const setItemRef = useCallback((id: string) => {
    return (node: HTMLDivElement | null) => {
      if (node) {
        itemRefs.current.set(id, node);
        return;
      }

      itemRefs.current.delete(id);
      enteringRef.current.delete(id);
      collapsingRef.current.delete(id);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    collapsingRef.current.delete(id);
    enteringRef.current.delete(id);
    itemRefs.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, phase: "exiting" } : toast)),
    );
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((current) => current.map((toast) => ({ ...toast, phase: "exiting" as const })));
  }, []);

  const markEntered = useCallback((id: string) => {
    enteringRef.current.delete(id);
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id && toast.phase === "entering" ? { ...toast, phase: "visible" } : toast,
      ),
    );
  }, []);

  const show = useCallback(
    (options: ShowToastOptions) => {
      const id = `toast-${nextId.current++}`;
      const entry: ToastRecord = { ...options, id, phase: "entering" };

      setToasts((current) =>
        viewport.vertical === "top" ? [entry, ...current] : [...current, entry],
      );

      return id;
    },
    [viewport.vertical],
  );

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offscreenTransform = hiddenSurfaceTransform(viewport.vertical);

    const exitingElements = toasts
      .filter((toast) => toast.phase === "exiting")
      .map((toast) => itemRefs.current.get(toast.id))
      .filter((element): element is HTMLDivElement => Boolean(element));

    if (exitingElements.length > 0) {
      if (reducedMotion) {
        for (const element of exitingElements) {
          const id = element.dataset.toastId;
          if (id) {
            removeToast(id);
          }
        }
      } else {
        for (const exitingElement of exitingElements) {
          const id = exitingElement.dataset.toastId;
          if (!id || collapsingRef.current.has(id)) {
            continue;
          }

          collapsingRef.current.add(id);

          const surface = getItemSurface(exitingElement);
          if (!surface) {
            removeToast(id);
            continue;
          }

          surface.style.transform = "translate3d(0, 0, 0)";
          surface.style.transition = surfaceExitTransition;

          let finished = false;
          let fallbackTimer = 0;

          const finishExit = () => {
            if (finished) {
              return;
            }

            finished = true;
            surface.removeEventListener("transitionend", handleTransitionEnd);
            window.clearTimeout(fallbackTimer);
            clearSurfaceMotionStyles(surface);
            removeToast(id);
          };

          const handleTransitionEnd = (event: TransitionEvent) => {
            if (event.target !== surface || event.propertyName !== "transform") {
              return;
            }

            finishExit();
          };

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              surface.style.transform = offscreenTransform;
            });
          });

          surface.addEventListener("transitionend", handleTransitionEnd);
          fallbackTimer = window.setTimeout(finishExit, exitDurationMs + 50);
        }
      }
    }

    const enteringElements = toasts
      .filter((toast) => toast.phase === "entering")
      .map((toast) => itemRefs.current.get(toast.id))
      .filter((element): element is HTMLDivElement => Boolean(element));

    if (enteringElements.length > 0) {
      if (reducedMotion) {
        for (const element of enteringElements) {
          const id = element.dataset.toastId;
          if (id) {
            markEntered(id);
          }
        }
      } else {
        for (const enteringElement of enteringElements) {
          const id = enteringElement.dataset.toastId;
          if (!id) {
            continue;
          }

          const surface = getItemSurface(enteringElement);
          if (!surface) {
            markEntered(id);
            continue;
          }

          if (surface.dataset.motionArmed === "true") {
            continue;
          }

          surface.dataset.motionArmed = "true";
          enteringRef.current.add(id);

          surface.style.transform = offscreenTransform;
          surface.style.transition = surfaceEnterTransition;

          let finished = false;
          let fallbackTimer = 0;

          const finishEnter = () => {
            if (finished) {
              return;
            }

            finished = true;
            window.clearTimeout(fallbackTimer);
            surface.removeEventListener("transitionend", handleTransitionEnd);
            enteringRef.current.delete(id);
            clearSurfaceMotionStyles(surface);
            markEntered(id);
          };

          const handleTransitionEnd = (event: TransitionEvent) => {
            if (event.target !== surface || event.propertyName !== "transform") {
              return;
            }

            finishEnter();
          };

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              surface.style.transform = "translate3d(0, 0, 0)";
            });
          });

          surface.addEventListener("transitionend", handleTransitionEnd);
          fallbackTimer = window.setTimeout(finishEnter, enterDurationMs + 50);
        }
      }
    }

    const heights = new Map<string, number>();

    for (const toast of toasts) {
      const element = itemRefs.current.get(toast.id);
      if (!element) {
        continue;
      }

      heights.set(toast.id, measureSurfaceHeight(element));
    }

    const offsets = computeStackOffsets(toasts, heights, viewport.vertical);
    setStackOffsets(offsets);
    setStackAnimate(stackLayoutReadyRef.current);
    stackLayoutReadyRef.current = true;
  }, [markEntered, removeToast, toasts, viewport.vertical]);

  const viewportClassName = [
    styles.viewport,
    viewport.vertical === "top" ? styles.viewportTop : styles.viewportBottom,
    viewport.horizontal === "left" ? styles.viewportLeft : styles.viewportRight,
  ].join(" ");

  return (
    <ToastContext.Provider value={{ dismiss, dismissAll, setViewport, show, viewport }}>
      {children}
      <div ref={viewportRef} className={viewportClassName} data-theme={theme}>
        {toasts.map((toast, index) => (
          <ToastEntry
            key={toast.id}
            itemRef={setItemRef(toast.id)}
            stackAnimate={stackAnimate}
            stackIndex={toasts.length - index}
            stackOffset={stackOffsets[toast.id] ?? 0}
            toast={toast}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
