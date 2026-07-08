import Image from "next/image";
import Link from "next/link";
import { DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <Link className={styles.logoLink} href="/">
          <Image
            alt="Opus"
            className={styles.logo}
            height={280}
            priority
            src="/opus-logo.png"
            width={840}
          />
        </Link>
        <Link className={styles.link} href={DOCUMENTATION_BASE_PATH}>
          Enter documentation
        </Link>
      </div>
    </main>
  );
}
