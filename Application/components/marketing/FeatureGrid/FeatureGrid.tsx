import styles from "./FeatureGrid.module.css";

const features = [
  {
    title: "Forms that feel finished",
    description:
      "Text inputs, pickers, multi-selects, cascaders, rich text, password strength, and more — all wrapped in a consistent field shell with labels, help, and errors.",
  },
  {
    title: "Design themes visually",
    description:
      "Use the Theme Designer to set light or dark mode, fonts, radius, surface treatments, primary/secondary/tertiary accents, and tile gradients. Switch every live preview between desktop and mobile, then copy provider-ready code into your app.",
  },
  {
    title: "Built for product teams",
    description:
      "Live previews, settings panels, generated usage code, and Open in Playground links make it easy to explore components before you commit them to a screen.",
  },
  {
    title: "Mapped component relationships",
    description:
      "The catalogue shows which public components are composed from others, making it easier to choose primitives, reuse patterns, and review dependency impact.",
  },
  {
    title: "Preview at real widths",
    description:
      "Raw previews include full width, desktop, tablet, mobile, and fixed canvas sizes so layout decisions can be checked before a component reaches an app.",
  },
  {
    title: "ChatGPT with real UI context",
    description:
      "Bring your own OpenAI API key. ChatGPT receives the current component source, generated example, theme, and preview errors so it can diagnose and reshape the UI without a lengthy setup prompt.",
  },
  {
    title: "Verified beyond a screenshot",
    description:
      "Interactive examples are exercised in a real browser for callbacks, navigation, value changes, visible state, and drag gestures. Presentational components receive explicit render coverage.",
  },
  {
    title: "Overlays and navigation",
    description:
      "Dialogs, drawers, modals, popovers, toasts, sidebars, and top navigation — composed to work together across complex application shells.",
  },
  {
    title: "Data-rich UI",
    description:
      "Tables, charts, KPI cards, gauges, sparklines, and status indicators for dashboards that need more than a form on a blank page.",
  },
  {
    title: "Auth happy path",
    description:
      "Login, register, Google and Apple continue, OTP, passkeys, forgot and reset password, check-email, verified, and expired-link screens — composed from the same field and button primitives as the rest of Opus.",
  },
  {
    title: "Application-ready labs",
    description:
      "CRM workspaces, authentication journeys, desktop environments, document managers, contact records, sales flows, maps, and media experiences — composed from the same published primitives.",
  },
  {
    title: "Published for real apps",
    description:
      "Install `opus-react` from npm, import the styles once, and drop components into Next.js, Vite, or any React 19 project.",
  },
];

export function FeatureGrid() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Why Opus</p>
          <h2>Everything you need to design, build, and ship consistent interfaces.</h2>
          <p>
            Opus is both a component library and a documented system. Use the primitives directly
            in production, or browse the catalogue to validate patterns before you wire them into your
            product.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.card}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
