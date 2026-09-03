"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import styles from "./OpusModelShowcase.module.css";

const MODEL_SRC = "/models/opus/opus-logo.glb";
const MODEL_VIEWER_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

type ModelViewerElement = HTMLElement & {
  loaded?: boolean;
};

function ensureModelViewer() {
  if (customElements.get("model-viewer")) {
    return Promise.resolve();
  }

  if (!document.querySelector(`script[src="${MODEL_VIEWER_SRC}"]`)) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SRC;
    document.head.appendChild(script);
  }

  return customElements.whenDefined("model-viewer");
}

export function OpusModelShowcase() {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    ensureModelViewer()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    const timeout = window.setTimeout(() => {
      if (!cancelled && !customElements.get("model-viewer")) {
        setFailed(true);
      }
    }, 20_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const setViewerNode = useCallback((node: ModelViewerElement | null) => {
    viewerRef.current = node;
    if (!node) {
      return;
    }

    const onLoad = () => setModelLoaded(true);
    const onError = () => setFailed(true);
    node.addEventListener("load", onLoad);
    node.addEventListener("error", onError);
    if (node.loaded) {
      onLoad();
    }
  }, []);

  useEffect(() => {
    if (!ready || failed) {
      return;
    }

    const viewer = viewerRef.current;
    if (viewer?.loaded) {
      setModelLoaded(true);
    }
  }, [ready, failed]);

  const showOverlay = !failed && !modelLoaded;

  return (
    <div className={styles.showcase}>
      <p className={styles.label}>Interactive 3D asset</p>
      <div className={styles.stage}>
        {ready
          ? createElement("model-viewer", {
              key: MODEL_SRC,
              ref: setViewerNode,
              alt: "Three-dimensional Opus cube logo.",
              "auto-rotate": "",
              "camera-controls": "",
              "camera-orbit": "35deg 70deg 55%",
              "environment-image": "neutral",
              exposure: "0.95",
              "interaction-prompt": "auto",
              "shadow-intensity": "0.72",
              src: MODEL_SRC,
              className: styles.model,
            })
          : null}
      </div>
      {showOverlay ? (
        <div className={styles.loading} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <span>Loading Opus 3D mark…</span>
        </div>
      ) : null}
      {failed ? (
        <div className={styles.loading} role="alert">
          3D preview unavailable.
        </div>
      ) : null}
      <p className={styles.hint}>Drag to explore the Opus mark.</p>
    </div>
  );
}
