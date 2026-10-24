"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./ControlDetail.module.css";

export function PreviewLoading() {
  const { t } = useLocale();
  return (
    <div aria-busy="true" aria-live="polite" className={styles.previewLoading}>
      {t("docs.error.loadingPreview")}
    </div>
  );
}
