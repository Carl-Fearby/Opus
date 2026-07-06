"use client";

import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { componentPath } from "@/lib/controls/routes";
import docStyles from "@/components/documentation/DocumentationContent/documentation.module.css";
import styles from "../ControlDetail/ControlDetail.module.css";

function resolveComponentHref(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#")) {
    return href;
  }

  if (href.startsWith("/documentation/components/")) {
    return href;
  }

  if (href.startsWith("/")) {
    return href;
  }

  return href;
}

const markdownComponents: Components = {
  a: ({ href = "", children, ...props }) => {
    const resolved = resolveComponentHref(href);

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

type ComponentMarkdownProps = {
  className?: string;
  content: string;
};

export function ComponentMarkdown({ className, content }: ComponentMarkdownProps) {
  const normalized = content.replace(
    /\]\(\/documentation\/components\/([^)]+)\)/g,
    (_, slug: string) => `](${componentPath(slug)})`,
  );

  return (
    <div className={[docStyles.markdown, styles.componentDocsMarkdown, className].filter(Boolean).join(" ")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
