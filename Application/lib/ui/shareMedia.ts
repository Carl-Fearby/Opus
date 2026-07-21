export type ShareMediaInput = {
  fileUrl?: string;
  text?: string;
  title: string;
  url?: string;
};

export type ShareMediaResult = "shared" | "copied" | "cancelled" | "failed";

function toAbsoluteUrl(value: string) {
  if (!value) {
    return "";
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

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  throw new Error("Clipboard unavailable");
}

async function shareFiles(title: string, text: string | undefined, fileUrl: string) {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  const absolute = toAbsoluteUrl(fileUrl);
  const response = await fetch(absolute);
  if (!response.ok) {
    return false;
  }

  const blob = await response.blob();
  const filename = absolute.split("/").pop()?.split("?")[0] || "media";
  const file = new File([blob], filename, {
    type: blob.type || "application/octet-stream",
  });

  const data: ShareData = { title, text, files: [file] };
  if (typeof navigator.canShare === "function" && !navigator.canShare(data)) {
    return false;
  }

  await navigator.share(data);
  return true;
}

/**
 * Opens the OS share sheet when available (AirDrop, Nearby Share, etc.).
 * Falls back to copying the URL to the clipboard.
 */
export async function shareMedia({
  fileUrl,
  text,
  title,
  url,
}: ShareMediaInput): Promise<ShareMediaResult> {
  const shareUrl = toAbsoluteUrl(url || fileUrl || (typeof window !== "undefined" ? window.location.href : ""));
  const shareText = text ?? title;

  if (fileUrl) {
    try {
      const sharedFile = await shareFiles(title, shareText, fileUrl);
      if (sharedFile) {
        return "shared";
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  try {
    await copyText(shareUrl || shareText);
    return "copied";
  } catch {
    return "failed";
  }
}
