import styles from "./ComponentCategories.module.css";

const categories = [
  {
    title: "Forms",
    count: "30+ controls",
    items: ["Text & password inputs", "Date and time pickers", "Multi-select & cascader", "Rich text editor"],
  },
  {
    title: "Overlays",
    count: "8 patterns",
    items: ["Dialog & modal", "Drawer & popover", "Toast notifications", "Command palette"],
  },
  {
    title: "Navigation",
    count: "4 layouts",
    items: ["Sidebar shell", "Top navigation", "Tabs & accordion", "Breadcrumbs-ready structure"],
  },
  {
    title: "Data display",
    count: "Charts & widgets",
    items: ["Tables & empty states", "KPI and stat cards", "Gauges & sparklines", "Status indicators"],
  },
];

export function ComponentCategories() {
  return (
    <section className={styles.section} id="components">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Component library</p>
          <h2>From first input to full application shell.</h2>
          <p>
            Opus groups components by the jobs they do in real products — so your team can find the
            right primitive quickly and compose screens without reinventing spacing, states, or
            accessibility patterns.
          </p>
        </div>

        <div className={styles.grid}>
          {categories.map((category) => (
            <article key={category.title} className={styles.card}>
              <div className={styles.cardHead}>
                <h3>{category.title}</h3>
                <span>{category.count}</span>
              </div>
              <ul>
                {category.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
