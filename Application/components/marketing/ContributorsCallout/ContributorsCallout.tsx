import styles from "./ContributorsCallout.module.css";

const contributionAreas = [
  "Component design",
  "Accessibility",
  "Interaction testing",
  "Documentation",
  "Dashboard patterns",
  "Web and desktop apps",
];

export function ContributorsCallout() {
  return (
    <section className={styles.section} aria-labelledby="contributors-title" id="contributors">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Help build Opus</p>
          <h2 id="contributors-title">We’re looking for contributors.</h2>
          <p>
            Join us in building an accessible, dependable component system for modern business
            applications. Small fixes, focused components, tests, examples, and documentation are
            every bit as valuable as larger features.
          </p>
          <ul className={styles.areas} aria-label="Contribution areas">
            {contributionAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>

        <aside className={styles.contact} aria-label="Contributor contact details">
          <p>Interested in contributing?</p>
          <span>Tell us what you enjoy working on and where you would like to help.</span>
          <div className={styles.actions}>
            <a className={styles.primary} href="mailto:carlfearby@me.com?subject=Contributing%20to%20Opus">
              Email Carl
            </a>
            <a
              className={styles.secondary}
              href="https://wa.me/447940147138?text=Hi%20Carl%2C%20I%27m%20interested%20in%20contributing%20to%20Opus."
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
          </div>
          <small>
            <a href="mailto:carlfearby@me.com">carlfearby@me.com</a>
            <span aria-hidden="true"> · </span>
            <a href="https://wa.me/447940147138" rel="noreferrer" target="_blank">
              +44 7940 147138
            </a>
          </small>
        </aside>
      </div>
    </section>
  );
}
