import Image from "next/image";
import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl, npmPackageUrl } from "@/lib/siteLinks";
import styles from "./SiteFooter.module.css";

const footerLinks = [
  { href: "/#features", label: "Features", external: false },
  { href: "/#playground", label: "Playground", external: false },
  { href: "/#components", label: "Components", external: false },
  { href: docsComponentsUrl, label: "Component catalog", external: false },
  { href: docsPlaygroundUrl, label: "Code Playground", external: false },
  { href: "/pricing", label: "Pricing", external: false },
  { href: npmPackageUrl, label: "npm", external: true },
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
          {footerLinks.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} rel="noreferrer" target="_blank">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ),
          )}
        </div>
      </div>

      <div className={styles.legal}>
        <span>© {new Date().getFullYear()} Opus</span>
      </div>
    </footer>
  );
}
