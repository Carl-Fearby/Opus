import type { Metadata } from "next";
import Link from "next/link";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for teams adopting the Opus design system.",
};

const plans = [
  {
    name: "Starter",
    price: "Free",
    detail: "For exploration and prototypes",
    features: [
      "npm access to opus-react",
      "Light and dark themes",
      "Live documentation and Code Playground",
      "Open in Playground from every component page",
    ],
    cta: "Install from npm",
    href: "https://www.npmjs.com/package/opus-react",
    external: true,
    featured: false,
  },
  {
    name: "Team",
    price: "Custom",
    detail: "For product teams shipping Opus in production",
    features: [
      "Design system governance",
      "Implementation support",
      "Component rollout planning",
      "Priority review cycles",
    ],
    cta: "Talk to us",
    href: "mailto:hello@opus.design",
    external: false,
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "For organisations at scale",
    features: [
      "Multi-brand theming",
      "Security and compliance review",
      "Dedicated design system lead",
      "Training and onboarding",
    ],
    cta: "Contact sales",
    href: "mailto:hello@opus.design",
    external: false,
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Pricing</p>
        <h1>Start free. Scale with your team.</h1>
        <p>
          The component library is available on npm today. Team and enterprise plans are placeholders
          for review — adjust copy, tiers, and contact details before launch.
        </p>
      </section>

      <section className={styles.grid} aria-label="Pricing plans">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={styles.card}
            data-featured={plan.featured ? "true" : undefined}
          >
            <div className={styles.cardHead}>
              <h2>{plan.name}</h2>
              <p>{plan.detail}</p>
              <strong>{plan.price}</strong>
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {plan.external ? (
              <a
                className={styles.cta}
                href={plan.href}
                rel="noreferrer"
                target="_blank"
              >
                {plan.cta}
              </a>
            ) : (
              <Link className={styles.cta} href={plan.href}>
                {plan.cta}
              </Link>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
