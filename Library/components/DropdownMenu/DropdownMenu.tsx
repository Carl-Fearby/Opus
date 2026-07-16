"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { DropdownMenuPlacement } from "@/components/fields/types";
import { useTopNavigation } from "@/components/TopNavigation";
import { useOpusTheme } from "@/components/OpusThemeProvider";
import { Button } from "@/components/fields/Button";
import { handleMenuKeyDown } from "@/lib/a11y/menuKeyboardNavigation";
import {
  resolveDropdownPortalStyle,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import styles from "./DropdownMenu.module.css";

const MENU_EXIT_MS = 280;

type MenuPhase = "closing" | "opening";

export type DropdownMenuItemData = {
  checked?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
  id: string;
  label: string;
  onSelect?: () => void;
  shortcut?: string;
};

type DropdownMenuProps = {
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  closeOnSelect?: boolean;
  defaultOpen?: boolean;
  elevated?: boolean;
  items: DropdownMenuItemData[];
  label?: string;
  navigationId?: string;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: DropdownMenuItemData) => void;
  open?: boolean;
  openOnHover?: boolean;
  placement?: DropdownMenuPlacement;
  trigger: ReactNode;
};

const HOVER_CLOSE_DELAY_MS = 120;

type TriggerProps = {
  "aria-controls": string;
  "aria-expanded": boolean;
  "aria-haspopup": "menu";
  onClick: () => void;
  onFocus?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
};

function mergeTrigger(trigger: ReactNode, triggerProps: TriggerProps, label: string) {
  if (isValidElement(trigger)) {
    const element = trigger as ReactElement<{
      onClick?: () => void;
      onFocus?: (event: React.FocusEvent) => void;
      onKeyDown?: (event: React.KeyboardEvent) => void;
    }>;
    return cloneElement(element, {
      ...triggerProps,
      onClick: () => {
        element.props.onClick?.();
        triggerProps.onClick();
      },
      onFocus: (event: React.FocusEvent) => {
        element.props.onFocus?.(event);
        triggerProps.onFocus?.();
      },
      onKeyDown: (event: React.KeyboardEvent) => {
        element.props.onKeyDown?.(event);
        triggerProps.onKeyDown?.(event);
      },
    });
  }

  return (
    <Button aria-label={label} {...triggerProps}>
      {trigger}
    </Button>
  );
}

export function DropdownMenuItem({
  item,
  onSelect,
  showIconColumn = false,
}: {
  item: DropdownMenuItemData;
  onSelect: (item: DropdownMenuItemData) => void;
  showIconColumn?: boolean;
}) {
  const accessibleLabel = item.shortcut ? `${item.label}, ${item.shortcut}` : item.label;

  return (
    <button
      aria-checked={item.checked ?? undefined}
      aria-label={accessibleLabel}
      className={styles.item}
      data-checked={item.checked || undefined}
      data-destructive={item.destructive || undefined}
      data-has-icon-column={showIconColumn ? "true" : undefined}
      disabled={item.disabled}
      onClick={() => onSelect(item)}
      role={item.checked === undefined ? "menuitem" : "menuitemcheckbox"}
      type="button"
    >
      {showIconColumn ? (
        <span aria-hidden="true" className={styles.icon}>
          {item.checked ? "✓" : item.icon}
        </span>
      ) : null}
      <span className={styles.label}>{item.label}</span>
      {item.shortcut ? <span className={styles.shortcut}>{item.shortcut}</span> : null}
    </button>
  );
}

function itemShowsIconColumn(item: DropdownMenuItemData) {
  if (item.checked) {
    return true;
  }

  if (item.icon === undefined || item.icon === null || item.icon === false) {
    return false;
  }

  return true;
}

