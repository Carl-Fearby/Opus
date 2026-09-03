import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import styles from "./PlaygroundSection.module.css";

const highlights = [
  "Open any catalogue component with its generated JSX and current settings already loaded",
  "Give ChatGPT the current source, component context, selected theme, and live preview error",
  "Ask AI to explain, diagnose, adapt, or return corrected production-ready source",
  "Edit the answer and see the preview update immediately in the same workspace",
  "Use your own OpenAI API key instead of relying on a shared AI account",
];

export function PlaygroundSection() {
  return (
    <section className={styles.section} id="playground">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>AI-assisted Code Playground</p>
          <h2>Give ChatGPT the working component—not an empty prompt.</h2>
          <p>
            Open a catalogue example and ChatGPT can work from the generated JSX, your edits, the
            active theme, and any runtime preview error—all beside the live result.
          </p>

          <p className={styles.keyNote}>
            Bring your own OpenAI API key. It stays in your browser for Playground sessions, so you
            control the account and usage behind every request.
          </p>

          <ul className={styles.list}>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link className={styles.primary} href={docsPlaygroundUrl}>
              Open the Playground
            </Link>
            <Link className={styles.secondary} href={docsComponentsUrl}>
              Browse the catalogue
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
