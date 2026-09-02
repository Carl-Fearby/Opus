import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import styles from "./SiteHeader.module.css";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: docsPlaygroundUrl, label: "Playground" },
  { href: "/code-of-conduct", label: "Code of Conduct" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <img alt="Opus" className={styles.logo} src="/opus-logo.png" />
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} className={styles.navLink} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link className={styles.primary} href={docsComponentsUrl}>
            Components
          </Link>
        </div>
      </div>
    </header>
  );
}
