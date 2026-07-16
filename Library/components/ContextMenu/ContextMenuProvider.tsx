"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  DropdownMenuItem,
  type DropdownMenuItemData,
} from "@/components/DropdownMenu";
import type { Theme } from "@/components/fields/types";
import { useOpusTheme } from "@/components/OpusThemeProvider";
import { focusMenuItem, getMenuItems, handleMenuKeyDown } from "@/lib/a11y/menuKeyboardNavigation";
import styles from "./ContextMenu.module.css";

function itemShowsIconColumn(item: DropdownMenuItemData) {
  if (item.checked) {
    return true;
  }

  if (item.icon === undefined || item.icon === null || item.icon === false) {
    return false;
  }

  return true;
}

function clampPosition(x: number, y: number, width: number, height: number) {
  const pad = 8;
  const maxX = Math.max(pad, window.innerWidth - width - pad);
  const maxY = Math.max(pad, window.innerHeight - height - pad);

  return {
    x: Math.min(Math.max(pad, x), maxX),
    y: Math.min(Math.max(pad, y), maxY),
  };
}

function resolveThemeFromNode(node: HTMLElement | null, fallback: Theme) {
  let current = node;

  while (current) {
    const theme = current.getAttribute("data-theme");

    if (theme === "light" || theme === "dark") {
      return theme;
    }

    const shellTheme = current.getAttribute("data-shell-theme");

    if (shellTheme === "light" || shellTheme === "dark") {
      return shellTheme;
    }

    current = current.parentElement;
  }

  return fallback;
}

type ActiveContextMenu = {
  items: DropdownMenuItemData[];
  label: string;
  onSelect?: (item: DropdownMenuItemData) => void;
  position: { x: number; y: number };
  targetId: string;
  theme: Theme;
};

type ContextMenuTargetRegistration = {
  getElement: () => HTMLDivElement | null;
  items: DropdownMenuItemData[];
  label: string;
  onSelect?: (item: DropdownMenuItemData) => void;
};

type ContextMenuContextValue = {
  activeTargetId: string | null;
  close: () => void;
  isOpen: boolean;
  menuId: string;
  openFromTarget: (targetId: string, x: number, y: number) => void;
  registerTarget: (targetId: string, registration: ContextMenuTargetRegistration) => () => void;
};

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function useContextMenu() {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("useContextMenu must be used within ContextMenuProvider.");
  }

  return context;
}

