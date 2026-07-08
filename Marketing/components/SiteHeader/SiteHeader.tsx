import Image from "next/image";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#components", label: "Components" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <Image
            alt="Opus"
            className={styles.logo}
            height={44}
            priority
            src="/opus-logo.png"
            width={158}
          />
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} className={styles.navLink} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link className={styles.ghost} href="/#components">
            View library
          </Link>
          <Link className={styles.primary} href="/pricing">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
