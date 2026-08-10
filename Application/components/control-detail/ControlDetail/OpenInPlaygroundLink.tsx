"use client";

import Link from "next/link";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { buildPlaygroundHref, storePlaygroundSeed } from "@/lib/playground/playgroundNavigation";
import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import styles from "./ControlDetail.module.css";

type OpenInPlaygroundLinkProps = {
  category?: ComponentCategory;
  settings: ControlSettings;
  slug: ControlSlug;
};

export function OpenInPlaygroundLink({ category, settings, slug }: OpenInPlaygroundLinkProps) {
  const seed = {
    category,
    code: generateUsageCode(slug, settings, category).full,
    settings,
    slug,
  };

  return (
    <Link
      className={styles.panelActionButton}
      href={buildPlaygroundHref(slug, category)}
      onMouseDown={() => storePlaygroundSeed(seed)}
      onClick={() => storePlaygroundSeed(seed)}
    >
      Open in Playground
    </Link>
  );
}
