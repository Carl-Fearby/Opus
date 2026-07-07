"use client";

import styles from "../ControlDetail/ControlDetail.module.css";
import { ComponentMarkdown } from "./ComponentMarkdown";

type ComponentDocumentationProps = {
  content: string;
};

export function ComponentDocumentation({ content }: ComponentDocumentationProps) {
  return (
    <section aria-labelledby="component-docs-heading" className={`${styles.panel} ${styles.docsPanel}`}>
      <div className="opus-panel-heading">
        <h2 className="opus-panel-title" id="component-docs-heading">
          Documentation
        </h2>
      </div>
      <ComponentMarkdown content={content} />
    </section>
  );
}
