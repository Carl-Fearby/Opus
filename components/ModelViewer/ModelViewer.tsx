"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import type { ModelAsset } from "@/components/fields/types";
import { FireBarrelModelViewer } from "./FireBarrelModelViewer";
import styles from "./ModelViewer.module.css";

const MODEL_VIEWER_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

type ModelViewerElement = HTMLElement & {
  animationName?: string;
  availableAnimations?: string[];
  loaded?: boolean;
  play?: (options?: { repetitions?: number }) => void;
};

type ModelViewerProps = {
  asset: ModelAsset;
  autoRotate?: boolean;
  cameraControls?: boolean;
  height?: "compact" | "default" | "large" | "lightbox";
  showCaption?: boolean;
};

let modelViewerScriptLoading: Promise<void> | null = null;

function loadModelViewer() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (customElements.get("model-viewer")) {
    return Promise.resolve();
  }

  if (!modelViewerScriptLoading) {
    modelViewerScriptLoading = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${MODEL_VIEWER_SRC}"]`,
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Could not load model-viewer.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.type = "module";
      script.src = MODEL_VIEWER_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load model-viewer."));
      document.head.appendChild(script);
    });
  }

  return modelViewerScriptLoading;
}

function startModelAnimation(viewer: ModelViewerElement, asset: ModelAsset) {
  if (!asset.autoplay) {
    return;
  }

  const available = viewer.availableAnimations ?? [];
  const animationName = asset.animationName && available.includes(asset.animationName)
    ? asset.animationName
    : available[0];

  if (animationName) {
    viewer.animationName = animationName;
  }

  viewer.play?.();
}

export function ModelViewer({
  asset,
  autoRotate = true,
  cameraControls = true,
  height = "default",
  showCaption = true,
}: ModelViewerProps) {
  if (asset.fireOverlay) {
    return (
      <FireBarrelModelViewer
        asset={asset}
        autoRotate={autoRotate}
        cameraControls={cameraControls}
        height={height}
        showCaption={showCaption}
      />
    );
  }

  return (
    <StandardModelViewer
      asset={asset}
      autoRotate={autoRotate}
      cameraControls={cameraControls}
      height={height}
      showCaption={showCaption}
    />
  );
}

function StandardModelViewer({
  asset,
  autoRotate = true,
  cameraControls = true,
  height = "default",
  showCaption = true,
}: ModelViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const shouldAutoRotate = autoRotate && !asset.autoplay;

  const setViewerRef = useCallback((node: ModelViewerElement | null) => {
    viewerRef.current = node;
  }, []);

  useEffect(() => {
    let mounted = true;

    loadModelViewer()
      .then(() => {
        if (mounted) {
          setReady(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setFailed(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || failed || !asset.autoplay) {
      return;
    }

    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    const onLoad = () => startModelAnimation(viewer, asset);

    viewer.addEventListener("load", onLoad);

    if (viewer.loaded) {
      onLoad();
    }

    return () => viewer.removeEventListener("load", onLoad);
  }, [ready, failed, asset]);

  return (
    <figure className={styles.viewer} data-caption={showCaption ? "true" : "false"} data-height={height}>
      <div className={styles.stage}>
        {ready && !failed
          ? createElement("model-viewer", {
              key: asset.src,
              ref: setViewerRef,
              alt: asset.alt,
              autoplay: asset.autoplay ? "" : undefined,
              "animation-name": asset.animationName,
              "auto-rotate": shouldAutoRotate ? "" : undefined,
              "camera-controls": cameraControls ? "" : undefined,
              "camera-orbit": asset.cameraOrbit,
              "environment-image": "neutral",
              exposure: "0.95",
              "interaction-prompt": "auto",
              "shadow-intensity": "0.72",
              src: asset.src,
              className: styles.model,
            })
          : (
            <div className={styles.loading} role={failed ? "alert" : "status"}>
              {failed ? "Model preview unavailable." : "Loading 3D asset..."}
            </div>
          )}
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