type ContextMenuProviderProps = {
  children: ReactNode;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  closeOnSelect?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

export function ContextMenuProvider({
  children,
  closeOnEscape = true,
  closeOnOutside = true,
  closeOnSelect = true,
  onOpenChange,
  open,
}: ContextMenuProviderProps) {
  const theme = useOpusTheme();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const targetsRef = useRef<Map<string, ContextMenuTargetRegistration>>(new Map());
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveContextMenu | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const controlled = open !== undefined;
  const visible = controlled ? Boolean(open) : Boolean(activeMenu);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setActiveMenu(null);
    setAdjustedPosition(null);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const registerTarget = useCallback(
    (targetId: string, registration: ContextMenuTargetRegistration) => {
      targetsRef.current.set(targetId, registration);
      return () => {
        targetsRef.current.delete(targetId);
      };
    },
    [],
  );

  const openFromTarget = useCallback(
    (targetId: string, x: number, y: number) => {
      const registration = targetsRef.current.get(targetId);

      if (!registration) {
        return;
      }

      const origin = registration.getElement();
      const nextMenu: ActiveContextMenu = {
        items: registration.items,
        label: registration.label,
        onSelect: registration.onSelect,
        position: { x, y },
        targetId,
        theme: resolveThemeFromNode(origin, theme),
      };

      setActiveMenu(nextMenu);
      setAdjustedPosition({ x, y });
      onOpenChange?.(true);
    },
    [onOpenChange, theme],
  );

  useEffect(() => {
    if (!controlled || !open || activeMenu) {
      return;
    }

    const registration = targetsRef.current.values().next().value as
      | ContextMenuTargetRegistration
      | undefined;

    if (!registration) {
      return;
    }

    const rect = registration.getElement()?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    openFromTarget(
      Array.from(targetsRef.current.keys())[0] ?? "",
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
  }, [activeMenu, controlled, open, openFromTarget]);

  useEffect(() => {
    if (controlled && !open) {
      setActiveMenu(null);
      setAdjustedPosition(null);
    }
  }, [controlled, open]);

  useLayoutEffect(() => {
    if (!visible || !activeMenu || !menuRef.current) {
      return;
    }

    const menuRect = menuRef.current.getBoundingClientRect();
    setAdjustedPosition(
      clampPosition(
        activeMenu.position.x,
        activeMenu.position.y,
        menuRect.width,
        menuRect.height,
      ),
    );
  }, [activeMenu, visible]);

  useEffect(() => {
    if (!visible || !menuRef.current) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (!menu) {
        return;
      }

      const items = getMenuItems(menu);
      focusMenuItem(items, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [visible, activeMenu?.targetId]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const activeTarget = activeMenu
        ? targetsRef.current.get(activeMenu.targetId)?.getElement()
        : null;

      if (
        closeOnOutside &&
        !activeTarget?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        close();
        return;
      }

      if (menuRef.current) {
        handleMenuKeyDown(event, menuRef.current, close);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenu, close, closeOnEscape, closeOnOutside, visible]);

  const handleSelect = (item: DropdownMenuItemData) => {
    if (item.disabled) {
      return;
    }

    activeMenu?.onSelect?.(item);

    if (closeOnSelect) {
      close();
    }
  };

  const contextValue: ContextMenuContextValue = {
    activeTargetId: activeMenu?.targetId ?? null,
    close,
    isOpen: visible,
    menuId,
    openFromTarget,
    registerTarget,
  };

  const items = activeMenu?.items ?? [];
  const showIconColumn = items.some(itemShowsIconColumn);
  const menuPosition = adjustedPosition ?? activeMenu?.position ?? null;
  const portalTheme = activeMenu?.theme ?? theme;

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
      {mounted && visible && activeMenu && menuPosition
        ? createPortal(
            <div className={styles.layer} data-theme={portalTheme}>
              <button
                ref={backdropRef}
                aria-label="Dismiss context menu"
                className={styles.backdrop}
                type="button"
                onClick={() => {
                  if (closeOnOutside) {
                    close();
                  }
                }}
              />
              <div
                ref={menuRef}
                aria-label={activeMenu.label}
                className={styles.menu}
                data-has-icon-column={showIconColumn ? "true" : undefined}
                id={menuId}
                role="menu"
                style={{ left: menuPosition.x, top: menuPosition.y }}
              >
                {items.map((item) => (
                  <DropdownMenuItem
                    item={item}
                    key={item.id}
                    showIconColumn={showIconColumn}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </ContextMenuContext.Provider>
  );
}

type ContextMenuTargetProps = {
  children: ReactNode;
  className?: string;
  items: DropdownMenuItemData[];
  label?: string;
  onSelect?: (item: DropdownMenuItemData) => void;
};

export function ContextMenuTarget({
  children,
  className,
  items,
  label = "Context menu",
  onSelect,
}: ContextMenuTargetProps) {
  const targetId = useId();
  const targetRef = useRef<HTMLDivElement>(null);
  const { activeTargetId, isOpen, menuId, openFromTarget, registerTarget } = useContextMenu();

  useEffect(
    () =>
      registerTarget(targetId, {
        getElement: () => targetRef.current,
        items,
        label,
        onSelect,
      }),
    [items, label, onSelect, registerTarget, targetId],
  );

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    openFromTarget(targetId, event.clientX, event.clientY);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rect = targetRef.current?.getBoundingClientRect();

      if (rect) {
        openFromTarget(targetId, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }
  };

  const targetOpen = isOpen && activeTargetId === targetId;

  return (
    <div
      ref={targetRef}
      aria-label={label}
      className={className ? `${styles.target} ${className}` : styles.target}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      role="group"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

ContextMenuTarget.displayName = "ContextMenuTarget";
