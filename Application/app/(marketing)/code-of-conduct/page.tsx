import type { Metadata } from "next";
import styles from "./code-of-conduct.module.css";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "The Contributor Covenant Code of Conduct for the Opus open-source community.",
};

export default function CodeOfConductPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Open source community</p>
        <h1>Code of Conduct</h1>
        <p>
          Opus follows the Contributor Covenant so everyone can participate in a welcoming,
          respectful, and productive community.
        </p>
      </header>

      <article className={styles.document}>
        <section>
          <h2>Our Pledge</h2>
          <p>
            We as members, contributors, and leaders pledge to make participation in our
            community a harassment-free experience for everyone, regardless of age, body size,
            visible or invisible disability, ethnicity, sex characteristics, gender identity and
            expression, level of experience, education, socio-economic status, nationality,
            personal appearance, race, caste, colour, religion, or sexual identity and
            orientation.
          </p>
          <p>
            We pledge to act and interact in ways that contribute to an open, welcoming, diverse,
            inclusive, and healthy community.
          </p>
        </section>

        <section>
          <h2>Our Standards</h2>
          <p>Examples of behaviour that contributes to a positive environment include:</p>
          <ul>
            <li>Demonstrating empathy and kindness toward other people</li>
            <li>Being respectful of differing opinions, viewpoints, and experiences</li>
            <li>Giving and gracefully accepting constructive feedback</li>
            <li>
              Accepting responsibility, apologising to those affected by our mistakes, and
              learning from the experience
            </li>
            <li>Focusing on what is best for the overall community</li>
          </ul>
          <p>Examples of unacceptable behaviour include:</p>
          <ul>
            <li>
              The use of sexualised language or imagery, and sexual attention or advances of any
              kind
            </li>
            <li>Trolling, insulting or derogatory comments, and personal or political attacks</li>
            <li>Public or private harassment</li>
            <li>
              Publishing another person&apos;s private information without their explicit permission
            </li>
            <li>
              Other conduct which could reasonably be considered inappropriate in a professional
              setting
            </li>
          </ul>
        </section>

        <section>
          <h2>Enforcement Responsibilities</h2>
          <p>
            Community leaders are responsible for clarifying and enforcing our standards of
            acceptable behaviour and will take appropriate and fair corrective action in response
            to behaviour they deem inappropriate, threatening, offensive, or harmful.
          </p>
          <p>
            Community leaders may remove, edit, or reject comments, commits, code, wiki edits,
            issues, and other contributions that are not aligned with this Code of Conduct, and
            will communicate reasons for moderation decisions when appropriate.
          </p>
        </section>

        <section>
          <h2>Scope</h2>
          <p>
            This Code of Conduct applies within all community spaces and when an individual is
            officially representing the community in public spaces, including through an official
            email address, social account, or appointed role at an online or offline event.
          </p>
        </section>

        <section>
          <h2>Enforcement</h2>
          <p>
            Instances of abusive, harassing, or otherwise unacceptable behaviour may be reported
            to the project maintainer at {" "}
            <a href="mailto:carlfearby@me.com">carlfearby@me.com</a>. All complaints will be
            reviewed and investigated promptly and fairly. Community leaders will respect the
            privacy and security of anyone reporting an incident.
          </p>
        </section>

        <section>
          <h2>Enforcement Guidelines</h2>
          <div className={styles.guidelines}>
            <div>
              <h3>1. Correction</h3>
              <p>
                A private written warning that explains the violation and why the behaviour was
                inappropriate. A public apology may be requested.
              </p>
            </div>
            <div>
              <h3>2. Warning</h3>
              <p>
                A warning with consequences for continued behaviour and, where appropriate, a
                defined period without interaction with the people involved.
              </p>
            </div>
            <div>
              <h3>3. Temporary Ban</h3>
              <p>
                A temporary ban from interaction or public communication with the community for a
                specified period of time.
              </p>
            </div>
            <div>
              <h3>4. Permanent Ban</h3>
              <p>
                A permanent ban from public interaction within the community following severe or
                sustained violations.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>Attribution</h2>
          <p>
            This Code of Conduct is adapted from the {" "}
            <a
              href="https://www.contributor-covenant.org/version/2/1/code_of_conduct.html"
              rel="noreferrer"
              target="_blank"
            >
              Contributor Covenant, version 2.1
            </a>
            . Community Impact Guidelines were inspired by {" "}
            <a
              href="https://github.com/mozilla/diversity"
              rel="noreferrer"
              target="_blank"
            >
              Mozilla&apos;s code of conduct enforcement ladder
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
