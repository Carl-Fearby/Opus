"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  faCheck,
  faDownload,
  faLink,
  faShareNodes,
  faTv,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/lib/fontawesome";
import { shareMedia } from "@/lib/ui/shareMedia";
import styles from "./MediaShareCastControl.module.css";

type MediaWithCast = HTMLMediaElement & {
  disableRemotePlayback?: boolean;
  remote?: RemotePlayback;
  webkitCurrentPlaybackTargetIsWireless?: boolean;
  webkitShowPlaybackTargetPicker?: () => void;
};

export type MediaShareCastControlProps = {
  className?: string;
  downloadFileName?: string;
  fileUrl: string;
  iconClassName?: string;
  mediaRef: React.RefObject<HTMLMediaElement | null>;
  shareUrl?: string;
  showDownload?: boolean;
  text?: string;
  title: string;
};

function toAbsoluteUrl(value: string) {
  if (!value) {
    return typeof window !== "undefined" ? window.location.href : "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (typeof window === "undefined") {
    return value;
  }
  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return value;
  }
}

async function copyLink(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error("Clipboard unavailable");
}

function fileNameFromUrl(fileUrl: string, fallback: string) {
  const fromPath = toAbsoluteUrl(fileUrl).split("/").pop()?.split("?")[0];
  return fromPath || fallback;
}

