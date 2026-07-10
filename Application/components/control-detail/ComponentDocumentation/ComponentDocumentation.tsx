"use client";

import styles from "../ControlDetail/ControlDetail.module.css";
import { ComponentMarkdown, prepareComponentDocumentation } from "./ComponentMarkdown";

type ComponentDocumentationProps = {
  content: string;
};

export function ComponentDocumentation({ content }: ComponentDocumentationProps) {
  const prepared = prepareComponentDocumentation(content);

  if (!prepared) {
    return null;
  }

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
