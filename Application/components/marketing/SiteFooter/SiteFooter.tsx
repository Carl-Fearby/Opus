import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl, npmPackageUrl } from "@/lib/siteLinks";
import styles from "./SiteFooter.module.css";

const footerLinks = [
  { href: "/#features", label: "Features", external: false },
  { href: "/#playground", label: "Playground", external: false },
  { href: "/#components", label: "Components", external: false },
  { href: "/#contributors", label: "Contribute", external: false },
  { href: docsComponentsUrl, label: "Component catalogue", external: false },
  { href: docsPlaygroundUrl, label: "Code Playground", external: false },
  { href: "/code-of-conduct", label: "Code of Conduct", external: false },
  { href: "/license", label: "MIT License", external: false },
  { href: npmPackageUrl, label: "npm", external: true },
  { href: "https://github.com/Carl-Fearby/Opus", label: "GitHub", external: true },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <img alt="Opus" className={styles.logo} src="/opus-logo.png" />
          <p>
            Open-source design system and React component library for modern business
            applications. No paid plans, commercial support, or hosted service.
          </p>
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
        <a className={styles.netlifyLink} href="https://www.netlify.com/" rel="noreferrer" target="_blank">
          This site is powered by Netlify
        </a>
      </div>
    </footer>
  );
}
