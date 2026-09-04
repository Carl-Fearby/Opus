import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { newsStories, storyBySlug } from "../stories";
import styles from "./story.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return newsStories.filter((story) => story.slug !== "opus-0-7").map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = storyBySlug.get((await params).slug);
  return story
    ? {
        title: story.title,
        description: story.standfirst,
        alternates: { canonical: `/news/${story.slug}` },
        openGraph: {
          type: "article",
          title: story.title,
          description: story.standfirst,
          url: `/news/${story.slug}`,
          publishedTime: `${story.date}T00:00:00.000Z`,
        },
      }
    : {};
}

export default async function StoryPage({ params }: Props) {
  const story = storyBySlug.get((await params).slug);
  if (!story || story.slug === "opus-0-7") notFound();
  return (
    <article className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
        <Link href="/">Home</Link><span>/</span><Link href="/news">News</Link><span>/</span><span aria-current="page">{story.edition}</span>
      </nav>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{story.edition} · {story.date}</p>
        <h1>{story.title}</h1>
        <p>{story.standfirst}</p>
      </header>
      <div className={styles.rule} />
      <div className={styles.body}>
        <p className={styles.summary}>{story.summary}</p>
        {story.components?.length ? (
          <section aria-label="Explore the components" className={styles.components}>
            <p>Explore the components</p>
            <div>
              {story.components.map((component) => (
                <Link className={styles.componentCard} href={component.href} key={component.name}>
                  <span>{component.name}</span>
                  <small>Open component →</small>
                  <pre><code>{component.code}</code></pre>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        {story.chapters.map((chapter, index) => <section key={chapter.heading}><span>0{index + 1}</span><h2>{chapter.heading}</h2><p>{chapter.body}</p></section>)}
      </div>
      <Link className={styles.back} href="/news">← All stories</Link>
    </article>
  );
}
