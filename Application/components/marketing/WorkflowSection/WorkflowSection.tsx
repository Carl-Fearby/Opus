import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./WorkflowSection.module.css";

const stepNumbers = [1, 2, 3, 4] as const;

export async function WorkflowSection() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t("marketing.workflow.eyebrow")}</p>
          <h2>{t("marketing.workflow.title")}</h2>
        </div>

        <div className={styles.steps}>
          {stepNumbers.map((number) => (
            <article key={number} className={styles.step}>
              <span className={styles.stepNumber}>{String(number).padStart(2, "0")}</span>
              <h3>{t(`marketing.workflow.step${number}.title` as Parameters<typeof translate>[1])}</h3>
              <p>{t(`marketing.workflow.step${number}.description` as Parameters<typeof translate>[1])}</p>
            </article>
          ))}
        </div>

        <pre className={styles.code}>
          <code>{`import "opus-react/styles.css";
import "opus-react/index.css";
import { OpusThemeProvider, Button, TextField } from "opus-react";

export function App() {
  return (
    <OpusThemeProvider theme="dark">
      <TextField label="Company" placeholder="Acme Ltd" />
      <Button variant="primary">Continue</Button>
    </OpusThemeProvider>
  );
}`}</code>
        </pre>
      </div>
    </section>
  );
}
