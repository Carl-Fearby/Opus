"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import type { SurfaceDensity } from "@/components/fields/types";
import { useOpusTheme } from "@/components/OpusThemeProvider";
import { useTopNavigation } from "@/components/TopNavigation/TopNavigationContext";
import {
  resolveMegaMenuPortalStyle,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import styles from "./MegaMenu.module.css";

const MEGA_MENU_EXIT_MS = 280;

type PanelPhase = "closing" | "opening";

export type MegaMenuItem = {
  description?: string;
  href?: string;
  icon?: ReactNode;
  id: string;
  label: string;
  onSelect?: () => void;
};

export type MegaMenuSection = {
  id: string;
  items: MegaMenuItem[];
  title: string;
};

export type MegaMenuFeatured = {
  actionLabel?: string;
  description: string;
  eyebrow?: string;
  title: string;
};

export type MegaMenuConfig = {
  featured?: MegaMenuFeatured;
  id: string;
  label: string;
  sections: MegaMenuSection[];
};

type MegaMenuProps = {
  activeMenu?: string;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  density?: SurfaceDensity;
  featured?: MegaMenuFeatured;
  label?: string;
  menus?: MegaMenuConfig[];
  navigationId?: string;
  onActiveMenuChange?: (menuId: string) => void;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: MegaMenuItem) => void;
  open?: boolean;
  sections?: MegaMenuSection[];
  staticPanel?: boolean;
  triggerLabel?: string;
};

export const defaultMegaMenuFeatured: MegaMenuFeatured = {
  eyebrow: "Featured",
  title: "Build faster with Opus",
  description:
    "Browse production-ready components, patterns, and implementation notes from one navigation surface.",
  actionLabel: "Explore library",
};

