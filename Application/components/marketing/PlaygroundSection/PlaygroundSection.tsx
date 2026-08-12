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
            Most AI coding chats begin by making you explain the component, paste its source, and
            describe what went wrong. Opus already has that context. Open a catalogue example and
            ChatGPT can work from the generated JSX, your edits, the active component and theme, and
            any runtime preview error—all beside the live result.
          </p>

          <p className={styles.keyNote}>
            Bring your own OpenAI API key. It is saved in your browser for your Playground sessions,
            giving you control of the account and usage behind every request.
          </p>

          <ul className={styles.list}>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link className={styles.primary} href={docsPlaygroundUrl}>
              Try the AI Playground
            </Link>
            <Link className={styles.secondary} href={docsComponentsUrl}>
              Component catalogue
            </Link>
          </div>
        </div>

        <div className={styles.mock} aria-hidden="true">
          <div className={styles.mockTop}>
            <span />
            <span />
            <span />
            <span className={styles.mockTab} data-active="true">
              AI Playground
            </span>
          </div>
          <div className={styles.mockBody}>
            <div className={styles.mockPane}>
              <div className={styles.mockPaneLabel}>Source</div>
              <div className={styles.mockCode}>
                <span />
                <span />
                <span data-accent="true" />
                <span />
                <span />
              </div>
            </div>
            <div className={styles.mockHandle} />
            <div className={`${styles.mockPane} ${styles.mockChatPane}`}>
              <div className={styles.mockPaneLabel}>ChatGPT</div>
              <div className={styles.mockChat}>
                <div className={styles.mockUserMessage}>Adapt this contact card for account owners.</div>
                <div className={styles.mockAssistantMessage}>
                  I’ll preserve the Opus components and update the data, actions, and responsive layout.
                </div>
                <div className={styles.mockPrompt}>Ask about this source…</div>
              </div>
            </div>
            <div className={styles.mockHandle} />
            <div className={styles.mockPane}>
              <div className={styles.mockPaneLabel}>Preview</div>
              <div className={styles.mockPreview}>
                <div className={styles.mockAvatar} />
                <div className={styles.mockProfile}>
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
