"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import opusReactPackage from "opus-react/package.json";
import { DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import styles from "./TopBar.module.css";

const LIBRARY_VERSION = opusReactPackage.version;

type DocumentationNavProps = {
  current?: "home" | "components" | "guide" | "version";
};

export function DocumentationNav({ current }: DocumentationNavProps) {
  const pathname = usePathname();
  const active =
    current ??
    (pathname.startsWith("/documentation/components")
      ? "components"
      : pathname.startsWith("/documentation/guide")
        ? "guide"
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
      <Link
        aria-current={active === "components" ? "page" : undefined}
        className={active === "components" ? styles.navLinkActive : styles.navLink}
        href="/documentation/components"
      >
        Components
      </Link>
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
  current: "home" | "components" | "guide" | "version";
  trailing?: ReactNode;
};

export function DocumentationTopBar({ current, trailing }: DocumentationTopBarProps) {
  return (
    <header className={styles.topBar}>
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
            opus-react v{LIBRARY_VERSION}
          </Link>
          {trailing}
        </div>
      </div>
    </header>
  );
}
