"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { DOCUMENTATION_BASE_PATH, PLAYGROUND_BASE_PATH } from "@/lib/documentation/routes";
import {
  resolveComponentsHref,
  resolveComponentsHrefFromLocation,
  resolvePlaygroundHref,
  resolvePlaygroundHrefFromLocation,
} from "@/lib/playground/playgroundNavigation";
import { libraryVersion } from "@/lib/documentation/libraryVersion";
import styles from "./TopBar.module.css";

type DocumentationNavProps = {
  current?: "home" | "components" | "guide" | "playground" | "version";
};

function ComponentsNavLink({ isActive }: { isActive: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const href = useMemo(() => resolveComponentsHrefFromLocation(pathname, null), [pathname]);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={isActive ? styles.navLinkActive : styles.navLink}
      href={href}
      onClick={(event) => {
        const category = new URLSearchParams(window.location.search).get("category");
        const nextHref = resolveComponentsHref(pathname, category);
        if (nextHref !== href) {
          event.preventDefault();
          router.push(nextHref);
        }
      }}
    >
      Components
    </Link>
  );
}

function PlaygroundNavLink({ isActive }: { isActive: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const href = useMemo(() => resolvePlaygroundHrefFromLocation(pathname, null), [pathname]);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={isActive ? styles.navLinkActive : styles.navLink}
      href={href}
      onClick={(event) => {
        const category = new URLSearchParams(window.location.search).get("category");
        const nextHref = resolvePlaygroundHref(pathname, category);
        if (nextHref !== href) {
          event.preventDefault();
          router.push(nextHref);
        }
      }}
    >
      Playground
    </Link>
  );
}

export function DocumentationNav({ current }: DocumentationNavProps) {
  const pathname = usePathname();
  const active =
    current ??
    (pathname.startsWith("/documentation/components")
      ? "components"
      : pathname.startsWith("/documentation/guide")
        ? "guide"
        : pathname.startsWith(PLAYGROUND_BASE_PATH)
          ? "playground"
          : pathname.startsWith("/documentation/version")
          ? "version"
          : pathname === DOCUMENTATION_BASE_PATH
            ? "home"
            : undefined);

  return (
    <nav aria-label="Documentation" className={styles.nav}>
      <Link
        aria-current={active === "home" ? "page" : undefined}
        className={active === "home" ? styles.navLinkActive : styles.navLink}
        href={DOCUMENTATION_BASE_PATH}
      >
        Home
      </Link>
      <Link
        aria-current={active === "guide" ? "page" : undefined}
        className={active === "guide" ? styles.navLinkActive : styles.navLink}
        href="/documentation/guide"
      >
        Guide
      </Link>
      <ComponentsNavLink isActive={active === "components"} />
      <PlaygroundNavLink isActive={active === "playground"} />
      <Link
        aria-current={active === "version" ? "page" : undefined}
        className={active === "version" ? styles.navLinkActive : styles.navLink}
        href="/documentation/version"
      >
        Version
      </Link>
    </nav>
  );
}

type DocumentationTopBarProps = {
  current: "home" | "components" | "guide" | "playground" | "version";
  trailing?: ReactNode;
};

export function DocumentationTopBar({ current, trailing }: DocumentationTopBarProps) {
  return (
    <header className={styles.topBar} data-shell-theme="dark">
      <div className={styles.topBarRow}>
        <div className={styles.topBarStart}>
          <Link className={styles.logoLink} href="/">
            <Image
              alt="Opus"
              className={styles.logo}
              height={56}
              priority
              src="/opus-logo.png"
              width={200}
            />
          </Link>
          <DocumentationNav current={current} />
        </div>
        <div className={styles.topBarTrailing}>
          <Link
            className={styles.versionBadge}
            href="/documentation/version"
            title="View library version history"
          >
            opus-react v{libraryVersion}
          </Link>
          {trailing}
        </div>
      </div>
    </header>
  );
}
