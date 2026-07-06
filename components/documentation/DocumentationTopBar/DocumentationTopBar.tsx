"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import styles from "./TopBar.module.css";

type DocumentationNavProps = {
  current?: "home" | "components" | "guide";
};

export function DocumentationNav({ current }: DocumentationNavProps) {
  const pathname = usePathname();
  const active =
    current ??
    (pathname.startsWith("/documentation/components")
      ? "components"
      : pathname.startsWith("/documentation/guide")
        ? "guide"
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
    </nav>
  );
}

type DocumentationTopBarProps = {
  current: "home" | "components" | "guide";
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
        {trailing ? (
          <div className={styles.topBarTrailing}>
            {trailing}
          </div>
        ) : null}
      </div>
    </header>
  );
}
