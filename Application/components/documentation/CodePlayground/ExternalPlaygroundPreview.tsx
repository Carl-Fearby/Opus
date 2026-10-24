"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  readExternalPreviewPayload,
  readExternalPreviewPayloadFromServer,
  type PlaygroundExternalPreviewPayload,
} from "@/lib/playground/externalPreviewStorage";
import { PlaygroundPreview } from "./PlaygroundPreview";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./CodePlayground.module.css";

export function ExternalPlaygroundPreview() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<PlaygroundExternalPreviewPayload | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const previewId = searchParams.get("preview");
    const localPayload = readExternalPreviewPayload(previewId);
    if (localPayload) {
      setPayload(localPayload);
      return;
    }

    const loadPayload = async () => {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const serverPayload = await readExternalPreviewPayloadFromServer(previewId);
        if (serverPayload || cancelled) {
          if (!cancelled) setPayload(serverPayload);
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }
      if (!cancelled) setPayload(null);
    };
    void loadPayload();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (payload === undefined) {
    return <main className={styles.externalPreviewEmpty}>{t("docs.error.loadingPreview")}</main>;
  }

  if (!payload) {
    return (
      <main className={styles.externalPreviewEmpty}>
        <h1>{t("docs.error.previewUnavailable.title")}</h1>
        <p>{t("docs.error.previewUnavailable.description")}</p>
      </main>
    );
  }

  return (
    <main className={styles.externalPreview}>
      <PlaygroundPreview code={payload.code} padded={payload.padded} theme={payload.theme} />
    </main>
  );
}