export const defaultMegaMenuMenus: MegaMenuConfig[] = [
  {
    id: "app",
    label: "App",
    featured: defaultMegaMenuFeatured,
    sections: [
      {
        id: "foundation",
        title: "Foundation",
        items: [
          {
            id: "tokens",
            label: "Design tokens",
            description: "Colour, radius, spacing, typography, and shared CSS variables.",
          },
          {
            id: "themes",
            label: "Theme system",
            description: "Light and dark modes with unified surface and form colours.",
          },
          {
            id: "accessibility",
            label: "Accessibility",
            description: "Keyboard, focus, aria, and contrast guidance for components.",
          },
        ],
      },
      {
        id: "systems",
        title: "Systems",
        items: [
          {
            id: "forms",
            label: "Form architecture",
            description: "Composable fields, labels, errors, and layout modes.",
          },
          {
            id: "themes-runtime",
            label: "Theme runtime",
            description: "CSS variables and provider-level theme switching.",
          },
          {
            id: "release-readiness",
            label: "Release readiness",
            description: "Validation, docs, and migration checks before shipping.",
          },
        ],
      },
    ],
  },
  {
    id: "file",
    label: "File",
    featured: {
      eyebrow: "Library",
      title: "Production-ready building blocks",
      description: "Explore form fields, overlays, navigation, media, and data components.",
      actionLabel: "Browse components",
    },
    sections: [
      {
        id: "inputs",
        title: "Inputs",
        items: [
          { id: "text", label: "Text fields", description: "Single and multi-line field patterns." },
          { id: "choice", label: "Choice controls", description: "Checkboxes, radios, switches, and ranges." },
          { id: "upload", label: "Uploads", description: "File, image, and future asset upload flows." },
        ],
      },
      {
        id: "surfaces",
        title: "Surfaces",
        items: [
          { id: "cards", label: "Cards & panels", description: "Structured containers for pages and dashboards." },
          { id: "tables", label: "Tables & grids", description: "Readable data surfaces with sorting and filtering." },
          { id: "media", label: "Media", description: "Images, 3D assets, galleries, and lightboxes." },
        ],
      },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    featured: {
      eyebrow: "Guidance",
      title: "Patterns that fit together",
      description: "Use examples and recipes to combine components into complete product flows.",
      actionLabel: "View patterns",
    },
    sections: [
      {
        id: "workflows",
        title: "Workflows",
        items: [
          { id: "settings", label: "Settings pages", description: "Grouped controls with clear save/cancel actions." },
          { id: "confirmation", label: "Confirmation flows", description: "Dialogs and modals for safe decisions." },
          { id: "navigation", label: "Navigation shells", description: "Sidebars, top menus, and deep navigation." },
        ],
      },
      {
        id: "states",
        title: "States",
        items: [
          { id: "loading", label: "Loading", description: "Skeletons and progressive reveal patterns." },
          { id: "empty", label: "Empty states", description: "Helpful zero-state messaging and actions." },
          { id: "error", label: "Error handling", description: "Alerts, inline errors, and recovery routes." },
        ],
      },
    ],
  },
  {
    id: "view",
    label: "View",
    featured: {
      eyebrow: "Docs",
      title: "Everything in one place",
      description: "Reference API notes, examples, accessibility guidance, and implementation details.",
      actionLabel: "Open docs",
    },
    sections: [
      {
        id: "docs",
        title: "Documentation",
        items: [
          { id: "getting-started", label: "Getting started", description: "Install, import, and theme Opus components." },
          { id: "component-api", label: "Component API", description: "Props, defaults, and usage examples." },
          { id: "accessibility-docs", label: "Accessibility docs", description: "Keyboard and screen reader behaviour." },
        ],
      },
      {
        id: "team",
        title: "Team",
        items: [
          { id: "contribution", label: "Contributing", description: "Add or update components with confidence." },
          { id: "review", label: "Review checklist", description: "Quality gates for design and engineering." },
          { id: "support", label: "Support", description: "Where to ask questions and report issues." },
        ],
      },
    ],
  },
  {
    id: "window",
    label: "Window",
    featured: {
      eyebrow: "Opus",
      title: "Design system operations",
      description: "Keep teams aligned with release notes, ownership, and adoption reporting.",
      actionLabel: "View roadmap",
    },
    sections: [
      {
        id: "operations",
        title: "Operations",
        items: [
          { id: "roadmap", label: "Roadmap", description: "Upcoming components and improvements." },
          { id: "changelog", label: "Changelog", description: "What changed, when, and why." },
          { id: "metrics", label: "Adoption metrics", description: "Track usage across products and teams." },
        ],
      },
      {
        id: "ownership",
        title: "Ownership",
        items: [
          { id: "maintainers", label: "Maintainers", description: "Component owners and review contacts." },
          { id: "requests", label: "Requests", description: "Propose new components and pattern changes." },
          { id: "governance", label: "Governance", description: "Decision records and contribution policy." },
        ],
      },
    ],
  },
];

export const defaultMegaMenuSections = defaultMegaMenuMenus[0].sections;

export const defaultTopNavigationMegaMenus = defaultMegaMenuMenus.filter((menu) =>
  menu.id === "edit",
);

export function MegaMenu({
  activeMenu,
  closeOnEscape = true,
  closeOnOutside = true,
  density = "comfortable",
  featured = defaultMegaMenuFeatured,
  label = "Primary",
  menus,
  navigationId,
  onActiveMenuChange,
  onOpenChange,
  onSelect,
  open,
  sections,
  staticPanel = false,
  triggerLabel = "Resources",
}: MegaMenuProps) {
  const menuId = useId();
  const theme = useOpusTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const [renderPanel, setRenderPanel] = useState(false);
  const [phase, setPhase] = useState<PanelPhase>("opening");
  const [portalReady, setPortalReady] = useState(false);
  const topNavigation = useTopNavigation();
  const inTopNavigation = topNavigation !== null;
  const registerMenuPresent = topNavigation?.setMenuPresent;
  const isStaticPanel = staticPanel && !inTopNavigation;
  const resolvedMenus = menus ?? [
    {
      id: navigationId ?? "default",
      label: triggerLabel,
      featured,
      sections: sections ?? defaultMegaMenuSections,
    },
  ];
  const firstMenuId = resolvedMenus[0]?.id ?? "default";
  const [internalActiveMenu, setInternalActiveMenu] = useState(firstMenuId);
  const resolvedActiveMenu = activeMenu ?? internalActiveMenu;
  const activeConfig =
    resolvedMenus.find((menu) => menu.id === resolvedActiveMenu) ?? resolvedMenus[0];
  const controlled = open !== undefined || inTopNavigation;
  const navigationOpen = inTopNavigation
    ? resolvedMenus.some((menu) => topNavigation.activeMenu === menu.id)
    : undefined;
  const visible = isStaticPanel
    ? true
    : inTopNavigation
      ? navigationOpen
      : controlled
        ? open
        : internalOpen;
  const resolvedCloseOnEscape = inTopNavigation ? topNavigation.closeOnEscape : closeOnEscape;
  const resolvedCloseOnOutside = inTopNavigation ? topNavigation.closeOnOutside : closeOnOutside;

  const setVisible = useCallback((nextOpen: boolean, menuId = activeConfig?.id ?? firstMenuId) => {
    if (inTopNavigation) {
      if (nextOpen) {
        topNavigation.openMenu(menuId);
      } else {
        topNavigation.closeMenu();
      }
    } else if (!controlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }, [activeConfig?.id, controlled, firstMenuId, inTopNavigation, onOpenChange, topNavigation]);

  const setActive = useCallback((menuId: string) => {
    if (activeMenu === undefined) {
      setInternalActiveMenu(menuId);
    }

    onActiveMenuChange?.(menuId);
  }, [activeMenu, onActiveMenuChange]);

  const openMenu = useCallback((menuId: string) => {
    setActive(menuId);
    setVisible(true, menuId);
  }, [setActive, setVisible]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    if (isStaticPanel || !renderPanel || !rootRef.current) {
      setPortalStyle(null);
      return;
    }

    const updatePosition = () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      setPortalStyle(resolveMegaMenuPortalStyle(root, inTopNavigation));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [inTopNavigation, isStaticPanel, phase, renderPanel]);

  useEffect(() => {
    if (isStaticPanel || !visible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        resolvedCloseOnOutside
        && !rootRef.current?.contains(target)
        && !panelRef.current?.contains(target)
      ) {
        setVisible(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (resolvedCloseOnEscape && event.key === "Escape") {
        setVisible(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStaticPanel, resolvedCloseOnEscape, resolvedCloseOnOutside, setVisible, visible]);

  useEffect(() => {
    if (isStaticPanel) {
      return;
    }

    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (visible) {
        setRenderPanel(true);
        setPhase("opening");
        return;
      }

      setPhase("closing");
      timeout = window.setTimeout(() => setRenderPanel(false), MEGA_MENU_EXIT_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [isStaticPanel, visible]);

  useEffect(() => {
    if (!inTopNavigation || isStaticPanel || !activeConfig || !registerMenuPresent) {
      return;
    }

    registerMenuPresent(activeConfig.id, renderPanel);
    return () => registerMenuPresent(activeConfig.id, false);
  }, [activeConfig?.id, inTopNavigation, isStaticPanel, registerMenuPresent, renderPanel]);

  const handleSelect = (item: MegaMenuItem) => {
    item.onSelect?.();
    onSelect?.(item);
    if (inTopNavigation) {
      topNavigation.onMenuSelect?.(activeConfig?.id ?? firstMenuId, item);
    }

    if (!isStaticPanel && (!inTopNavigation || topNavigation.closeOnSelect)) {
      setVisible(false);
    }
  };

  const showPanel = isStaticPanel ? Boolean(activeConfig) : renderPanel && Boolean(activeConfig);

  const portaledPanelStyle: CSSProperties | undefined =
    !isStaticPanel && portalStyle
      ? {
          left: portalStyle.left,
          top: portalStyle.top,
          width: portalStyle.width,
        }
      : undefined;

  const panelNode =
    showPanel && activeConfig ? (
      <div
        ref={panelRef}
        className={styles.panel}
        data-phase={isStaticPanel ? undefined : phase}
        data-portaled={isStaticPanel ? undefined : "true"}
        data-theme={isStaticPanel ? undefined : theme}
        id={menuId}
        role="menu"
        style={portaledPanelStyle}
      >
        <div className={styles.panelContent}>
          <div className={styles.sections}>
            {activeConfig.sections.map((section) => (
              <section className={styles.section} key={section.id}>
                <h3>{section.title}</h3>
                <div className={styles.items}>
                  {section.items.map((item) => (
                    <button
                      className={styles.item}
                      key={item.id}
                      role="menuitem"
                      type="button"
                      onClick={() => handleSelect(item)}
                    >
                      {item.icon ? <span className={styles.itemIcon}>{item.icon}</span> : null}
                      <span className={styles.itemCopy}>
                        <span>{item.label}</span>
                        {item.description ? <small>{item.description}</small> : null}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {activeConfig.featured ? (
            <aside className={styles.featured}>
              {activeConfig.featured.eyebrow ? (
                <span className={styles.eyebrow}>{activeConfig.featured.eyebrow}</span>
              ) : null}
              <strong>{activeConfig.featured.title}</strong>
              <p>{activeConfig.featured.description}</p>
              {activeConfig.featured.actionLabel ? (
                <button className={styles.featuredAction} type="button">
                  {activeConfig.featured.actionLabel}
                </button>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    ) : null;

  return (
    <nav
      ref={rootRef}
      aria-label={label}
      className={styles.root}
      data-density={density}
      data-surface={inTopNavigation ? "navigation" : isStaticPanel ? "static" : "standalone"}
    >
      {isStaticPanel ? null : (
        <div className={styles.menuBar} role="menubar">
          {resolvedMenus.map((menu) => {
            const isActive = activeConfig?.id === menu.id && Boolean(visible);

            return (
              <button
                aria-controls={menuId}
                aria-expanded={isActive}
                aria-haspopup="menu"
                className={styles.trigger}
                key={menu.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  if (inTopNavigation) {
                    openMenu(menu.id);
                    return;
                  }

                  if (isActive) {
                    setVisible(false, menu.id);
                    return;
                  }

                  openMenu(menu.id);
                }}
                onFocus={() => openMenu(menu.id)}
                onMouseEnter={() => openMenu(menu.id)}
              >
                <span>{menu.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {isStaticPanel ? panelNode : null}
      {!isStaticPanel && portalReady && panelNode ? createPortal(panelNode, document.body) : null}
    </nav>
  );
}
