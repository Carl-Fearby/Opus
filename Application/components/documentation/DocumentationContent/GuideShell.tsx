"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import type { GuidePage } from "@/lib/documentation/content";
import { guidePath } from "@/lib/documentation/routes";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";
import styles from "./documentation.module.css";

type GuideShellProps = {
  children: ReactNode;
  pages: GuidePage[];
};

export function GuideShell({ children, pages }: GuideShellProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useStoredTheme();
  const { accent, accentSecondary, accentStyle, resetAccent, setAccent, setAccentSecondary } =
    useAccentPreference();
  const {
    resetTileAccent,
    setTileAccent,
    setTileAccentSecondary,
    tileAccent,
    tileAccentSecondary,
    tileAccentStyle,
  } = useTileAccentPreference();

  return (
    <OpusThemeProvider theme={theme}>
      <div className={styles.shell} style={{ ...accentStyle, ...tileAccentStyle }}>
        <DocumentationTopBar
          current="guide"
          trailing={
            <ThemeSettingsButton
              accent={accent}
              accentSecondary={accentSecondary}
              idPrefix="guide"
              theme={theme}
              themeLabel="Page theme"
              tileAccent={tileAccent}
              tileAccentSecondary={tileAccentSecondary}
              onAccentChange={setAccent}
              onAccentSecondaryChange={setAccentSecondary}
              onResetAccent={resetAccent}
              onResetTileAccent={resetTileAccent}
              onThemeChange={setTheme}
              onTileAccentChange={setTileAccent}
              onTileAccentSecondaryChange={setTileAccentSecondary}
            />
          }
        />
        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <nav aria-label="Guide pages">
              <ul className={styles.sidebarList}>
                {pages.map((page) => {
                  const href = guidePath(page.slug === "index" ? undefined : page.slug);
                  const isActive = pathname === href;

                  return (
                    <li key={page.slug}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={isActive ? styles.sidebarLinkActive : styles.sidebarLink}
                        href={href}
                      >
                        {page.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
          <main className={styles.content}>
            <DocumentationBreadcrumbs guidePages={pages} />
            {children}
          </main>
        </div>
      </div>
    </OpusThemeProvider>
  );
}
