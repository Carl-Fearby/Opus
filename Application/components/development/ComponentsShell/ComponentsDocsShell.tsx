"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { ComponentsPageHeader } from "./ComponentsPageHeader";
import { ComponentsShellHeader } from "./ComponentsShellHeader";
import { ComponentsSidebar } from "./ComponentsSidebar";
import { ComponentSettingsProvider, useComponentSettingsContext } from "./ComponentSettingsContext";
import { ComponentsSettingsSidebar } from "./ComponentsSettingsSidebar";
import {
  ViewportAtmosphere,
  ViewportAtmosphereProvider,
  type ViewportAtmosphereSettings,
} from "@/components/control-detail/ControlDetail/BodyPortal";
import { controlHasSettingsPanel } from "@/lib/controls/controlSettingsPanel";
import { CustomScrollbar } from "opus-react";
import styles from "./ComponentsShell.module.css";

const COMPACT_VIEWPORT_QUERY = "(max-width: 720px)";

function subscribeToCompactViewport(onStoreChange: () => void) {
  const media = window.matchMedia(COMPACT_VIEWPORT_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getCompactViewportSnapshot() {
  return window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;
}

function getCompactViewportServerSnapshot() {
  return false;
}

function ComponentsShellBody({ children }: { children: ReactNode }) {
  const { accentStyle } = useComponentsTheme();
  const { activeSlug, isResizing, settingsCollapsed, settingsWidth } = useComponentSettingsContext();
  const pathname = usePathname();
  const compact = useSyncExternalStore(
    subscribeToCompactViewport,
    getCompactViewportSnapshot,
    getCompactViewportServerSnapshot,
  );
  const [openNavPath, setOpenNavPath] = useState<string | null>(null);
  const [openSettingsPath, setOpenSettingsPath] = useState<string | null>(null);

  const hasSettings = Boolean(activeSlug && controlHasSettingsPanel(activeSlug));
  const navOpen = openNavPath === pathname;
  const settingsOpen = hasSettings && openSettingsPath === pathname;
  const drawerOpen = navOpen || settingsOpen;
  const settingsColumnWidth = settingsCollapsed ? 44 : settingsWidth;

  const closeDrawers = useCallback(() => {
    setOpenNavPath(null);
    setOpenSettingsPath(null);
  }, []);

  const openNav = useCallback(() => {
    setOpenSettingsPath(null);
    setOpenNavPath(pathname);
  }, [pathname]);

  const openSettings = useCallback(() => {
    setOpenNavPath(null);
    setOpenSettingsPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawers();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawers, drawerOpen]);

  return (
    <div
      className={styles.body}
      data-has-settings={hasSettings ? "true" : undefined}
      data-nav-open={navOpen ? "true" : undefined}
      data-resizing={isResizing ? "true" : undefined}
      data-settings-collapsed={hasSettings && settingsCollapsed ? "true" : undefined}
      data-settings-open={settingsOpen ? "true" : undefined}
      style={{ "--settings-sidebar-width": `${settingsColumnWidth}px` } as CSSProperties}
    >
      <ComponentsSidebar onNavigate={closeDrawers} onRequestClose={() => setOpenNavPath(null)} />
      <button
        aria-hidden="true"
        className={styles.navBackdrop}
        onClick={closeDrawers}
        tabIndex={-1}
        type="button"
      />
      <main className={styles.content} id="main-content" style={accentStyle}>
        <ComponentsPageHeader
          hasSettings={hasSettings}
          navOpen={navOpen}
          onOpenNav={openNav}
          onOpenSettings={openSettings}
          settingsOpen={settingsOpen}
        />
        <CustomScrollbar className={styles.contentBody} label="Component documentation" orientation="vertical">
          <div className={styles.contentBodyInner}>{children}</div>
        </CustomScrollbar>
      </main>
      <ComponentsSettingsSidebar
        compact={compact}
        mobileOpen={settingsOpen}
        onRequestClose={() => setOpenSettingsPath(null)}
      />
    </div>
  );
}

export function ComponentsDocsShell({ children }: { children: ReactNode }) {
  const { accentStyle } = useComponentsTheme();
  const [atmosphere, setAtmosphere] = useState<ViewportAtmosphereSettings | null>(null);

  return (
    <ViewportAtmosphereProvider setSettings={setAtmosphere}>
      <div className={styles.shell} data-components-shell="" style={accentStyle}>
        <div aria-hidden="true" className={styles.viewportAtmosphere} data-viewport-atmosphere="">
          <ViewportAtmosphere settings={atmosphere} />
        </div>
        <a className={styles.skipLink} href="#main-content">
          Skip to main content
        </a>
        <ComponentsShellHeader />
        <ComponentSettingsProvider>
          <ComponentsShellBody>{children}</ComponentsShellBody>
        </ComponentSettingsProvider>
      </div>
    </ViewportAtmosphereProvider>
  );
}
