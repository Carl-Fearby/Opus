"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ControlPreview } from "@/components/control-detail/ControlDetail/ControlPreview";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { getControl } from "@/lib/controls/registry";
import { componentPath } from "@/lib/controls/routes";
import type { ControlSettings, ControlSlug } from "@/lib/controls/types";
import styles from "./overview.module.css";
import { useState } from "react";

type OverviewDemoCardProps = {
  children?: ReactNode;
  slug: ControlSlug;
  title?: string;
};

export function OverviewDemoCard({ children, slug, title }: OverviewDemoCardProps) {
  const control = getControl(slug);
  const [settings, setSettings] = useState<ControlSettings>(() => getDefaultSettings(slug));

  if (!control) {
    return null;
  }

  return (
    <article className={styles.demoCard}>
      <div className="opus-panel-heading">
        <span className="opus-panel-title">{title ?? control.title}</span>
        <Link className={styles.moreLink} href={componentPath(slug)}>
          More
        </Link>
      </div>
      <div className={styles.demoCardBody}>
        {children ?? (
          <ControlPreview slug={slug} settings={settings} onSettingsChange={setSettings} />
        )}
      </div>
    </article>
  );
}
