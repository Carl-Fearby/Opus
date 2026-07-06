"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { DropdownMenuItemData } from "@/components/DropdownMenu";
import { DropdownMenu } from "@/components/DropdownMenu";
import type { SurfaceDensity } from "@/components/fields/types";
import {
  MegaMenu,
  defaultTopNavigationMegaMenus,
  type MegaMenuFeatured,
  type MegaMenuSection,
} from "@/components/MegaMenu";
import {
  TopNavigationContext,
  type TopNavigationContextValue,
  type TopNavigationSelectItem,
} from "./TopNavigationContext";
import styles from "./TopNavigation.module.css";

export type TopNavigationMenuConfig = {
  id: string;
  items: DropdownMenuItemData[];
  label: string;
};

export type TopNavigationDropdownMenu = {
  type: "dropdown";
  id: string;
  items: DropdownMenuItemData[];
  label: string;
};

export type TopNavigationMegaMenu = {
  type: "mega";
  featured?: MegaMenuFeatured;
  id: string;
  label: string;
  sections: MegaMenuSection[];
};

export type TopNavigationBarMenu = TopNavigationDropdownMenu | TopNavigationMegaMenu;

export const defaultTopNavigationMenus: TopNavigationMenuConfig[] = [
  {
    id: "opus",
    label: "Opus",
    items: [
      { id: "about", label: "About Opus" },
      { id: "settings", label: "Settings…", shortcut: "⌘," },
      { id: "check-updates", label: "Check for Updates…" },
      { id: "quit", label: "Quit Opus", shortcut: "⌘Q" },
    ],
  },
  {
    id: "file",
    label: "File",
    items: [
      { id: "new", label: "New", shortcut: "⌘N" },
      { id: "open", label: "Open…", shortcut: "⌘O" },
      { id: "save", label: "Save", shortcut: "⌘S" },
      { id: "save-as", label: "Save As…", shortcut: "⇧⌘S" },
      { id: "close", label: "Close Window", shortcut: "⌘W" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { id: "undo", label: "Undo", shortcut: "⌘Z" },
      { id: "redo", label: "Redo", shortcut: "⇧⌘Z" },
      { id: "cut", label: "Cut", shortcut: "⌘X" },
      { id: "copy", label: "Copy", shortcut: "⌘C" },
      { id: "paste", label: "Paste", shortcut: "⌘V" },
      { id: "select-all", label: "Select All", shortcut: "⌘A" },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { id: "reload", label: "Reload", shortcut: "⌘R" },
      { id: "actual-size", label: "Actual Size", shortcut: "⌘0" },
      { id: "zoom-in", label: "Zoom In", shortcut: "⌘+" },
      { id: "zoom-out", label: "Zoom Out", shortcut: "⌘-" },
      { id: "toggle-sidebar", label: "Toggle Sidebar", shortcut: "⌘B" },
    ],
  },
  {
    id: "window",
    label: "Window",
    items: [
      { id: "minimize", label: "Minimize", shortcut: "⌘M" },
      { id: "zoom", label: "Zoom" },
      { id: "bring-all-front", label: "Bring All to Front" },
    ],
  },
  {
    id: "help",
    label: "Help",
    items: [
      { id: "docs", label: "Opus Documentation" },
      { id: "shortcuts", label: "Keyboard Shortcuts" },
      { id: "report", label: "Report an Issue" },
    ],
  },
];

const defaultEditMegaMenu = defaultTopNavigationMegaMenus[0];

if (!defaultEditMegaMenu) {
  throw new Error("Expected edit mega menu in defaultTopNavigationMegaMenus.");
}

export const defaultTopNavigationBarMenus: TopNavigationBarMenu[] = [
  {
    type: "dropdown",
    id: "app",
    label: "App",
    items: defaultTopNavigationMenus.find((menu) => menu.id === "opus")?.items ?? [],
  },
  {
    type: "dropdown",
    id: "file",
    label: "File",
    items: defaultTopNavigationMenus.find((menu) => menu.id === "file")?.items ?? [],
  },
  {
    type: "mega",
    id: defaultEditMegaMenu.id,
    label: defaultEditMegaMenu.label,
    featured: defaultEditMegaMenu.featured,
    sections: defaultEditMegaMenu.sections,
  },
  {
    type: "dropdown",
    id: "view",
    label: "View",
    items: defaultTopNavigationMenus.find((menu) => menu.id === "view")?.items ?? [],
  },
  {
    type: "dropdown",
    id: "window",
    label: "Window",
    items: defaultTopNavigationMenus.find((menu) => menu.id === "window")?.items ?? [],
  },
  {
    type: "dropdown",
    id: "help",
    label: "Help",
    items: defaultTopNavigationMenus.find((menu) => menu.id === "help")?.items ?? [],
  },
];

function menuIdFromLabel(label: string) {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "menu";
}

function withShortcuts(items: DropdownMenuItemData[], showShortcuts: boolean) {
  if (showShortcuts) {
    return items;
  }

  return items.map((item) => {
    const nextItem = { ...item };
    delete nextItem.shortcut;
    return nextItem;
  });
}

function useTopNavigationMenuContext() {
  const context = useContext(TopNavigationContext);

  if (!context) {
    throw new Error("TopNavigationMenu must be used within TopNavigation.");
  }

  return context;
}

function TopNavigationTrigger(props: ComponentProps<"button">) {
  return <button className={styles.menuTrigger} type="button" {...props} />;
}

type TopNavigationMenuProps = {
  children?: ReactNode;
  id?: string;
  items?: DropdownMenuItemData[];
  label: string;
};

export function TopNavigationMenu({ children, id, items, label }: TopNavigationMenuProps) {
  const context = useTopNavigationMenuContext();
  const menuId = id ?? menuIdFromLabel(label);
  const isActive = context.activeMenu === menuId;
  const isPresent = context.presentMenus.has(menuId);

  return (
    <div
      className={styles.menuSlot}
      data-active={isActive ? "true" : "false"}
      data-open={isActive || isPresent ? "true" : "false"}
      onMouseEnter={() => context.openMenu(menuId)}
    >
      {children ?? (
        <DropdownMenu
          elevated
          items={withShortcuts(items ?? [], context.showShortcuts)}
          label={`${label} menu`}
          navigationId={menuId}
          openOnHover
          placement="bottom-start"
          trigger={<TopNavigationTrigger>{label}</TopNavigationTrigger>}
        />
      )}
    </div>
  );
}

TopNavigationMenu.displayName = "TopNavigationMenu";

const HOVER_CLOSE_DELAY_MS = 200;

type TopNavigationProps = {
  activeMenu?: string | null;
  children?: ReactNode;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  closeOnSelect?: boolean;
  density?: SurfaceDensity;
  menus?: TopNavigationBarMenu[];
  onActiveMenuChange?: (menuId: string | null) => void;
  onSelect?: (menuId: string, item: TopNavigationSelectItem) => void;
  showShortcuts?: boolean;
};

function TopNavigationMegaMenuSlot({
  density,
  menu,
}: {
  density: SurfaceDensity;
  menu: TopNavigationMegaMenu;
}) {
  const context = useTopNavigationMenuContext();
  const isActive = context.activeMenu === menu.id;
  const isPresent = context.presentMenus.has(menu.id);

  return (
    <div
      className={styles.menuSlotMega}
      data-active={isActive ? "true" : "false"}
      data-open={isActive || isPresent ? "true" : "false"}
      onMouseEnter={() => context.openMenu(menu.id)}
    >
      <MegaMenu
        density={density}
        menus={[
          {
            id: menu.id,
            label: menu.label,
            featured: menu.featured,
            sections: menu.sections,
          },
        ]}
      />
    </div>
  );
}

function TopNavigationBarMenus({
  density,
  menus,
}: {
  density: SurfaceDensity;
  menus: TopNavigationBarMenu[];
}) {
  return (
    <>
      {menus.map((menu) =>
        menu.type === "dropdown" ? (
          <TopNavigationMenu
            key={menu.id}
            id={menu.id}
            items={menu.items}
            label={menu.label}
          />
        ) : (
          <TopNavigationMegaMenuSlot key={menu.id} density={density} menu={menu} />
        ),
      )}
    </>
  );
}

export function TopNavigation({
  activeMenu = null,
  children,
  closeOnEscape = true,
  closeOnOutside = true,
  closeOnSelect = true,
  density = "comfortable",
  menus,
  onActiveMenuChange,
  onSelect,
  showShortcuts = true,
}: TopNavigationProps) {
  const closeTimeoutRef = useRef<number | null>(null);
  const [presentMenus, setPresentMenus] = useState<Set<string>>(() => new Set());

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openMenu = useCallback(
    (menuId: string) => {
      clearCloseTimeout();
      onActiveMenuChange?.(menuId);
    },
    [clearCloseTimeout, onActiveMenuChange],
  );

  const closeMenu = useCallback(() => {
    onActiveMenuChange?.(null);
  }, [onActiveMenuChange]);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(closeMenu, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimeout, closeMenu]);

  const setMenuPresent = useCallback((menuId: string, present: boolean) => {
    setPresentMenus((current) => {
      const hasMenu = current.has(menuId);
      if (present && hasMenu) {
        return current;
      }

      if (!present && !hasMenu) {
        return current;
      }

      const next = new Set(current);
      if (present) {
        next.add(menuId);
      } else {
        next.delete(menuId);
      }

      return next;
    });
  }, []);

  useEffect(() => clearCloseTimeout, [clearCloseTimeout]);

  const contextValue = useMemo<TopNavigationContextValue>(
    () => ({
      activeMenu,
      closeMenu,
      closeOnEscape,
      closeOnOutside,
      closeOnSelect,
      onMenuSelect: onSelect,
      openMenu,
      presentMenus,
      setMenuPresent,
      showShortcuts,
    }),
    [
      activeMenu,
      closeMenu,
      closeOnEscape,
      closeOnOutside,
      closeOnSelect,
      onSelect,
      openMenu,
      presentMenus,
      setMenuPresent,
      showShortcuts,
    ],
  );

  return (
    <TopNavigationContext.Provider value={contextValue}>
      <header
        className={styles.bar}
        data-density={density}
        data-menu-open={activeMenu ? "true" : "false"}
        onMouseEnter={clearCloseTimeout}
        onMouseLeave={scheduleClose}
      >
        <nav aria-label="Application" className={styles.nav}>
          {children ?? (
            <TopNavigationBarMenus
              density={density}
              menus={menus ?? defaultTopNavigationBarMenus}
            />
          )}
        </nav>
      </header>
    </TopNavigationContext.Provider>
  );
}

export { useTopNavigation } from "./TopNavigationContext";
