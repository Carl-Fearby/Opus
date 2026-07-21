"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isHexColor } from "@/lib/theme/accentThemeStorage";
import {
  resolveEmojiPickerPortalStyle,
  type EmojiPickerPlacement,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import styles from "./ColourClouds.module.css";

/** Maximum coloured orbs this control can show. */
export const COLOUR_CLOUDS_MAX = 5;

/** One colourable orb. Optional `secondary` makes a split dual-tone cloud. */
export type ColourCloud = {
  id?: string;
  label?: string;
  color: string;
  secondary?: string;
};

/** JSON designation for the ColourClouds control. */
export type ColourCloudsDesignation = {
  clouds: ColourCloud[];
};

export type ColourCloudsValue = ColourCloud[] | ColourCloudsDesignation | string;

export type ColourCloudsProps = {
  /** Accessible name for the main control. */
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: ButtonHTMLAttributes<HTMLButtonElement>["aria-haspopup"];
  /** Dropdown panel body. When set, the pill opens a portaled menu. */
  children?: ReactNode;
  className?: string;
  compact?: boolean;
  /**
   * Up to five colourable elements.
   * Prefer this over `value` when passing a typed array.
   */
  items?: ColourCloud[];
  /** Visible text label after the colour orbs. */
  label?: string;
  /** Menu heading when `children` is provided. */
  menuTitle?: string;
  /** Controlled open state for the dropdown menu. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: EmojiPickerPlacement;
  /** Disable the optional reset control. */
  resetDisabled?: boolean;
  /** Show a colours-only reset icon beside the clouds. */
  showReset?: boolean;
  /**
   * Opens / activates the control when no `children` menu is provided
   * (e.g. open an external colour settings window).
   */
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  /** Colours-only reset. Never touches fonts or other theme chrome. */
  onReset?: () => void;
  title?: string;
  /**
   * Colour designation: array, `{ clouds: [...] }`, or a JSON string of either.
   * At most five clouds are rendered. Ignored when `items` is provided.
   */
  value?: ColourCloudsValue;
};

function normalizeCloud(raw: unknown, index: number): ColourCloud | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const entry = raw as Record<string, unknown>;
  const color =
    (typeof entry.color === "string" && entry.color) ||
    (typeof entry.primary === "string" && entry.primary) ||
    (typeof entry.value === "string" && entry.value) ||
    null;
  const secondary =
    (typeof entry.secondary === "string" && entry.secondary) ||
    (typeof entry.colorSecondary === "string" && entry.colorSecondary) ||
    undefined;

  if (!isHexColor(color)) {
    return null;
  }

  return {
    id: typeof entry.id === "string" ? entry.id : `cloud-${index}`,
    label: typeof entry.label === "string" ? entry.label : undefined,
    color,
    secondary: isHexColor(secondary) ? secondary : undefined,
  };
}

/** Parse a JSON designation (string or object) into up to five colour clouds. */
export function parseColourClouds(value: ColourCloudsValue | undefined | null): ColourCloud[] {
  if (value == null) {
    return [];
  }

  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as ColourCloudsDesignation).clouds)
      ? (parsed as ColourCloudsDesignation).clouds
      : [];

  const clouds: ColourCloud[] = [];
  for (let index = 0; index < list.length && clouds.length < COLOUR_CLOUDS_MAX; index += 1) {
    const cloud = normalizeCloud(list[index], index);
    if (cloud) {
      clouds.push(cloud);
    }
  }

  return clouds;
}

/** Build a designation object from up to five colourable elements. */
export function createColourCloudsDesignation(items: ColourCloud[]): ColourCloudsDesignation {
  return {
    clouds: items.slice(0, COLOUR_CLOUDS_MAX).map((cloud, index) => ({
      id: cloud.id ?? `cloud-${index}`,
      ...(cloud.label ? { label: cloud.label } : {}),
      color: cloud.color,
      ...(cloud.secondary ? { secondary: cloud.secondary } : {}),
    })),
  };
}

export function serializeColourClouds(clouds: ColourCloud[]): string {
  return JSON.stringify(createColourCloudsDesignation(clouds), null, 2);
}

