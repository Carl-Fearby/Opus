"use client";

import { useEffect, useRef, useState } from "react";
import type { ModelAsset } from "@/components/fields/types";
import styles from "./ModelViewer.module.css";

type FireBarrelModelViewerProps = {
  asset: ModelAsset;
  autoRotate?: boolean;
  cameraControls?: boolean;
  height?: "compact" | "default" | "large" | "lightbox";
  showCaption?: boolean;
};

export function FireBarrelModelViewer({
  asset,
  autoRotate = true,
  cameraControls = true,
  height = "default",
  showCaption = true,
}: FireBarrelModelViewerProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvasHost = canvasHostRef.current;
    if (!canvasHost) {
      return;
    }

    let disposed = false;
    let teardown = () => {};

    void (async () => {
      const { setupFireBarrelScene } = await import("@/lib/oil-barrel/setupFireBarrelScene");
      const dispose = await setupFireBarrelScene({
        autoRotate,
        cameraControls,
        host: canvasHost,
        modelSrc: asset.src,
      });

      if (disposed) {
        dispose();
        return;
      }

      teardown = dispose;
      setLoading(false);
    })().catch(() => {
      if (!disposed) {
        setFailed(true);
        setLoading(false);
      }
    });

    return () => {
      disposed = true;
      teardown();
    };
  }, [asset.src, autoRotate, cameraControls]);

  return (
    <figure
      className={styles.viewer}
      data-caption={showCaption ? "true" : "false"}
      data-fire-overlay="true"
      data-height={height}
    >
      <div className={styles.stage}>
        <div ref={canvasHostRef} className={styles.canvasHost} />
        {loading && !failed ? (
          <div className={styles.loading} role="status">
            Loading 3D asset...
          </div>
        ) : null}
        {failed ? (
          <div className={styles.loading} role="alert">
            Model preview unavailable.
          </div>
        ) : null}
      </div>
      {showCaption ? (
        <figcaption className={styles.caption}>
          <span>{asset.name}</span>
          {asset.description ? <small>{asset.description}</small> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
