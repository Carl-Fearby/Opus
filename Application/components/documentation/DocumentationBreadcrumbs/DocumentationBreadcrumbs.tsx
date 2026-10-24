"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "opus-react";
import { buildDocumentationBreadcrumbs } from "@/lib/documentation/breadcrumbs";
import styles from "./DocumentationBreadcrumbs.module.css";

type DocumentationBreadcrumbsProps = {
  className?: string;
  currentLabel?: string;
  guidePages?: { slug: string; title: string }[];
};

export function DocumentationBreadcrumbs({
  className,
  currentLabel,
  guidePages,
}: DocumentationBreadcrumbsProps) {
  const pathname = usePathname();
  const items = buildDocumentationBreadcrumbs(pathname, { currentLabel, guidePages });

  return (
    <div className={[styles.breadcrumbs, className].filter(Boolean).join(" ")}>
      <Breadcrumb items={items} />
    </div>
  );
}
