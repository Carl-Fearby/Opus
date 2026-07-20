"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Splitter, type SplitterOrientation } from "opus-react";
import type { Theme } from "opus-react";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { CatalogIcon } from "@/components/CatalogIcon";
import { SwitchField, ThemeToggleField } from "@/components/fields";
import { patchAppSetupPlaygroundTheme } from "@/lib/controls/appSetupBoilerplate";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { getControl } from "@/lib/controls/registry";
import type { AppSetupSettings, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { DEFAULT_PLAYGROUND_CODE } from "@/lib/playground/defaultPlaygroundCode";
import { createExternalPreviewPayload } from "@/lib/playground/externalPreviewStorage";
import { readPlaygroundPanelSize, storePlaygroundPanelSize } from "@/lib/playground/playgroundPanelSize";
import { readPlaygroundSeed } from "@/lib/playground/playgroundNavigation";
import { usePlaygroundTheme } from "@/lib/playground/playgroundTheme";
import styles from "./CodePlayground.module.css";
import { PlaygroundPreview } from "./PlaygroundPreview";

const UsageCodeEditor = dynamic(
  () => import("@/components/control-detail/UsageCodeEditor").then((module) => module.UsageCodeEditor),
  { ssr: false },
);

type CodePlaygroundProps = {
  initialCategory?: string | null;
  initialSlug?: string | null;
};

type PlaygroundChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type PlaygroundLayout = "preview" | "source" | "split";

type PlaygroundSourceContext = {
  category: string | null;
  slug: string | null;
};

function PreviewMenuLabel({ iconName, label }: { iconName: string; label: string }) {
  return (
    <span className={styles.previewMenuLabel}>
      <span className={styles.previewMenuIcon}>
        <CatalogIcon iconName={iconName} />
      </span>
      <span>{label}</span>
    </span>
  );
}

function useSplitterOrientation(): SplitterOrientation {
  const [orientation, setOrientation] = useState<SplitterOrientation>("horizontal");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 960px)");
    const update = () => setOrientation(media.matches ? "vertical" : "horizontal");

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return orientation;
}

function usePlaygroundPanelSize(orientation: SplitterOrientation) {
  const fallback = orientation === "horizontal" ? 50 : 42;
  const [size, setSize] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let readyFrame: number | null = null;
    const timeout = window.setTimeout(() => {
      setReady(false);
      setSize(readPlaygroundPanelSize(orientation, fallback));
      readyFrame = window.requestAnimationFrame(() => setReady(true));
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      if (readyFrame !== null) {
        window.cancelAnimationFrame(readyFrame);
      }
    };
  }, [fallback, orientation]);

  const onSizeChange = useCallback(
    (next: number) => {
      setSize(next);
      storePlaygroundPanelSize(orientation, next);
    },
    [orientation],
  );

  return { onSizeChange, ready, size };
}

function resolveInitialCode(
  initialSlug?: string | null,
  initialCategory?: string | null,
  seedSettings?: ControlSettings,
  playgroundTheme?: Theme,
) {
  if (!initialSlug) {
    return DEFAULT_PLAYGROUND_CODE;
  }

  const control = getControl(initialSlug);

  if (!control) {
    return DEFAULT_PLAYGROUND_CODE;
  }

  const settings = seedSettings ?? getDefaultSettings(initialSlug as ControlSlug);
  const resolvedSettings =
    initialSlug === "app-setup"
      ? ({ ...settings, theme: playgroundTheme ?? (settings as AppSetupSettings).theme } as AppSetupSettings)
      : settings;

  return generateUsageCode(initialSlug as ControlSlug, resolvedSettings, control.category).full;
}

