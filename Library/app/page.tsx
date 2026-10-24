import Image from "next/image";
import Link from "next/link";
import { DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./page.module.css";

export default async function Home() {
  const locale = await readServerLocale();

  return (
    <main className={styles.page} data-theme="dark">
      <div className={styles.hero}>
        <Link className={styles.logoLink} href="/">
          <Image
            alt="Opus"
            className={styles.logo}
            height={360}
            priority
            sizes="min(94vw, 820px)"
            src="/opus-logo.png"
            width={1024}
          />
        </Link>
        <Link className={styles.link} href={DOCUMENTATION_BASE_PATH}>
          {translate(locale, "docs.home.enter")}
        </Link>
      </div>
    </main>
  );
}
