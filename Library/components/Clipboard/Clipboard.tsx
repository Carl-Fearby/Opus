"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ClipboardContextValue = {
  lastCopied: string | null;
  readText: () => Promise<string>;
  writeText: (value: string) => Promise<void>;
};

const ClipboardContext = createContext<ClipboardContextValue | null>(null);

async function fallbackWrite(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

type ClipboardProviderProps = {
  children: ReactNode;
};

export function ClipboardProvider({ children }: ClipboardProviderProps) {
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const writeText = useCallback(async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      await fallbackWrite(value);
    }
    setLastCopied(value);
  }, []);

  const readText = useCallback(async () => {
    if (navigator.clipboard?.readText) {
      return navigator.clipboard.readText();
    }
    return lastCopied ?? "";
  }, [lastCopied]);

  const value = useMemo(
    () => ({ lastCopied, readText, writeText }),
    [lastCopied, readText, writeText],
  );

  return <ClipboardContext.Provider value={value}>{children}</ClipboardContext.Provider>;
}

export function useClipboard() {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error("useClipboard must be used within ClipboardProvider");
  }
  return context;
}

/** Catalog-facing alias — same as ClipboardProvider. */
export function Clipboard({ children }: ClipboardProviderProps) {
  return <ClipboardProvider>{children}</ClipboardProvider>;
}
