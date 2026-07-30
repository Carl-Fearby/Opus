"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CatalogIcon } from "opus-react";
import type {
  DesktopAppInfo,
  SelectedFile,
} from "../shared/contracts/desktop";
import { getPlatform } from "../lib/platform";

const capabilityCards = [
  {
    icon: "desktop",
    title: "Next.js renderer",
    text: "A statically exported Next application using the shared Opus component library.",
  },
  {
    icon: "shield-halved",
    title: "Sandboxed bridge",
    text: "Native features are exposed through a narrow, typed preload API.",
  },
  {
    icon: "box",
    title: "Cross-platform shell",
    text: "Electron Forge owns packaging for macOS, Windows, and Linux.",
  },
] as const;

export default function DesktopSpikePage() {
  const [appInfo, setAppInfo] = useState<DesktopAppInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile>(null);
  const [message, setMessage] = useState("Waiting for native bridge");

  useEffect(() => {
    const platform = getPlatform();
    platform
      .getAppInfo()
      .then((info) => {
        setAppInfo(info);
        setMessage(
          platform.kind === "electron"
            ? "Secure preload bridge connected"
            : "Web platform adapter connected",
        );
      })
      .catch(() => setMessage("Platform adapter unavailable"));
  }, []);

  async function chooseFile() {
    const platform = getPlatform();
    const file = await platform.selectFile();
    setSelectedFile(file);
    setMessage(
      file
        ? `Selected ${file.name} using the ${platform.kind} adapter`
        : "File selection cancelled",
    );
  }

  return (
    <main className="desktop-shell">
      <header className="application-header">
        <div className="brand">
          <span className="brand-mark">
            <Image
              alt=""
              aria-hidden="true"
              height={44}
              priority
              src="/logo-small.png"
              width={44}
            />
          </span>
          <span>Opus</span>
        </div>
        <span className="spike-badge">Desktop architecture spike</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Electron + Next.js + opus-react</p>
          <h1>A native shell for the Opus experience.</h1>
          <p className="hero-copy">
            This first slice proves static rendering, shared design-system
            consumption, secure IPC, and native packaging without coupling the
            product UI to Electron.
          </p>
          <div className="actions">
            <button type="button" className="primary-action" onClick={chooseFile}>
              <CatalogIcon iconName="folder-open" />
              Test platform file picker
            </button>
            <span className="status" role="status">
              {message}
            </span>
          </div>
        </div>

        <aside className="runtime-card">
          <p className="runtime-title">Runtime</p>
          <dl>
            <div>
              <dt>Application</dt>
              <dd>{appInfo?.name ?? "Browser preview"}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{appInfo?.version ?? "—"}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{appInfo?.platform ?? "Web"}</dd>
            </div>
            <div>
              <dt>Selected file</dt>
              <dd title={selectedFile?.path}>{selectedFile?.name ?? "None"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="capabilities" aria-label="Architecture capabilities">
        {capabilityCards.map((card) => (
          <article className="capability-card" key={card.title}>
            <span className="capability-icon">
              <CatalogIcon iconName={card.icon} />
            </span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
