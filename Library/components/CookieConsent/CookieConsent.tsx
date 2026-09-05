"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/fields/Button";
import styles from "./CookieConsent.module.css";

export const DEFAULT_COOKIE_CONSENT_STORAGE_KEY = "opus-cookie-consent";

export type CookieConsentValue = "accepted" | "rejected" | "dismissed";
export type CookieConsentPlacement = "bottom-left" | "bottom-right" | "bottom" | "inline";

export type CookieConsentProps = {
  acceptLabel?: string;
  description?: string;
  dismissLabel?: string;
  dismissible?: boolean;
  onAccept?: () => void;
  onDismiss?: (value: CookieConsentValue) => void;
  onReject?: () => void;
  /** Controls visibility directly. Useful for previews and controlled app state. */
  open?: boolean;
  persist?: boolean;
  placement?: CookieConsentPlacement;
  policyHref?: string;
  policyLabel?: string;
  rejectLabel?: string;
  showRejectButton?: boolean;
  storageKey?: string;
  title?: string;
};

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

/** Returns the saved visitor decision, if one exists. */
export function getCookieConsent(storageKey = DEFAULT_COOKIE_CONSENT_STORAGE_KEY): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "accepted" || stored === "rejected" || stored === "dismissed") return stored;
  } catch {
    // Browser privacy settings can deny local storage; the cookie is a fallback.
  }
  const cookie = readCookie(storageKey);
  return cookie === "accepted" || cookie === "rejected" || cookie === "dismissed" ? cookie : null;
}

/** Clears a saved decision so a consent notice can be shown again. */
export function resetCookieConsent(storageKey = DEFAULT_COOKIE_CONSENT_STORAGE_KEY) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // The cookie expiry below still clears the persisted fallback.
  }
  document.cookie = `${encodeURIComponent(storageKey)}=; path=/; max-age=0; SameSite=Lax`;
}

function saveCookieConsent(storageKey: string, value: CookieConsentValue) {
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Continue with a first-party cookie if local storage is unavailable.
  }
  document.cookie = `${encodeURIComponent(storageKey)}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function CookieConsent({
  acceptLabel = "Accept all",
  description = "We use essential cookies to keep this site working and optional cookies to understand how it is used.",
  dismissLabel = "Dismiss cookie notice",
  dismissible = true,
  onAccept,
  onDismiss,
  onReject,
  open,
  persist = true,
  placement = "bottom-right",
  policyHref,
  policyLabel = "Cookie policy",
  rejectLabel = "Reject optional",
  showRejectButton = true,
  storageKey = DEFAULT_COOKIE_CONSENT_STORAGE_KEY,
  title = "Your privacy matters",
}: CookieConsentProps) {
  const titleId = useId();
  const descriptionId = useId();
  // Non-persistent instances (for example, component catalogues) can render
  // immediately. Persisted notices wait until browser storage is available.
  const [ready, setReady] = useState(!persist);
  const [visible, setVisible] = useState(!persist);

  useEffect(() => {
    if (!persist) {
      setReady(true);
      setVisible(true);
      return;
    }

    setVisible(getCookieConsent(storageKey) === null);
    setReady(true);
  }, [persist, storageKey]);

  const choose = (value: CookieConsentValue) => {
    if (persist) saveCookieConsent(storageKey, value);
    setVisible(false);
    if (value === "accepted") onAccept?.();
    if (value === "rejected") onReject?.();
    onDismiss?.(value);
  };

  if (!ready || !(open ?? visible)) return null;

  return (
    <section aria-describedby={description ? descriptionId : undefined} aria-labelledby={titleId} aria-live="polite" className={styles.notice} data-placement={placement} role="region">
      <div className={styles.copy}>
        <h2 id={titleId}>{title}</h2>
        {description ? <p id={descriptionId}>{description}</p> : null}
        {policyHref ? <a href={policyHref}>{policyLabel}</a> : null}
      </div>
      <div className={styles.actions}>
        {showRejectButton ? <Button onClick={() => choose("rejected")} variant="secondary">{rejectLabel}</Button> : null}
        <Button onClick={() => choose("accepted")}>{acceptLabel}</Button>
      </div>
      {dismissible ? <button aria-label={dismissLabel} className={styles.dismiss} onClick={() => choose("dismissed")} type="button"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4.5 4.5 7 7m0-7-7 7" /></svg></button> : null}
    </section>
  );
}
