import styles from "./ComponentCategories.module.css";

const categories = [
  {
    title: "Forms",
    count: "30+ controls",
    items: ["Text and password inputs", "Date, time, and colour pickers", "Multi-select and cascader", "Rich text and chip input"],
  },
  {
    title: "Overlays",
    count: "8 patterns",
    items: ["Dialog and modal", "Drawer and popover", "Toast notifications", "Command palette"],
  },
  {
    title: "Navigation",
    count: "6 layouts",
    items: ["Sidebar shell", "Top navigation", "Tabs and accordion", "Breadcrumbs and pagination"],
  },
  {
    title: "Data display",
    count: "Charts and widgets",
    items: ["Tables and data grid", "KPI and stat cards", "Gauges and sparklines", "Status indicators"],
  },
  {
    title: "Layout",
    count: "10 primitives",
    items: ["Columns and grid", "Splitter and dock layout", "Resizable panel", "Scroll area and container"],
  },
  {
    title: "Dashboard & Labs",
    count: "Compositions",
    items: ["User profile widget", "Pipeline and task widgets", "Recent activity lists", "Ready-made CRM rows"],
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
