import type { Metadata } from "next";
import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl, npmPackageUrl } from "@/lib/siteLinks";
import styles from "./opus-0-7.module.css";

export const metadata: Metadata = {
  title: "Opus 0.7 — Visual themes for real applications",
  description:
    "Meet the visual Theme Designer, global component defaults, responsive preview modes, and the new Search Box in the Opus 0.7 release.",
  alternates: { canonical: "/news/opus-0-7" },
  openGraph: {
    type: "article",
    title: "Opus 0.7 — Visual themes for real applications",
    description:
      "Meet the visual Theme Designer, global component defaults, responsive preview modes, and the new Search Box in the Opus 0.7 release.",
    url: "/news/opus-0-7",
    publishedTime: "2026-09-04T00:00:00.000Z",
  },
};

const highlights = [
  { title: "Visual Theme Designer", copy: "Build a complete application theme through a live canvas of cards, tiles, fields, dashboard widgets, and actions.", href: "/theme-designer" },
  { title: "Portable global tokens", copy: "Copy provider-ready code for colours, typography, radius, surface treatment, and gradients — with component-level overrides when you need them." },
  { title: "Responsive by design", copy: "Switch every preview between Desktop and Mobile to verify real constrained layouts before components reach your application." },
  { title: "Search Box", copy: "A unified search control with optional categories, an independent tertiary action colour, and a menu that stays within its viewport.", href: "/documentation/components/search-box" },
];

const componentExamples = [
  { name: "Search Box", href: "/documentation/components/search-box", code: `<SearchBox\n  categories={["All", "Documentation", "Components"]}\n  onSearch={({ query, category }) => search(query, category)}\n/>` },
];

export default function OpusZeroSevenNewsPage() {
  return (
    <article className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
        <Link href="/">Home</Link><span>/</span><Link href="/news">News</Link><span>/</span><span aria-current="page">Opus 0.7</span>
      </nav>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Product news · 4 September 2026</p>
        <p className={styles.kicker}>Opus 0.7</p>
        <h1>Design the system, then take it with you.</h1>
        <p className={styles.intro}>
          Opus 0.7 makes theming a visual workflow. Shape an application-wide system in the new
          Theme Designer, test it against real components, then copy the provider code into your
          own app.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={docsComponentsUrl}>Explore Opus components</Link>
          <a className={styles.secondary} href={npmPackageUrl} rel="noreferrer" target="_blank">
            Install opus-react 0.7.2
          </a>
        </div>
      </header>

      <section className={styles.statement}>
        <p>One shared visual language.</p>
        <p>Every component still has room to be itself.</p>
      </section>

      <section aria-label="Opus 0.7 highlights" className={styles.highlights}>
        {highlights.map(({ title, copy, href }, index) => (
          <div className={styles.highlight} key={title}>
            <span>0{index + 1}</span>
            <h2>{href ? <Link href={href}>{title}</Link> : title}</h2>
            <p>{copy}</p>
          </div>
        ))}
      </section>

      <section className={styles.detail}>
        <div>
          <p className={styles.eyebrow}>From visual choice to usable code</p>
          <h2>A theme is more than a colour picker.</h2>
        </div>
        <div className={styles.copy}>
          <p>
            The Theme Designer brings base, accent, secondary accent, tertiary accent, tile, and
            tile-secondary colours together with global radius, background treatment, font, and
            gradient defaults. The preview is deliberately broad, so every change is evaluated
            across common application surfaces rather than in isolation.
          </p>
          <p>
            The generated theme code is ready for <code>OpusThemeProvider</code>. Those global
            values establish a confident default, while individual components can still override
            them for the exceptional cases that make a product feel considered.
          </p>
        </div>
      </section>

      <section aria-label="Explore the components" className={styles.components}>
        <p className={styles.eyebrow}>Explore the component</p>
        {componentExamples.map((component) => (
          <Link className={styles.componentCard} href={component.href} key={component.name}>
            <span>{component.name}</span><small>Open component →</small>
            <pre><code>{component.code}</code></pre>
          </Link>
        ))}
      </section>

      <section className={styles.links}>
        <Link href={docsComponentsUrl}>Browse the component catalogue <span>→</span></Link>
        <Link href={docsPlaygroundUrl}>Try it in the Playground <span>→</span></Link>
        <Link href="/version">Read complete release notes <span>→</span></Link>
      </section>
    </article>
  );
}
