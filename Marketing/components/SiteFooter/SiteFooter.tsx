import Image from "next/image";
import Link from "next/link";
import styles from "./SiteFooter.module.css";

const footerLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#components", label: "Components" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Image
            alt="Opus"
            className={styles.logo}
            height={36}
            src="/opus-logo.png"
            width={130}
          />
          <p>Design system and React component library for modern business applications.</p>
        </div>

        <div className={styles.links}>
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <a href="https://www.npmjs.com/package/opus-react" rel="noreferrer" target="_blank">
            npm
          </a>
        </div>
      </div>

      <div className={styles.legal}>
        <span>© {new Date().getFullYear()} Opus</span>
        <span>Marketing preview — content subject to review</span>
      </div>
    </footer>
  );
}
