"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/fields/Button";
import type { ButtonVariant } from "@/components/fields/Button";
import styles from "./CopyButton.module.css";

type CopyButtonProps = {
  children?: ReactNode;
  copiedLabel?: string;
  label?: string;
  resetMs?: number;
  value: string;
  variant?: ButtonVariant;
  onCopied?: () => void;
};

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

export function CopyButton({
  children,
  copiedLabel = "Copied",
  label = "Copy",
  resetMs = 1600,
  value,
  variant = "secondary",
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), resetMs);
    return () => window.clearTimeout(timer);
  }, [copied, resetMs]);

  const handleCopy = useCallback(async () => {
    try {
      await writeClipboard(value);
      setCopied(true);
      onCopied?.();
    } catch {
      setCopied(false);
    }
  }, [onCopied, value]);

  return (
    <span className={styles.wrap}>
      <Button onClick={handleCopy} type="button" variant={variant}>
        {children ?? (copied ? copiedLabel : label)}
      </Button>
    </span>
  );
}
