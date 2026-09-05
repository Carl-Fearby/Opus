import type { Metadata } from "next";
import Link from "next/link";
import styles from "./why-opus.module.css";

export const metadata: Metadata = {
  title: "Why Opus",
  description:
    "A note from Carl Fearby on why Opus is free, open source, and built in public: to share useful work, welcome thoughtful feedback, and take part in the wider web community.",
  alternates: { canonical: "/why-opus" },
};

export default function WhyOpusPage() {
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>A personal note from Carl Fearby</p>
        <h1>Why Opus exists.</h1>
        <p>
          After 30 years of making things for the web, I wanted to make something I could finally
          stand behind in public: useful work that can be used, questioned, improved, and kept
          alive by more than the team that first made it.
        </p>
      </header>

      <div className={styles.rule} />

      <div className={styles.body}>
        <section>
          <h2>I wanted to make something that has a public life.</h2>
          <p>
            I have spent most of my career making work for private products and teams. There has
            been a lot of good work in that time, but very little I could point to and say: this is
            mine, this is what I care about, and this is here for anyone to see. It has lived where
            it needed to live, then moved on, changed, or disappeared.
          </p>
          <p>
            Opus is my way of bringing the practical lessons from that work into the open: the
            details that make interfaces clearer, more dependable, and more considerate for the
            people using them. It is also a chance to make something that can outlast a project
            deadline and have a life beyond the room where it began.
          </p>
        </section>

        <section>
          <h2>This is my way of giving something back.</h2>
          <p>
            I have spent a long time close to the web community, but not really inside it. I have
            watched great people share their work, answer questions, and make things easier for
            people they will never meet. I would like to take part in that more honestly.
          </p>
          <p>
            I am not building Opus as a commercial product. It is free, open source, and
            not-for-profit: no paid plans, hosted service, or commercial support tier. I simply
            want to put something useful into the shared space we all work in.
          </p>
        </section>

        <section>
          <h2>I do not want to make it alone.</h2>
          <p>
            I hope people use Opus. I also hope they disagree with parts of it, spot the things I
            have missed, and tell me how it could be better. That is not a disclaimer—it is the
            point. A useful library becomes more than its author when other people are willing to
            test it, challenge it, and add their own experience.
          </p>
          <p>
            Whether you use a component, open an issue, suggest an improvement, or share an idea,
            I would genuinely like to hear from you. I do not know exactly where Opus will lead,
            but I would like it to be part of a real conversation rather than another piece of work
            left unseen.
          </p>
        </section>

        <aside className={styles.invitation}>
          <p>Take part.</p>
          <span>Use Opus in a project, explore the catalogue, or help shape what it becomes.</span>
          <div>
            <Link href="/documentation/components">Explore components</Link>
            <a href="https://github.com/Carl-Fearby/Opus" rel="noreferrer" target="_blank">
              Join the conversation on GitHub
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
