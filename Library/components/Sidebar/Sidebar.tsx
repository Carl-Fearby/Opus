"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { SidebarSide, SurfaceDensity } from "@/components/fields/types";
import { Tooltip } from "../Tooltip";
import { CustomScrollbar } from "../CustomScrollbar";
import styles from "./Sidebar.module.css";

type SidebarContextValue = {
  activeItem?: string;
  collapsed: boolean;
  density: SurfaceDensity;
  getGroupOpenState?: (groupId: string, fallback: boolean) => boolean;
  onCollapsedGroupSelect?: (groupId: string) => void;
  onSelect?: (item: SidebarMenuLinkItem) => void;
  setActiveItem?: (itemId: string) => void;
  setGroupOpenState?: (groupId: string, open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  density: "comfortable",
});

export type SidebarMenuLinkItem = {
  href?: string;
  icon?: ReactNode | string;
  id: string;
  label: ReactNode;
  onSelect?: (item: SidebarMenuLinkItem) => void;
  type?: "item";
};

export type SidebarMenuGroupItem = {
  children: SidebarMenuItem[];
  defaultOpen?: boolean;
  icon?: ReactNode | string;
  id: string;
  label: string;
  type: "group";
};

export type SidebarMenuItem = SidebarMenuGroupItem | SidebarMenuLinkItem;

export type SidebarProps = {
  activeItem?: string;
  children?: ReactNode;
  collapsed?: boolean;
  defaultActiveItem?: string;
  density?: SurfaceDensity;
  footer?: ReactNode;
  header?: ReactNode;
  menu?: SidebarMenuItem[];
  navLabel?: string;
  onCollapsedGroupSelect?: (groupId: string) => void;
  onSelect?: (item: SidebarMenuLinkItem) => void;
  paddingBottom?: boolean;
  paddingLeft?: boolean;
  paddingRight?: boolean;
  paddingTop?: boolean;
  persistState?: boolean;
  renderIcon?: (icon: string) => ReactNode;
  side?: SidebarSide;
  storageKey?: string;
};

type SidebarPersistedState = {
  activeItem?: string;
  groups?: Record<string, boolean>;
};

const SIDEBAR_STORAGE_PREFIX = "opus-sidebar-state";

function SidebarOverflowLabel({ label }: { label: string }) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const element = labelRef.current;
    if (!element) {
      return;
    }

    const updateOverflow = () => {
      setOverflowing(element.scrollWidth > element.clientWidth + 1);
    };
    const frame = window.requestAnimationFrame(updateOverflow);
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [label]);

  return (
    <Tooltip
      className={styles.overflowTooltip}
      content={label}
      disabled={!overflowing}
      placement="right"
    >
      <span ref={labelRef} className={styles.overflowLabel}>
        {label}
      </span>
    </Tooltip>
  );
}

function hashString(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function serialiseSidebarMenu(menu?: SidebarMenuItem[]) {
  if (!menu) {
    return "children";
  }

  const serialiseItems = (items: SidebarMenuItem[]): unknown[] =>
    items.map((item) => {
      if (item.type === "group") {
        return {
          children: serialiseItems(item.children),
          defaultOpen: item.defaultOpen ?? true,
          icon: typeof item.icon === "string" ? item.icon : "",
          id: item.id,
          label: item.label,
          type: item.type,
        };
      }

      return {
        href: item.href ?? "",
        icon: typeof item.icon === "string" ? item.icon : "",
        id: item.id,
        label: typeof item.label === "string" ? item.label : item.id,
        type: "item",
      };
    });

  return JSON.stringify(serialiseItems(menu));
}

function readSidebarState(storageKey: string): SidebarPersistedState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(storageKey);

    return stored ? (JSON.parse(stored) as SidebarPersistedState) : {};
  } catch {
    return {};
  }
}

function writeSidebarState(storageKey: string, state: SidebarPersistedState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Persistence should never break navigation.
  }
}

