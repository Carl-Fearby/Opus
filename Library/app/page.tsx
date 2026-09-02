import Link from "next/link";
import { DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page} data-theme="dark">
      <div className={styles.hero}>
        <Link className={styles.logoLink} href="/">
          <img alt="Opus" className={styles.logo} fetchPriority="high" src="/opus-logo.png" />
        </Link>
        <Link className={styles.link} href={DOCUMENTATION_BASE_PATH}>
          Enter documentation
        </Link>
      </div>
    </main>
  );
}
