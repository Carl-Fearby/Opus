import type { Metadata } from "next";
import Link from "next/link";
import { newsStories } from "./stories";
import styles from "./news.module.css";

export const metadata: Metadata = {
  title: "News",
  description: "Stories from Opus: product releases, library milestones, and the thinking behind the system.",
};

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

export default function NewsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Opus journal</p>
        <h1>The story behind the system.</h1>
        <p>Product releases, design decisions, and the work of making a component library feel ready for real applications.</p>
      </header>
      <section aria-label="News stories" className={styles.list}>
        {newsStories.map((story, index) => (
          <Link className={styles.card} href={`/news/${story.slug}`} key={story.slug}>
            <div className={styles.meta}><span>{story.edition}</span><time dateTime={story.date}>{dateLabel(story.date)}</time></div>
            <p className={styles.number}>0{index + 1}</p>
            <h2>{story.title}</h2>
            <p>{story.standfirst}</p>
            <span className={styles.read}>Read story <span>→</span></span>
          </Link>
        ))}
      </section>
    </div>
  );
}