export function Sidebar({
  activeItem,
  children,
  collapsed = false,
  defaultActiveItem,
  density = "comfortable",
  footer,
  header,
  menu,
  navLabel = "Sidebar navigation",
  onCollapsedGroupSelect,
  onSelect,
  paddingBottom = false,
  paddingLeft = false,
  paddingRight = false,
  paddingTop = false,
  persistState = false,
  renderIcon,
  side = "left",
  storageKey,
}: SidebarProps) {
  const resolvedStorageKey = useMemo(
    () =>
      `${SIDEBAR_STORAGE_PREFIX}:${storageKey ?? hashString(`${navLabel}:${serialiseSidebarMenu(menu)}`)}`,
    [menu, navLabel, storageKey],
  );
  const [persistedState, setPersistedState] = useState<SidebarPersistedState>(
    {},
  );
  const [motionReady, setMotionReady] = useState(!persistState);
  const [internalActiveItem, setInternalActiveItem] =
    useState(defaultActiveItem);
  const effectiveActiveItem =
    activeItem ??
    (persistState
      ? (persistedState.activeItem ?? internalActiveItem)
      : internalActiveItem);

  useEffect(() => {
    if (!persistState) {
      const readyTimeout = window.setTimeout(() => setMotionReady(true), 0);
      return () => window.clearTimeout(readyTimeout);
    }

    let firstFrame: number | null = null;
    let secondFrame: number | null = null;
    let settleTimeout: number | null = null;
    const timeout = window.setTimeout(() => {
      setPersistedState(readSidebarState(resolvedStorageKey));
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          settleTimeout = window.setTimeout(() => setMotionReady(true), 100);
        });
      });
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      if (firstFrame !== null) {
        window.cancelAnimationFrame(firstFrame);
      }
      if (secondFrame !== null) {
        window.cancelAnimationFrame(secondFrame);
      }
      if (settleTimeout !== null) {
        window.clearTimeout(settleTimeout);
      }
    };
  }, [persistState, resolvedStorageKey]);

  const updatePersistedState = useCallback(
    (next: (current: SidebarPersistedState) => SidebarPersistedState) => {
      if (!persistState) {
        return;
      }

      setPersistedState((current) => {
        const updated = next(current);
        writeSidebarState(resolvedStorageKey, updated);

        return updated;
      });
    },
    [persistState, resolvedStorageKey],
  );

  const setSidebarActiveItem = useCallback(
    (itemId: string) => {
      if (persistState) {
        updatePersistedState((current) => ({
          ...current,
          activeItem: itemId,
        }));
      }

      if (activeItem === undefined) {
        setInternalActiveItem(itemId);
      }
    },
    [activeItem, persistState, updatePersistedState],
  );

  const getGroupOpenState = useCallback(
    (groupId: string, fallback: boolean) =>
      persistedState.groups?.[groupId] ?? fallback,
    [persistedState.groups],
  );

  const setGroupOpenState = useCallback(
    (groupId: string, open: boolean) => {
      updatePersistedState((current) => ({
        ...current,
        groups: {
          ...current.groups,
          [groupId]: open,
        },
      }));
    },
    [updatePersistedState],
  );

  return (
    <SidebarContext.Provider
      value={{
        activeItem: effectiveActiveItem,
        collapsed,
        density,
        getGroupOpenState: persistState ? getGroupOpenState : undefined,
        onCollapsedGroupSelect,
        onSelect,
        setActiveItem: setSidebarActiveItem,
        setGroupOpenState: persistState ? setGroupOpenState : undefined,
      }}
    >
      <aside
        aria-label="Sidebar"
        className={styles.sidebar}
        data-collapsed={collapsed ? "true" : "false"}
        data-density={density}
        data-motion-ready={motionReady ? "true" : "false"}
        data-padding-bottom={paddingBottom ? "true" : "false"}
        data-padding-left={paddingLeft ? "true" : "false"}
        data-padding-right={paddingRight ? "true" : "false"}
        data-padding-top={paddingTop ? "true" : "false"}
        data-side={side}
      >
        {header ? <div className={styles.header}>{header}</div> : null}
        <CustomScrollbar
          className={styles.body}
          label={navLabel}
          orientation="vertical"
        >
          <div className={styles.bodyContent}>
            {menu ? (
              <SidebarNav aria-label={navLabel}>
                {menu.map((item) =>
                  renderSidebarMenuItem({
                    depth: 0,
                    effectiveActiveItem,
                    item,
                    renderIcon,
                  }),
                )}
              </SidebarNav>
            ) : (
              children
            )}
          </div>
        </CustomScrollbar>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </aside>
    </SidebarContext.Provider>
  );
}