export function DropdownMenu({
  closeOnEscape = true,
  closeOnOutside = true,
  closeOnSelect = true,
  defaultOpen = false,
  elevated = false,
  items,
  label = "Toggle menu",
  navigationId,
  onOpenChange,
  onSelect,
  open,
  openOnHover = false,
  placement = "bottom-start",
  trigger,
}: DropdownMenuProps) {
  const menuId = useId();
  const theme = useOpusTheme();
  const rootRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLSpanElement>(null);
  const hoverCloseTimeoutRef = useRef<number | null>(null);
  const topNavigation = useTopNavigation();
  const inTopNavigation = navigationId !== undefined && topNavigation !== null;
  const registerMenuPresent = topNavigation?.setMenuPresent;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [renderMenu, setRenderMenu] = useState(defaultOpen);
  const [phase, setPhase] = useState<MenuPhase>("opening");
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const navigationOpen =
    inTopNavigation && open === undefined ? topNavigation.activeMenu === navigationId : undefined;
  const resolvedOpen = open ?? navigationOpen;
  const controlled = resolvedOpen !== undefined;
  const visible = controlled ? resolvedOpen : internalOpen;
  const resolvedCloseOnEscape = inTopNavigation ? topNavigation.closeOnEscape : closeOnEscape;
  const resolvedCloseOnOutside = inTopNavigation ? topNavigation.closeOnOutside : closeOnOutside;
  const resolvedCloseOnSelect = inTopNavigation ? topNavigation.closeOnSelect : closeOnSelect;
  const resolvedElevated = elevated || inTopNavigation;
  const dismissOnOutside = openOnHover ? false : resolvedCloseOnOutside;
  const disableClickToggle = openOnHover;

  const setVisible = useCallback((nextOpen: boolean) => {
    if (!controlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen && inTopNavigation) {
      topNavigation.closeMenu();
    }
  }, [controlled, inTopNavigation, onOpenChange, topNavigation]);

  const clearHoverCloseTimeout = useCallback(() => {
    if (hoverCloseTimeoutRef.current) {
      window.clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
  }, []);

  const scheduleHoverClose = useCallback(() => {
    clearHoverCloseTimeout();
    hoverCloseTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearHoverCloseTimeout, setVisible]);

  const handleMouseEnter = () => {
    if (!openOnHover) {
      return;
    }

    clearHoverCloseTimeout();
    setVisible(true);
  };

  const handleMouseLeave = () => {
    if (!openOnHover) {
      return;
    }

    scheduleHoverClose();
  };

  useEffect(() => {
    return () => {
      clearHoverCloseTimeout();
    };
  }, [clearHoverCloseTimeout]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useLayoutEffect(() => {
    if (!renderMenu || !rootRef.current) {
      setPortalStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = rootRef.current;
      if (!anchor) {
        return;
      }

      setPortalStyle(
        resolveDropdownPortalStyle(
          anchor.getBoundingClientRect(),
          menuRef.current?.getBoundingClientRect() ?? null,
          placement,
          resolvedElevated,
        ),
      );
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [placement, renderMenu, resolvedElevated, phase]);

  useEffect(() => {
    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (visible) {
        setRenderMenu(true);
        setPhase("opening");
        return;
      }

      setPhase("closing");
      timeout = window.setTimeout(() => setRenderMenu(false), MENU_EXIT_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [visible]);

  useEffect(() => {
    if (!inTopNavigation || !navigationId || !registerMenuPresent) {
      return;
    }

    registerMenuPresent(navigationId, renderMenu);
    return () => registerMenuPresent(navigationId, false);
  }, [inTopNavigation, navigationId, registerMenuPresent, renderMenu]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
        ?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        dismissOnOutside
        && !rootRef.current?.contains(target)
        && !menuRef.current?.contains(target)
      ) {
        setVisible(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (resolvedCloseOnEscape && event.key === "Escape") {
        setVisible(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismissOnOutside, resolvedCloseOnEscape, setVisible, visible]);

  const handleSelect = (item: DropdownMenuItemData) => {
    if (item.disabled) {
      return;
    }

    item.onSelect?.();
    onSelect?.(item);

    if (inTopNavigation && navigationId) {
      topNavigation.onMenuSelect?.(navigationId, item);
    }

    if (resolvedCloseOnSelect) {
      setVisible(false);
    }
  };

  const showIconColumn = items.some(itemShowsIconColumn);

  const menuStyle: CSSProperties = {
    ...(portalStyle
      ? {
        left: portalStyle.left,
        top: portalStyle.top,
        ...(portalStyle.width ? { width: portalStyle.width } : {}),
      }
      : {}),
  };

  const menuNode = renderMenu ? (
    <span
      ref={menuRef}
      className={styles.menu}
      data-elevated={resolvedElevated ? "true" : undefined}
      data-phase={phase}
      data-open-on-hover={openOnHover || resolvedElevated ? "true" : undefined}
      data-has-icon-column={showIconColumn ? "true" : undefined}
      data-placement={placement}
      data-portaled="true"
      data-theme={theme}
      id={menuId}
      role="menu"
      style={menuStyle}
      onKeyDown={(event) => {
        handleMenuKeyDown(event.nativeEvent, event.currentTarget, () => setVisible(false));
      }}
    >
      {items.map((item) => (
        <DropdownMenuItem
          item={item}
          key={item.id}
          showIconColumn={showIconColumn}
          onSelect={handleSelect}
        />
      ))}
    </span>
  ) : null;

  return (
    <span
      ref={rootRef}
      className={styles.root}
      data-elevated={resolvedElevated ? "true" : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {mergeTrigger(
        trigger,
        {
          "aria-controls": menuId,
          "aria-expanded": visible,
          "aria-haspopup": "menu",
          onClick: () => {
            if (!disableClickToggle) {
              setVisible(!visible);
              return;
            }

            if (inTopNavigation) {
              setVisible(true);
            }
          },
          onFocus: () => {
            if (inTopNavigation) {
              setVisible(true);
            }
          },
          onKeyDown: (event) => {
            if (
              inTopNavigation
              && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")
            ) {
              event.preventDefault();
              setVisible(true);
            }
          },
        },
        label,
      )}
      {portalReady && menuNode ? createPortal(menuNode, document.body) : null}
    </span>
  );
}
