"use client";

import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { guidePath } from "@/lib/documentation/routes";
import styles from "./documentation.module.css";

function resolveGuideHref(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#")) {
    return href;
  }

  if (href.startsWith("/")) {
    return href;
  }

  const normalized = href
    .replace(/^\.\//, "")
    .replace(/\.md$/, "")
    .replace(/\/README$/, "");

  if (normalized === "README" || normalized === "index") {
    return guidePath();
  }

  return guidePath(normalized);
}

const markdownComponents: Components = {
  a: ({ href = "", children, ...props }) => {
    const resolved = resolveGuideHref(href);

    if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
      return (
        <a href={resolved} rel="noreferrer" target="_blank" {...props}>
          {children}
        </a>
      );
    }

    return (
      <Link href={resolved} {...props}>
        {children}
      </Link>
    );
  },
};

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
