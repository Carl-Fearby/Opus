import styles from "./FeatureGrid.module.css";

const features = [
  {
    title: "Forms that feel finished",
    description:
      "Text inputs, pickers, multi-selects, cascaders, rich text, password strength, and more — all wrapped in a consistent field shell with labels, help, and errors.",
  },
  {
    title: "Themeable from day one",
    description:
      "Light and dark modes ship out of the box. Accent colours can be changed at runtime without rebuilding your theme tokens.",
  },
  {
    title: "Built for product teams",
    description:
      "Interactive documentation, live previews, and settings panels make it easy to explore components before you commit them to a screen.",
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
            in production, or browse the catalog to validate patterns before you wire them into your
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