/** Default dropdown body listing each colourable orb. */
export function ColourCloudsMenu({ clouds }: { clouds: ColourCloud[] }) {
  if (clouds.length === 0) {
    return <p className={styles.menuEmpty}>No colours</p>;
  }

  return (
    <ul className={styles.menu}>
      {clouds.map((cloud) => (
        <li className={styles.menuRow} key={cloud.id ?? `${cloud.color}-${cloud.secondary ?? ""}`}>
          <span
            aria-hidden="true"
            className={styles.menuSwatch}
            style={
              {
                "--cloud-primary": cloud.color,
                "--cloud-secondary": cloud.secondary ?? cloud.color,
              } as CSSProperties
            }
          />
          <span className={styles.menuMeta}>
            <span className={styles.menuLabel}>{cloud.label ?? cloud.id ?? "Colour"}</span>
            <span className={styles.menuHex}>
              {cloud.color}
              {cloud.secondary ? ` · ${cloud.secondary}` : ""}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Global colours control: up to five colourable orbs from a JSON designation or `items` array.
 * Pass `children` (or use `ColourCloudsMenu`) to open a portaled dropdown; otherwise `onClick` for an external panel.
 */
export function ColourClouds({
  "aria-label": ariaLabel = "Colours",
  "aria-expanded": ariaExpanded,
  "aria-haspopup": ariaHasPopup,
  children,
  className,
  compact = false,
  items,
  label,
  menuTitle = "Colours",
  onClick,
  onOpenChange,
  onReset,
  open,
  placement = "bottom",
  resetDisabled = false,
  showReset = Boolean(onReset),
  title,
  value,
}: ColourCloudsProps) {
  const menuId = useId();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle>({ left: 0, top: 0 });

  const clouds = items ? parseColourClouds(items) : parseColourClouds(value);
  const hasMenu = children != null;
  const controlled = open !== undefined;
  const visible = hasMenu ? (controlled ? Boolean(open) : internalOpen) : false;

  const setVisible = useCallback(
    (next: boolean) => {
      if (!controlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }
      const anchorRect = triggerRef.current.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect() ?? null;
      setPortalStyle(resolveEmojiPickerPortalStyle(anchorRect, panelRect, placement));
    };

    updatePosition();
    // Remeasure after paint — first pass often has height 0 and clamps off-screen.
    let rafInner = 0;
    const rafOuter = window.requestAnimationFrame(() => {
      updatePosition();
      rafInner = window.requestAnimationFrame(updatePosition);
    });

    const panel = panelRef.current;
    const resizeObserver =
      panel && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updatePosition())
        : null;
    if (panel && resizeObserver) {
      resizeObserver.observe(panel);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(rafOuter);
      window.cancelAnimationFrame(rafInner);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [placement, visible, children, clouds.length]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setVisible(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [setVisible, visible]);

  if (clouds.length === 0) {
    return null;
  }

  const rootClass = [
    styles.control,
    compact ? styles.controlCompact : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cloudsNode = (
    <span aria-hidden="true" className={styles.clouds}>
      {clouds.map((cloud) => (
        <span
          className={styles.cloud}
          key={cloud.id ?? `${cloud.color}-${cloud.secondary ?? ""}`}
          style={
            {
              "--cloud-primary": cloud.color,
              "--cloud-secondary": cloud.secondary ?? cloud.color,
            } as CSSProperties
          }
          title={cloud.label}
        />
      ))}
    </span>
  );

  const labelNode = label ? <span className={styles.label}>{label}</span> : null;
  const content = (
    <>
      {cloudsNode}
      {labelNode}
    </>
  );

  const triggerClass = compact ? `${styles.trigger} ${styles.triggerCompact}` : styles.trigger;

  const triggerButton = (
    <button
      ref={triggerRef}
      aria-controls={hasMenu ? menuId : undefined}
      aria-expanded={hasMenu ? visible : ariaExpanded}
      aria-haspopup={hasMenu ? "dialog" : ariaHasPopup}
      aria-label={ariaLabel}
      className={triggerClass}
      title={title ?? ariaLabel}
      type="button"
      onClick={(event) => {
        if (hasMenu) {
          setVisible(!visible);
          return;
        }
        onClick?.(event);
      }}
    >
      {content}
    </button>
  );

  const trigger = hasMenu || onClick ? (
    triggerButton
  ) : (
    <span
      aria-label={ariaLabel}
      className={`${triggerClass} ${styles.triggerStatic}`}
      role="img"
      title={title ?? ariaLabel}
    >
      {content}
    </span>
  );

  const menu =
    hasMenu && visible && portalReady
      ? createPortal(
          <div
            ref={panelRef}
            aria-labelledby={titleId}
            className={styles.dropdown}
            id={menuId}
            role="dialog"
            style={
              {
                left: portalStyle.left,
                top: portalStyle.top,
                width: portalStyle.width,
              } as CSSProperties
            }
          >
            <h3 className={styles.dropdownTitle} id={titleId}>
              {menuTitle}
            </h3>
            <div className={styles.dropdownBody}>{children}</div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={rootClass} data-fit-content="true" ref={rootRef}>
      {trigger}
      {showReset && onReset ? (
        <button
          aria-label="Reset colours"
          className={styles.reset}
          disabled={resetDisabled}
          title="Reset colours"
          type="button"
          onClick={onReset}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
      ) : null}
      {menu}
    </div>
  );
}
