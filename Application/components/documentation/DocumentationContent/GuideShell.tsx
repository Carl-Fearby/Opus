"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { AccentColorPicker, useAccentPreference } from "opus-react";
import { ThemeToggleField } from "opus-react";
import { OpusThemeProvider } from "opus-react";
import type { Theme } from "opus-react";
import type { GuidePage } from "@/lib/documentation/content";
import { guidePath } from "@/lib/documentation/routes";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import styles from "./documentation.module.css";

const THEME_STORAGE_KEY = "opus-components-theme";

type GuideShellProps = {
  children: ReactNode;
  pages: GuidePage[];
};

export function GuideShell({ children, pages }: GuideShellProps) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>("dark");
  const { accent, accentStyle, setAccent } = useAccentPreference();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  return (
    <OpusThemeProvider theme={theme}>
      <div className={styles.shell} data-theme={theme} style={accentStyle}>
        <DocumentationTopBar
          current="guide"
          trailing={
            <>
              <AccentColorPicker
                id="guide-accent-picker"
                value={accent}
                onChange={setAccent}
              />
              <ThemeToggleField
                id="guide-theme-toggle"
                label="Theme"
                labelPosition="left"
                mode="flagged"
                value={theme}
                onChange={setTheme}
              />
            </>
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
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </OpusThemeProvider>
  );
}
