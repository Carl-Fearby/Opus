"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./Hero.module.css";

const INSTALL_COMMAND = "npm install opus-react";

export function InstallCommand() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(INSTALL_COMMAND);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = INSTALL_COMMAND;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div className={styles.install}>
      <code>{INSTALL_COMMAND}</code>
      <button aria-label={copied ? "Copied" : "Copy install command"} onClick={handleCopy} type="button">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
