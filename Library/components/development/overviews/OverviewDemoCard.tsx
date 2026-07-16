"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { ControlPreview } from "@/components/control-detail/ControlDetail/ControlPreview";
import { PreviewStage } from "@/components/control-detail/ControlDetail/PreviewStage";
import { PreviewThemeControls } from "@/components/control-detail/ControlDetail/PreviewThemeControls";
import { OpenInPlaygroundLink } from "@/components/control-detail/ControlDetail/OpenInPlaygroundLink";
import previewStyles from "@/components/control-detail/ControlDetail/ControlDetail.module.css";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { getControl } from "@/lib/controls/registry";
import { componentPath } from "@/lib/controls/routes";
import type { ControlSettings, ControlSlug } from "@/lib/controls/types";
import styles from "./overview.module.css";

type OverviewDemoCardProps = {
  children?: ReactNode;
  slug: ControlSlug;
  title?: string;
};

export function OverviewDemoCard({ children, slug, title }: OverviewDemoCardProps) {
  const control = getControl(slug);
  const [settings, setSettings] = useState<ControlSettings>(() => {
    return getDefaultSettings(slug);
  });

  if (!control) {
    return null;
  }

  return (
    <article className={styles.demoCard}>
      <div className="opus-panel-heading">
        <span className="opus-panel-title">{title ?? control.title}</span>
        <div className={previewStyles.previewToolbar}>
          <PreviewThemeControls id={`preview-theme-toggle-${slug}`} />
          <OpenInPlaygroundLink category={control.category} settings={settings} slug={slug} />
          <Link className={styles.moreLink} href={componentPath(slug)}>
            More
          </Link>
        </div>
      </div>
      <div className={styles.demoCardBody}>
        <PreviewStage>
          {children ?? (
            <ControlPreview
              category={control.category}
              slug={slug}
              settings={settings}
              onSettingsChange={setSettings}
            />
          )}
        </PreviewStage>
      </div>
    </article>
  );
}
