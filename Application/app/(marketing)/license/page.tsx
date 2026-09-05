import type { Metadata } from "next";
import styles from "./license.module.css";

export const metadata: Metadata = {
  title: "MIT License",
  description: "The OSI-approved MIT License governing the Opus open-source project.",
  alternates: { canonical: "/license" },
};

export default function LicensePage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Open source</p>
        <h1>MIT License</h1>
        <p>
          Opus is released under the OSI-approved MIT License. The canonical licence is also
          available in the project repository.
        </p>
      </header>

      <article className={styles.document}>
        <p>Copyright © 2026 Carl Fearby</p>
        <p>
          Permission is hereby granted, free of charge, to any person obtaining a copy of this
          software and associated documentation files (the “Software”), to deal in the Software
          without restriction, including without limitation the rights to use, copy, modify,
          merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
          persons to whom the Software is furnished to do so, subject to the following conditions:
        </p>
        <p>
          The above copyright notice and this permission notice shall be included in all copies or
          substantial portions of the Software.
        </p>
        <p>
          THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
          INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
          FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
          OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
          DEALINGS IN THE SOFTWARE.
        </p>
        <p>
          <a
            href="https://github.com/Carl-Fearby/Opus/blob/main/LICENSE"
            rel="noreferrer"
            target="_blank"
          >
            View the canonical licence on GitHub
          </a>
        </p>
      </article>
    </div>
  );
}
