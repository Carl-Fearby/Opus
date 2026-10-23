import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl, npmPackageUrl } from "@/lib/siteLinks";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const footerLinks = [
    { href: "/#features", label: t("site.footer.features"), external: false },
    { href: "/#playground", label: t("site.footer.playground"), external: false },
    { href: "/#components", label: t("site.footer.components"), external: false },
    { href: "/why-opus", label: t("site.footer.whyOpus"), external: false },
    { href: "/#contributors", label: t("site.footer.contribute"), external: false },
    { href: docsComponentsUrl, label: t("site.footer.catalogue"), external: false },
    { href: docsPlaygroundUrl, label: t("site.footer.codePlayground"), external: false },
    { href: "/version", label: t("site.footer.releaseNotes"), external: false },
    { href: "/code-of-conduct", label: t("site.footer.codeOfConduct"), external: false },
    { href: "/license", label: t("site.footer.license"), external: false },
    { href: npmPackageUrl, label: "npm", external: true },
    { href: "https://github.com/Carl-Fearby/Opus", label: "GitHub", external: true },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <img alt="Opus" className={styles.logo} src="/opus-logo.png" />
          <p>{t("site.footer.description")}</p>
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
          {t("site.footer.poweredBy")}
        </a>
      </div>
    </footer>
  );
}
