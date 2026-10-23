"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildDocumentationBreadcrumbs } from "@/lib/documentation/breadcrumbs";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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
  const { locale } = useLocale();
  const items = buildDocumentationBreadcrumbs(pathname, { currentLabel, guidePages, locale });

  return (
    <div className={[styles.breadcrumbs, className].filter(Boolean).join(" ")}>
      <Breadcrumb items={items} />
    </div>
  );
}
