import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl, docsUrl } from "@/lib/siteLinks";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import { LanguagePicker } from "@/components/LanguagePicker";
import styles from "./SiteHeader.module.css";

export async function SiteHeader() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const navLinks = [
    { href: "/#features", label: t("site.nav.features") },
    { href: "/why-opus", label: t("site.nav.whyOpus") },
    { href: "/news", label: t("site.nav.news") },
    { href: docsUrl, label: t("site.nav.docs") },
    { href: "/version", label: t("site.nav.versions") },
    { href: docsPlaygroundUrl, label: t("site.nav.playground") },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <img alt="Opus" className={styles.logo} fetchPriority="high" src="/opus-logo.png" />
        </Link>

        <nav aria-label={t("site.nav.primary")} className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} className={styles.navLink} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguagePicker compact />
          <Link className={styles.primary} href={docsComponentsUrl}>
            {t("site.nav.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
