import Link from "next/link";
import { categoryPath, componentPath } from "@/lib/controls/routes";
import styles from "./SeoFAQ.module.css";

const questions = [
  {
    question: "What is Opus?",
    answer:
      "Opus is a React component library and documented design system for modern business applications. It combines production components, live previews, generated usage examples, and complete application patterns.",
  },
  {
    question: "Can I use Opus with an existing React application?",
    answer:
      "Yes. Install the published opus-react package, import the stylesheet once, and compose the components in Next.js, Vite, or another React application. The catalogue provides the public API and working examples for each component.",
  },
  {
    question: "Does Opus support light and dark themes?",
    answer:
      "Yes. Opus supports light and dark presentation modes, runtime accent colours, and responsive previews so teams can check a component in the visual contexts their product needs.",
  },
  {
    question: "Are there components for data-heavy business applications?",
    answer:
      "Yes. Opus includes dashboard, chart, table, status, filtering, form, overlay, navigation, and workspace patterns designed for operational products—not just landing pages.",
  },
  {
    question: "How can I evaluate a component before adding it to my product?",
    answer:
      "Open its catalogue page to adjust settings, inspect generated JSX, explore relationships, and move the example into the Playground. The Playground can also use your own OpenAI API key for context-aware UI help.",
  },
];

export function SeoFAQ() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Questions, answered</p>
          <h2 id="faq-title">A component library that meets teams where they build.</h2>
          <p>
            Browse the <Link href={categoryPath("forms")}>form system</Link>, explore
            <Link href={categoryPath("dashboard")}> data-rich UI</Link>, or start with the
            <Link href={componentPath("lab-desktop-environment")}> Desktop Environment lab</Link>.
          </p>
        </div>
        <dl className={styles.list}>
          {questions.map((item) => (
            <div className={styles.item} key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