type SidebarHeaderProps = {
  children?: ReactNode;
  title: string;
};

export function SidebarHeader({ children, title }: SidebarHeaderProps) {
  const { collapsed } = useContext(SidebarContext);

  return (
    <div className={styles.headerInner}>
      <h2 className={collapsed ? styles.visuallyHidden : styles.headerTitle}>
        {title}
      </h2>
      {children}
    </div>
  );
}

type SidebarNavProps = {
  "aria-label": string;
  children: ReactNode;
};

export function SidebarNav({
  "aria-label": ariaLabel,
  children,
}: SidebarNavProps) {
  return (
    <nav aria-label={ariaLabel} className={styles.nav}>
      {children}
    </nav>
  );
}

type SidebarLinkProps = {
  active?: boolean;
  children: ReactNode;
  href?: string;
  icon?: ReactNode;
  itemId?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  onSelect?: (item: SidebarMenuLinkItem) => void;
};

export function SidebarLink({
  active,
  children,
  href,
  icon,
  itemId,
  onClick,
  onSelect,
}: SidebarLinkProps) {
  const {
    activeItem,
    collapsed,
    onSelect: onSidebarSelect,
    setActiveItem,
  } = useContext(SidebarContext);
  const isActive = active ?? (itemId ? activeItem === itemId : false);
  const className = [styles.link, isActive ? styles.linkActive : ""]
    .filter(Boolean)
    .join(" ");
  const label = typeof children === "string" ? children : null;
  const handleClick = (
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    const item = itemId
      ? {
          href,
          id: itemId,
          label: children,
        }
      : null;

    if (item) {
      setActiveItem?.(item.id);
      onSidebarSelect?.(item);
      onSelect?.(item);
    }

    onClick?.(event);
  };
  const content = (
    <>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {!icon && collapsed && label ? (
        <span aria-hidden="true" className={styles.icon}>
          {label.charAt(0)}
        </span>
      ) : null}
      {collapsed ? (
        <span className={styles.visuallyHidden}>{children}</span>
      ) : label ? (
        <SidebarOverflowLabel label={label} />
      ) : (
        <span className={styles.linkLabel}>{children}</span>
      )}
    </>
  );

  const control = href ? (
    <a
      aria-current={isActive ? "page" : undefined}
      className={className}
      href={href}
      onClick={handleClick}
    >
      {content}
    </a>
  ) : (
    <button
      aria-current={isActive ? "page" : undefined}
      className={className}
      onClick={handleClick}
      type="button"
    >
      {content}
    </button>
  );

  if (collapsed && label) {
    return (
      <Tooltip
        className={styles.collapsedTooltip}
        content={label}
        placement="right"
      >
        {control}
      </Tooltip>
    );
  }

  return control;
}

function renderSidebarMenuIcon(
  icon: SidebarMenuItem["icon"],
  renderIcon?: (icon: string) => ReactNode,
) {
  if (!icon) {
    return null;
  }

  if (typeof icon === "string") {
    return renderIcon?.(icon) ?? null;
  }

  return icon;
}

function renderSidebarMenuItem({
  depth,
  effectiveActiveItem,
  item,
  renderIcon,
}: {
  depth: number;
  effectiveActiveItem?: string;
  item: SidebarMenuItem;
  renderIcon?: (icon: string) => ReactNode;
}) {
  if (item.type === "group") {
    return (
      <SidebarGroup
        defaultOpen={item.defaultOpen}
        depth={depth}
        icon={renderSidebarMenuIcon(item.icon, renderIcon)}
        id={item.id}
        key={item.id}
        label={item.label}
      >
        {item.children.map((child) =>
          renderSidebarMenuItem({
            depth: depth + 1,
            effectiveActiveItem,
            item: child,
            renderIcon,
          }),
        )}
      </SidebarGroup>
    );
  }

  const handleClick = (
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (!item.href) {
      event.preventDefault();
    }
  };

  return (
    <SidebarLink
      itemId={item.id}
      active={effectiveActiveItem ? effectiveActiveItem === item.id : undefined}
      href={item.href}
      icon={renderSidebarMenuIcon(item.icon, renderIcon)}
      key={item.id}
      onClick={handleClick}
      onSelect={item.onSelect}
    >
      {item.label}
    </SidebarLink>
  );
}