async function downloadFile(fileUrl: string, fileName: string) {
  const absolute = toAbsoluteUrl(fileUrl);
  const response = await fetch(absolute);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function getCastMedia(media: HTMLMediaElement | null): MediaWithCast | null {
  return media as MediaWithCast | null;
}

async function promptCast(media: MediaWithCast) {
  if (media.remote && typeof media.remote.prompt === "function") {
    await media.remote.prompt();
    return;
  }

  if (typeof media.webkitShowPlaybackTargetPicker === "function") {
    media.webkitShowPlaybackTargetPicker();
    return;
  }

  throw new Error("Cast is not supported in this browser");
}

export function MediaShareCastControl({
  className,
  downloadFileName,
  fileUrl,
  iconClassName,
  mediaRef,
  shareUrl,
  showDownload = false,
  text,
  title,
}: MediaShareCastControlProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  const [castSupported, setCastSupported] = useState(false);
  const [casting, setCasting] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "copied" | "shared" | "downloaded">("idle");

  useEffect(() => {
    const media = getCastMedia(mediaRef.current);
    if (!media) {
      return;
    }

    media.disableRemotePlayback = false;

    const hasRemote = Boolean(media.remote && typeof media.remote.prompt === "function");
    const hasWebkit = typeof media.webkitShowPlaybackTargetPicker === "function";
    setCastSupported(hasRemote || hasWebkit);

    if (!hasRemote && !hasWebkit) {
      setCastAvailable(false);
      return;
    }

    let cancelled = false;
    let availabilityId: number | undefined;

    const syncCastingState = () => {
      if (cancelled) {
        return;
      }
      const remoteState = media.remote?.state;
      const webkitWireless = Boolean(media.webkitCurrentPlaybackTargetIsWireless);
      setCasting(remoteState === "connected" || webkitWireless);
    };

    syncCastingState();

    const onRemoteChange = () => syncCastingState();
    const onWebkitWireless = () => syncCastingState();
    const onWebkitAvailability = (event: Event) => {
      const availability = (event as Event & { availability?: boolean }).availability;
      if (typeof availability === "boolean") {
        setCastAvailable(availability);
      }
    };

    media.remote?.addEventListener("connecting", onRemoteChange);
    media.remote?.addEventListener("connect", onRemoteChange);
    media.remote?.addEventListener("disconnect", onRemoteChange);
    media.addEventListener("webkitcurrentplaybacktargetiswirelesschanged", onWebkitWireless);
    media.addEventListener("webkitplaybacktargetavailabilitychanged", onWebkitAvailability);

    if (media.remote && typeof media.remote.watchAvailability === "function") {
      void media.remote
        .watchAvailability((available) => {
          if (!cancelled) {
            setCastAvailable(available);
          }
        })
        .then((id) => {
          availabilityId = id;
        })
        .catch(() => {
          // Browser can't watch continuously — still allow prompt.
          if (!cancelled) {
            setCastAvailable(true);
          }
        });
    } else {
      setCastAvailable(true);
    }

    return () => {
      cancelled = true;
      media.remote?.removeEventListener("connecting", onRemoteChange);
      media.remote?.removeEventListener("connect", onRemoteChange);
      media.remote?.removeEventListener("disconnect", onRemoteChange);
      media.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged", onWebkitWireless);
      media.removeEventListener("webkitplaybacktargetavailabilitychanged", onWebkitAvailability);
      if (
        availabilityId != null &&
        media.remote &&
        typeof media.remote.cancelWatchAvailability === "function"
      ) {
        void media.remote.cancelWatchAvailability(availabilityId);
      }
    };
  }, [mediaRef]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onShare = async () => {
    setOpen(false);
    const result = await shareMedia({
      title,
      text: text ?? title,
      fileUrl,
      url: shareUrl,
    });
    if (result === "copied" || result === "shared") {
      setFeedback(result);
      window.setTimeout(() => setFeedback("idle"), 1600);
    }
  };

  const onCast = async () => {
    setOpen(false);
    const media = getCastMedia(mediaRef.current);
    if (!media) {
      return;
    }

    try {
      await promptCast(media);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      // NotSupported / no devices — leave quietly; menu already closed.
    }
  };

  const onDownload = async () => {
    setOpen(false);
    try {
      await downloadFile(
        fileUrl,
        downloadFileName || fileNameFromUrl(fileUrl, "download"),
      );
      setFeedback("downloaded");
      window.setTimeout(() => setFeedback("idle"), 1600);
    } catch {
      // Ignore download failures (blocked fetch, etc.).
    }
  };

  const triggerLabel =
    feedback === "copied"
      ? "Link copied"
      : feedback === "shared"
        ? "Shared"
        : feedback === "downloaded"
          ? "Download started"
          : casting
            ? "Sharing and casting menu, currently casting"
            : "Share and cast menu";

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} ref={rootRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        className={styles.trigger}
        data-active={feedback !== "idle" || casting ? "true" : undefined}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <FontAwesomeIcon
          className={[styles.icon, iconClassName].filter(Boolean).join(" ")}
          icon={casting ? faTv : faShareNodes}
        />
      </button>

      {open ? (
        <div className={styles.menu} id={menuId} role="menu">
          <button className={styles.item} role="menuitem" type="button" onClick={() => void onShare()}>
            <FontAwesomeIcon className={styles.itemIcon} icon={faShareNodes} />
            <span className={styles.itemLabel}>Share</span>
            <span className={styles.itemHint}>AirDrop, apps…</span>
          </button>
          <button
            className={styles.item}
            disabled={!castSupported || (!castAvailable && !casting)}
            role="menuitem"
            type="button"
            onClick={() => void onCast()}
          >
            <FontAwesomeIcon className={styles.itemIcon} icon={casting ? faCheck : faTv} />
            <span className={styles.itemLabel}>{casting ? "Casting…" : "Cast"}</span>
            <span className={styles.itemHint}>
              {!castSupported
                ? "Not supported here"
                : casting
                  ? "Connected"
                  : castAvailable
                    ? "TV / speakers"
                    : "No devices found"}
            </span>
          </button>
          <button
            className={styles.item}
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              void copyLink(toAbsoluteUrl(shareUrl || fileUrl))
                .then(() => {
                  setFeedback("copied");
                  window.setTimeout(() => setFeedback("idle"), 1600);
                })
                .catch(() => {
                  // Ignore clipboard failures.
                });
            }}
          >
            <FontAwesomeIcon className={styles.itemIcon} icon={faLink} />
            <span className={styles.itemLabel}>Copy link</span>
            <span className={styles.itemHint}>Clipboard</span>
          </button>
          {showDownload ? (
            <button
              className={styles.item}
              role="menuitem"
              type="button"
              onClick={() => {
                void onDownload();
              }}
            >
              <FontAwesomeIcon className={styles.itemIcon} icon={faDownload} />
              <span className={styles.itemLabel}>Download</span>
              <span className={styles.itemHint}>Save file</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
