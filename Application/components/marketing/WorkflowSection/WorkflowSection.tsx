import styles from "./WorkflowSection.module.css";

const steps = [
  {
    step: "01",
    title: "Install the package",
    description: "Add `opus-react` to your app and import the base styles once in your root layout.",
  },
  {
    step: "02",
    title: "Wrap with theme context",
    description: "Use `OpusThemeProvider` to enable light or dark mode and runtime accent colours.",
  },
  {
    step: "03",
    title: "Compose screens",
    description: "Drop in field components, overlays, and layout primitives with consistent spacing and states.",
  },
  {
    step: "04",
    title: "Experiment in the Playground",
    description:
      "Open any component page, tune settings, then click Open in Playground to edit the generated JSX and preview it live before you paste it into your app.",
  },
];

export function WorkflowSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Workflow</p>
          <h2>From npm install to production UI in four steps.</h2>
        </div>

        <div className={styles.steps}>
          {steps.map((item) => (
            <article key={item.step} className={styles.step}>
              <span className={styles.stepNumber}>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
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
