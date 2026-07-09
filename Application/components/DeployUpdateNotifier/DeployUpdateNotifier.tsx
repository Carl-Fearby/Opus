"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BUILD_VERSION } from "@/lib/buildVersion";
import styles from "./DeployUpdateNotifier.module.css";

const POLL_INTERVAL_MS = 60_000;

type BuildVersionResponse = {
  buildVersion: string;
};

async function fetchBuildVersion() {
  const response = await fetch(`/api/build-version?ts=${Date.now()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch build version");
  }

  return (await response.json()) as BuildVersionResponse;
}

export function DeployUpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const knownVersionRef = useRef(BUILD_VERSION);

  const checkForUpdate = useCallback(async () => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      const { buildVersion } = await fetchBuildVersion();

      if (buildVersion !== knownVersionRef.current) {
        setUpdateAvailable(true);
      }
    } catch {
      // Ignore transient network errors while polling.
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    void checkForUpdate();

    const intervalId = window.setInterval(() => {
      void checkForUpdate();
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkForUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkForUpdate]);

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={styles.banner} role="status">
      <p className={styles.message}>A new version of Opus is available.</p>
      <button className={styles.refreshButton} onClick={() => window.location.reload()} type="button">
        Refresh
      </button>
    </div>
  );
}
