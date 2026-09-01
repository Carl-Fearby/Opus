import Link from "next/link";
import { categoryPath, componentPath } from "@/lib/controls/routes";
import styles from "./ProductDepth.module.css";

const pillars = [
  {
    eyebrow: "Foundation",
    title: "Start with the details users notice.",
    description:
      "Use fields, validation states, labels, help text, actions, and feedback patterns that behave as one system instead of a collection of one-off controls.",
    href: categoryPath("forms"),
    label: "Explore form components",
  },
  {
    eyebrow: "Data workflows",
    title: "Make dense information easier to act on.",
    description:
      "Build operational screens from tables, charts, metrics, filters, status signals, and responsive dashboard patterns that support real decisions.",
    href: categoryPath("dashboard"),
    label: "Explore dashboard components",
  },
  {
    eyebrow: "Application patterns",
    title: "Move beyond isolated component demos.",
    description:
      "Inspect complete workspace, desktop, authentication, CRM, media, and document experiences built by composing the same published primitives.",
    href: componentPath("lab-desktop-environment"),
    label: "Open the Desktop Environment lab",
  },
  {
    eyebrow: "Confidence",
    title: "Check the behaviour before it reaches your app.",
    description:
      "Tune live settings, inspect generated JSX, review component relationships, and test a component at the widths and themes your product needs.",
    href: componentPath("chat-bubble"),
    label: "Open an interactive component page",
  },
];

export function ProductDepth() {
  return (
    <section className={styles.section} aria-labelledby="product-depth-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Built for the work after the demo</p>
          <h2 id="product-depth-title">A system for complete product surfaces.</h2>
          <p>
            Opus brings the small interaction details, complex data views, and full application
            patterns into one documented component system—so teams can spend their time shaping the
            product instead of rebuilding its foundations.
          </p>
        </div>

        <div className={styles.grid}>
          {pillars.map((pillar) => (
            <article className={styles.card} key={pillar.title}>
              <p className={styles.cardEyebrow}>{pillar.eyebrow}</p>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <Link className={styles.link} href={pillar.href}>
                {pillar.label} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
