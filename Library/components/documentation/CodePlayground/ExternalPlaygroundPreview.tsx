"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { readExternalPreviewPayload, type PlaygroundExternalPreviewPayload } from "@/lib/playground/externalPreviewStorage";
import { PlaygroundPreview } from "./PlaygroundPreview";
import styles from "./CodePlayground.module.css";

export function ExternalPlaygroundPreview() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<PlaygroundExternalPreviewPayload | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPayload(readExternalPreviewPayload(searchParams.get("preview")));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  if (!payload) {
    return (
      <main className={styles.externalPreviewEmpty}>
        <h1>Preview unavailable</h1>
        <p>Return to the playground and choose Open External again.</p>
      </main>
    );
  }

  return (
    <main className={styles.externalPreview}>
      <PlaygroundPreview code={payload.code} padded={payload.padded} theme={payload.theme} />
    </main>
  );
}
