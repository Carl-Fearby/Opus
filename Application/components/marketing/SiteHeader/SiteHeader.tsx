import Image from "next/image";
import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import styles from "./SiteHeader.module.css";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#playground", label: "Playground" },
  { href: "/#components", label: "Components" },
  { href: docsComponentsUrl, label: "Component catalog" },
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
            height={56}
            priority
            src="/opus-logo.png"
            width={200}
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
          <Link className={styles.ghost} href={docsPlaygroundUrl}>
            Open Playground
          </Link>
          <Link className={styles.primary} href="/pricing">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