export function CodePlayground({ initialCategory = null, initialSlug = null }: CodePlaygroundProps) {
  const orientation = useSplitterOrientation();
  const { onSizeChange, ready: panelSizeReady, size } = usePlaygroundPanelSize(orientation);
  const selectSourceCodeRef = useRef<() => void>(() => undefined);
  const [playgroundTheme, setPlaygroundTheme] = usePlaygroundTheme();
  const [layout, setLayout] = useState<PlaygroundLayout>("split");
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [previewPadding, setPreviewPadding] = useState(true);
  const [previewResetKey, setPreviewResetKey] = useState(0);
  const [previewMenuOpen, setPreviewMenuOpen] = useState(false);
  const previewMenuRef = useRef<HTMLDivElement | null>(null);
  const layoutBeforeFullWidthRef = useRef<PlaygroundLayout>("split");
  const [seedCode, setSeedCode] = useState(() =>
    resolveInitialCode(initialSlug, initialCategory, undefined, playgroundTheme),
  );
  const [code, setCode] = useState(() => resolveInitialCode(initialSlug, initialCategory, undefined, playgroundTheme));
  const [playgroundContext, setPlaygroundContext] = useState<PlaygroundSourceContext>({
    category: initialCategory,
    slug: initialSlug,
  });
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<PlaygroundChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Ask about the playground source, component props, layout, or how to reshape this example.",
    },
  ]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const seed = readPlaygroundSeed();
      const slug = initialSlug ?? seed?.slug ?? null;
      const category = initialCategory ?? seed?.category ?? null;
      const seedSettings =
        seed && seed.slug === slug && (!category || seed.category === category) ? seed.settings : undefined;
      const nextCode = resolveInitialCode(slug, category, seedSettings, playgroundTheme);

      setPlaygroundContext({ category, slug });
      setPreviewError(null);
      setSeedCode(nextCode);

      if (slug === "app-setup") {
        setCode((current) =>
          current.includes("OpusAppShell") ? patchAppSetupPlaygroundTheme(current, playgroundTheme) : nextCode,
        );
        return;
      }

      setCode(nextCode);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [initialCategory, initialSlug, playgroundTheme]);

  const updateCode = useCallback((nextCode: string) => {
    setPreviewError(null);
    setCode(nextCode);
  }, []);

  const sendChatMessage = useCallback(async (promptOverride?: string) => {
    const prompt = (promptOverride ?? chatInput).trim();

    if (!prompt || chatLoading) {
      return;
    }

    const userMessage: PlaygroundChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };
    const nextMessages = [...chatMessages, userMessage];

    setChatInput("");
    setChatError(null);
    setChatLoading(true);
    setChatMessages(nextMessages);

    try {
      const response = await fetch("/api/playground-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          componentCategory: playgroundContext.category,
          componentSlug: playgroundContext.slug,
          messages: nextMessages.map(({ content, role }) => ({ content, role })),
          previewError,
          seedCode,
          theme: playgroundTheme,
        }),
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "ChatGPT request failed.");
      }

      setChatMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.message ?? "I could not find a text response.",
        },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "ChatGPT request failed.");
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, code, playgroundContext.category, playgroundContext.slug, previewError, seedCode, playgroundTheme]);

  const resetSplitLayout = useCallback(() => {
    setLayout("split");
    onSizeChange(orientation === "horizontal" ? 50 : 42);
  }, [onSizeChange, orientation]);

  const resetPreviewLayout = useCallback(() => {
    [
      "crm-test-layout",
      "crm-test-layout-v2",
      "crm-test-layout-v3",
      "crm-test-layout-v4",
      "opus-sidebar-state:crm-test-layout-menu",
    ].forEach((key) => window.localStorage.removeItem(key));
    setPreviewResetKey((current) => current + 1);
  }, []);

  const enterFullWidth = useCallback(() => {
    layoutBeforeFullWidthRef.current = layout;
    setIsFullWidth(true);
  }, [layout]);

  const exitFullWidth = useCallback(() => {
    setIsFullWidth(false);
    setLayout(layoutBeforeFullWidthRef.current);
  }, []);

  const openExternalPreview = useCallback(() => {
    const previewId = createExternalPreviewPayload({
      code,
      padded: previewPadding,
      theme: playgroundTheme,
    });
    window.open(
      `/documentation/playground/external?preview=${encodeURIComponent(previewId)}&theme=${playgroundTheme}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [code, playgroundTheme, previewPadding]);

  useEffect(() => {
    if (!previewMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (previewMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setPreviewMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewMenuOpen]);

  useEffect(() => {
    if (!isFullWidth) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exitFullWidth();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [exitFullWidth, isFullWidth]);

  const selectSourceCode = useCallback(() => {
    selectSourceCodeRef.current();
  }, []);

  const sourcePane = (
    <section
      className={`${styles.pane} ${styles.editorPane}`}
      onKeyDownCapture={(event) => {
        if (event.key.toLowerCase() !== "a" || (!event.metaKey && !event.ctrlKey)) {
          return;
        }

        const target = event.target as HTMLElement;
        if (target.closest(`.${styles.chatPanel}`) || target.matches("input, textarea, select")) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        selectSourceCode();
      }}
    >
      <div className={styles.paneHeader}>
        <div>
          <h1 className={styles.paneTitle}>Source</h1>
          <p className={styles.paneHint}>Edit the component, then preview updates on the right.</p>
        </div>
      </div>
      <div className={`${styles.paneBody} ${styles.sourcePaneBody}`}>
        <div className={styles.sourceEditor}>
          <UsageCodeEditor
            editable
            code={code}
            fillHeight
            onSelectAllReady={(selectAll) => {
              selectSourceCodeRef.current = selectAll;
            }}
            onChange={updateCode}
          />
        </div>
        <section className={styles.chatPanel} aria-label="ChatGPT playground assistant">
          <div className={styles.chatHeader}>
            <div>
              <h2 className={styles.chatTitle}>ChatGPT</h2>
              <p className={styles.chatHint}>Conversations use the current source as context.</p>
            </div>
            <button
              className={styles.clearChatButton}
              type="button"
              onClick={() => {
                setChatError(null);
                setChatMessages([]);
              }}
            >
              Clear
            </button>
            {previewError ? (
              <button
                className={styles.fixErrorButton}
                disabled={chatLoading}
                type="button"
                onClick={() => {
                  void sendChatMessage(
                    "The playground preview is failing. Diagnose the current preview error and provide the safest corrected complete playground source. Keep the fix scoped to the source code.",
                  );
                }}
              >
                Fix preview error
              </button>
            ) : null}
          </div>
          <div className={styles.chatMessages}>
            {chatMessages.map((message) => (
              <div
                className={`${styles.chatMessage} ${
                  message.role === "user" ? styles.chatMessageUser : styles.chatMessageAssistant
                }`}
                key={message.id}
              >
                <span className={styles.chatRole}>{message.role === "user" ? "You" : "ChatGPT"}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {chatLoading ? (
              <div className={`${styles.chatMessage} ${styles.chatMessageAssistant}`}>
                <span className={styles.chatRole}>ChatGPT</span>
                <p>Thinking...</p>
              </div>
            ) : null}
          </div>
          {chatError ? <p className={styles.chatError}>{chatError}</p> : null}
          <form
            className={styles.chatComposer}
            onSubmit={(event) => {
              event.preventDefault();
              void sendChatMessage();
            }}
          >
            <textarea
              aria-label="Message ChatGPT"
              className={styles.chatInput}
              placeholder="Ask ChatGPT about this source..."
              rows={2}
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  void sendChatMessage();
                }
              }}
            />
            <button className={styles.chatSendButton} disabled={chatLoading || !chatInput.trim()} type="submit">
              Send
            </button>
          </form>
        </section>
      </div>
    </section>
  );

  const previewPane = (
    <section className={`${styles.pane} ${styles.previewPane}`}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>Preview</h2>
          <p className={styles.paneHint}>Live render of your edited component.</p>
        </div>
        <div className={styles.previewMenuWrap} ref={previewMenuRef}>
          <button
            aria-expanded={previewMenuOpen}
            aria-haspopup="menu"
            aria-label="Preview options"
            className={styles.previewMenuButton}
            type="button"
            onClick={() => setPreviewMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          {previewMenuOpen ? (
            <div className={styles.previewMenu} role="menu">
              <div className={styles.previewMenuRow}>
                <PreviewMenuLabel iconName="border-all" label="Preview Padding" />
                <SwitchField
                  checked={previewPadding}
                  id="playground-preview-padding-toggle"
                  label="Preview Padding"
                  labelVisuallyHidden
                  mode="flagged"
                  size="sm"
                  onChange={(event) => setPreviewPadding(event.target.checked)}
                />
              </div>
              <div className={styles.previewMenuTheme}>
                <PreviewMenuLabel iconName="circle-half-stroke" label="Preview theme" />
                <ThemeToggleField
                  id="playground-preview-theme-toggle"
                  label="Preview theme"
                  labelVisuallyHidden
                  value={playgroundTheme}
                  onChange={setPlaygroundTheme}
                />
              </div>
              <div className={styles.previewMenuDivider} />
              <button
                className={styles.previewMenuItem}
                role="menuitem"
                type="button"
                onClick={() => {
                  resetPreviewLayout();
                  setPreviewMenuOpen(false);
                }}
              >
                <PreviewMenuLabel iconName="rotate-left" label="Reset preview" />
              </button>
              <button
                className={styles.previewMenuItem}
                role="menuitem"
                type="button"
                onClick={() => {
                  openExternalPreview();
                  setPreviewMenuOpen(false);
                }}
              >
                <PreviewMenuLabel iconName="up-right-from-square" label="Open External" />
              </button>
              {isFullWidth ? (
                <button
                  className={styles.previewMenuItem}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    exitFullWidth();
                    setPreviewMenuOpen(false);
                  }}
                >
                  <PreviewMenuLabel iconName="compress" label="Exit full width" />
                </button>
              ) : (
                <button
                  className={styles.previewMenuItem}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    enterFullWidth();
                    setPreviewMenuOpen(false);
                  }}
                >
                  <PreviewMenuLabel iconName="expand" label="Full width" />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.paneBody}>
        <PlaygroundPreview
          key={previewResetKey}
          code={code}
          padded={previewPadding}
          theme={playgroundTheme}
          onErrorChange={setPreviewError}
        />
      </div>
    </section>
  );

  return (
    <div className={styles.playground} data-full-width={isFullWidth ? "true" : undefined}>
      {isFullWidth ? null : (
        <DocumentationTopBar
          current="playground"
          trailing={
            <div className={styles.layoutControls} aria-label="Playground layout controls">
              <button
                className={styles.layoutButton}
                data-active={layout === "source" ? "true" : undefined}
                type="button"
                onClick={() => setLayout("source")}
              >
                Source
              </button>
              <button
                className={styles.layoutButton}
                data-active={layout === "split" ? "true" : undefined}
                type="button"
                onClick={resetSplitLayout}
              >
                Split
              </button>
              <button
                className={styles.layoutButton}
                data-active={layout === "preview" ? "true" : undefined}
                type="button"
                onClick={() => setLayout("preview")}
              >
                Preview
              </button>
            </div>
          }
        />
      )}
      <div className={styles.body}>
        {isFullWidth ? (
          <div className={styles.singlePane}>{previewPane}</div>
        ) : layout === "split" ? (
          <Splitter
            className={styles.splitter}
            flush
            minSize={15}
            onSizeChange={onSizeChange}
            orientation={orientation}
            size={size}
            style={{ visibility: panelSizeReady ? "visible" : "hidden" }}
          >
            {sourcePane}
            {previewPane}
          </Splitter>
        ) : (
          <div className={styles.singlePane}>{layout === "source" ? sourcePane : previewPane}</div>
        )}
      </div>
    </div>
  );
}
