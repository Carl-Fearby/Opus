"use client";

import { useEffect, useRef, useState } from "react";
import { ModelViewer, type ModelAsset } from "opus-react";
import styles from "./OpusModelShowcase.module.css";

const opusModel: ModelAsset = {
  id: "opus-logo",
  name: "Opus mark",
  src: "/models/opus/opus-logo.glb",
  alt: "Three-dimensional Opus cube logo.",
  cameraOrbit: "35deg 70deg auto",
};

export function OpusModelShowcase() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let viewer: HTMLElement | null = null;
    const onLoad = () => setIsLoading(false);
    const attach = () => {
      viewer = host.querySelector("model-viewer");
      viewer?.addEventListener("load", onLoad, { once: true });
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(host, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      viewer?.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div className={styles.showcase} ref={hostRef}>
      <p className={styles.label}>Interactive 3D asset</p>
      <ModelViewer asset={opusModel} autoRotate showCaption={false} height="large" />
      {isLoading ? (
        <div className={styles.loading} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <span>Loading Opus 3D mark…</span>
        </div>
      ) : null}
      <p className={styles.hint}>Drag to explore the Opus mark.</p>
    </div>
  );
}