function createGroupListId(label: string, id?: string) {
  if (id) {
    return id;
  }

  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `sidebar-group-${slug}` : "sidebar-group";
}

type SidebarGroupProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  depth?: number;
  icon?: ReactNode;
  id?: string;
  label: string;
};

export function SidebarGroup({
  children,
  defaultOpen = true,
  depth = 0,
  icon,
  id,
  label,
}: SidebarGroupProps) {
  const {
    collapsed,
    getGroupOpenState,
    onCollapsedGroupSelect,
    setGroupOpenState,
  } = useContext(SidebarContext);
  const listId = createGroupListId(label, id);
  const [open, setOpen] = useState(
    () => getGroupOpenState?.(listId, defaultOpen) ?? defaultOpen,
  );
  const [collapsedOpen, setCollapsedOpen] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setOpen(getGroupOpenState?.(listId, defaultOpen) ?? defaultOpen);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [defaultOpen, getGroupOpenState, listId]);

  const toggleOpen = () => {
    const next = !open;

    setOpen(next);
    setGroupOpenState?.(listId, next);
  };

  if (collapsed) {
    if (depth > 0) {
      return (
        <div className={styles.collapsedGroupWrap}>
          <Tooltip
            className={styles.collapsedTooltip}
            content={label}
            placement="right"
          >
            <button
              aria-expanded={collapsedOpen}
              aria-label={`${collapsedOpen ? "Close" : "Open"} ${label}`}
              className={styles.collapsedGroup}
              onClick={() => {
                setCollapsedOpen((current) => !current);
                onCollapsedGroupSelect?.(listId);
              }}
              type="button"
            >
              <span aria-hidden="true" className={styles.icon}>
                {icon ?? label.charAt(0)}
              </span>
              <span
                aria-hidden="true"
                className={
                  collapsedOpen
                    ? styles.collapsedGroupChevronOpen
                    : styles.collapsedGroupChevron
                }
              />
            </button>
          </Tooltip>
          {collapsedOpen ? (
            <div className={styles.collapsedSubmenu}>{children}</div>
          ) : null}
        </div>
      );
    }

    return (
      <div
        aria-label={label}
        className={styles.group}
        data-depth={depth}
        role="group"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      aria-label={label}
      className={styles.group}
      data-depth={depth}
      role="group"
    >
      <div className={styles.groupHeader}>
        <button
          aria-controls={listId}
          aria-expanded={open}
          className={styles.groupLabel}
          onClick={toggleOpen}
          type="button"
        >
          {icon ? <span className={styles.icon}>{icon}</span> : null}
          <SidebarOverflowLabel label={label} />
          <span
            aria-hidden="true"
            className={open ? styles.groupChevronOpen : styles.groupChevron}
          />
        </button>
      </div>
      <div
        className={styles.groupItemsWrap}
        data-open={open ? "true" : "false"}
      >
        <div
          className={styles.groupItems}
          id={listId}
          inert={!open || undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

type SidebarLayoutProps = {
  children: ReactNode;
  collapsed?: boolean;
  main: ReactNode;
  side?: SidebarSide;
};

export function SidebarLayout({
  children,
  collapsed = false,
  main,
  side = "left",
}: SidebarLayoutProps) {
  return (
    <div
      className={styles.layout}
      data-collapsed={collapsed ? "true" : "false"}
      data-side={side}
    >
      {side === "left" ? children : null}
      <div className={styles.main}>{main}</div>
      {side === "right" ? children : null}
    </div>
  );
}
