"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Splitter, type SplitterOrientation } from "opus-react";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { CatalogIcon } from "opus-react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { SwitchField, ThemeToggleField } from "opus-react";
import { patchAppSetupPlaygroundTheme } from "@/lib/controls/appSetupBoilerplate";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { isFullBleedPreview } from "@/lib/controls/previewPresentation";
import { getControl } from "@/lib/controls/registry";
import type { AppSetupSettings, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { DEFAULT_PLAYGROUND_CODE } from "@/lib/playground/defaultPlaygroundCode";
import { createExternalPreviewPayload } from "@/lib/playground/externalPreviewStorage";
import {
  looksLikeOpenAiApiKey,
  readPlaygroundOpenAiApiKey,
  storePlaygroundOpenAiApiKey,
} from "@/lib/playground/playgroundChatApiKey";
import { readPlaygroundPanelSize, storePlaygroundPanelSize, readPlaygroundChatSplitSize, storePlaygroundChatSplitSize } from "@/lib/playground/playgroundPanelSize";
import { readPlaygroundSeed } from "@/lib/playground/playgroundNavigation";
import { usePlaygroundTheme } from "@/lib/playground/playgroundTheme";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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
  exactUsageCode?: string,
) {
  if (exactUsageCode?.trim()) {
    return exactUsageCode;
  }

  if (!initialSlug) {
    return DEFAULT_PLAYGROUND_CODE;
  }

  const control = getControl(initialSlug);

  if (!control) {
    return DEFAULT_PLAYGROUND_CODE;
  }

  const settings = seedSettings ?? getDefaultSettings(initialSlug as ControlSlug);
  return generateUsageCode(initialSlug as ControlSlug, settings, control.category).full;
}

export function CodePlayground({ initialCategory = null, initialSlug = null }: CodePlaygroundProps) {
  const { t } = useLocale();
  const {
    setPreviewAccent,
    setPreviewAccentSecondary,
    setPreviewBaseColor,
    setPreviewFontFamily,
    setPreviewTheme,
    setPreviewTileAccent,
    setPreviewTileAccentSecondary,
  } = useComponentsTheme();
  const orientation = useSplitterOrientation();
  const { onSizeChange, ready: panelSizeReady, size } = usePlaygroundPanelSize(orientation);
  const selectSourceCodeRef = useRef<() => void>(() => undefined);
  const [playgroundTheme, setPlaygroundTheme] = usePlaygroundTheme();
  const [layout, setLayout] = useState<PlaygroundLayout>("split");
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [previewPadding, setPreviewPadding] = useState(() => !isFullBleedPreview(initialSlug));
  const [previewResetKey, setPreviewResetKey] = useState(0);
  const [previewMenuOpen, setPreviewMenuOpen] = useState(false);
  const [seedReady, setSeedReady] = useState(false);
  const previewMenuRef = useRef<HTMLDivElement | null>(null);
  const layoutBeforeFullWidthRef = useRef<PlaygroundLayout>("split");
  const [seedCode, setSeedCode] = useState(() =>
    resolveInitialCode(initialSlug, initialCategory),
  );
  const [code, setCode] = useState(() => resolveInitialCode(initialSlug, initialCategory));
  const [playgroundContext, setPlaygroundContext] = useState<PlaygroundSourceContext>({
    category: initialCategory,
    slug: initialSlug,
  });
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [chatApiKey, setChatApiKey] = useState("");
  const [chatApiKeyReady, setChatApiKeyReady] = useState(false);
  const [chatSplitSize, setChatSplitSize] = useState(62);
  const [chatSplitReady, setChatSplitReady] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<PlaygroundChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "",
    },
  ]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setChatApiKey(readPlaygroundOpenAiApiKey());
      setChatApiKeyReady(true);
      setChatSplitSize(readPlaygroundChatSplitSize(62));
      setChatSplitReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const onChatSplitSizeChange = useCallback((next: number) => {
    setChatSplitSize(next);
    storePlaygroundChatSplitSize(next);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const seed = readPlaygroundSeed();
      const slug = initialSlug ?? seed?.slug ?? null;
      const category = initialCategory ?? seed?.category ?? null;
      const seedSettings =
        seed && seed.slug === slug && (!category || seed.category === category) ? seed.settings : undefined;
      const exactUsageCode =
        seed && seed.slug === slug && (!category || seed.category === category) ? seed.code : undefined;
      const appearance =
        seed && seed.slug === slug && (!category || seed.category === category) ? seed.appearance : undefined;
      const nextCode = resolveInitialCode(slug, category, seedSettings, exactUsageCode);
      const importedTheme = slug === "app-setup"
        ? (seedSettings as AppSetupSettings | undefined)?.theme
        : undefined;

      setPlaygroundContext({ category, slug });
      setPreviewPadding(!isFullBleedPreview(slug));
      setPreviewError(null);
      setSeedCode(nextCode);
      setCode(nextCode);
      if (appearance) {
        setPreviewAccent(appearance.accent);
        setPreviewAccentSecondary(appearance.accentSecondary);
        setPreviewBaseColor(appearance.baseColor);
        setPreviewFontFamily(appearance.fontFamily as Parameters<typeof setPreviewFontFamily>[0]);
        setPreviewTheme(appearance.theme);
        setPreviewTileAccent(appearance.tileAccent);
        setPreviewTileAccentSecondary(appearance.tileAccentSecondary);
        setPlaygroundTheme(appearance.theme);
      }
      if (importedTheme) {
        setPlaygroundTheme(importedTheme);
      }
      setSeedReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    initialCategory,
    initialSlug,
    setPlaygroundTheme,
    setPreviewAccent,
    setPreviewAccentSecondary,
    setPreviewBaseColor,
    setPreviewFontFamily,
    setPreviewTheme,
    setPreviewTileAccent,
    setPreviewTileAccentSecondary,
  ]);

  useEffect(() => {
    if (playgroundContext.slug !== "app-setup") return;
    setCode((current) => current.includes("OpusAppShell")
      ? patchAppSetupPlaygroundTheme(current, playgroundTheme)
      : current);
  }, [playgroundContext.slug, playgroundTheme]);

  const updateCode = useCallback((nextCode: string) => {
    setPreviewError(null);
    setCode(nextCode);
  }, []);

  const sendChatMessage = useCallback(async (promptOverride?: string) => {
    const prompt = (promptOverride ?? chatInput).trim();
    const apiKey = chatApiKey.trim();

    if (!prompt || chatLoading) {
      return;
    }

    if (!looksLikeOpenAiApiKey(apiKey)) {
      setChatError(t("playground.missingKeyError"));
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
          apiKey,
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
        throw new Error(payload.error ?? t("playground.requestFailed"));
      }

      setChatMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.message ?? t("playground.noTextResponse"),
        },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : t("playground.requestFailed"));
    } finally {
      setChatLoading(false);
    }
  }, [
    chatApiKey,
    chatInput,
    chatLoading,
    chatMessages,
    code,
    playgroundContext.category,
    playgroundContext.slug,
    previewError,
    seedCode,
    playgroundTheme,
    t,
  ]);

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
          <h1 className={styles.paneTitle}>{t("playground.source")}</h1>
          <p className={styles.paneHint}>{t("playground.sourceHint")}</p>
        </div>
      </div>
      <div className={`${styles.paneBody} ${styles.sourcePaneBody}`}>
        <Splitter
          className={styles.sourceChatSplitter}
          flush
          minSize={22}
          onSizeChange={onChatSplitSizeChange}
          orientation="vertical"
          size={chatSplitSize}
          style={{ visibility: chatSplitReady ? "visible" : "hidden" }}
        >
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
          <section className={styles.chatPanel} aria-label={t("playground.chatAria")}>
            <div className={styles.chatHeader}>
              <div>
                <h2 className={styles.chatTitle}>{t("playground.chatTitle")}</h2>
                <p className={styles.chatHint}>{t("playground.chatHint")}</p>
              </div>
              <button
                className={styles.clearChatButton}
                type="button"
                onClick={() => {
                  setChatError(null);
                  setChatMessages([]);
                }}
              >
                {t("playground.clear")}
              </button>
              {previewError ? (
                <button
                  className={styles.fixErrorButton}
                  disabled={chatLoading || !looksLikeOpenAiApiKey(chatApiKey)}
                  type="button"
                  onClick={() => {
                    void sendChatMessage(t("playground.fixPrompt"));
                  }}
                >
                  {t("playground.fixPreviewError")}
                </button>
              ) : null}
            </div>
            <div className={styles.chatApiKeyRow}>
              <label className={styles.chatApiKeyLabel} htmlFor="playground-openai-api-key">
                {t("playground.apiKey")}
              </label>
              <div className={styles.chatApiKeyControls}>
                <input
                  autoComplete="off"
                  className={styles.chatApiKeyInput}
                  disabled={!chatApiKeyReady}
                  id="playground-openai-api-key"
                  placeholder="sk-..."
                  spellCheck={false}
                  type="password"
                  value={chatApiKey}
                  onChange={(event) => {
                    const next = event.target.value;
                    setChatApiKey(next);
                    storePlaygroundOpenAiApiKey(next);
                    if (chatError) {
                      setChatError(null);
                    }
                  }}
                />
                {chatApiKey ? (
                  <button
                    className={styles.clearChatButton}
                    type="button"
                    onClick={() => {
                      setChatApiKey("");
                      storePlaygroundOpenAiApiKey("");
                    }}
                  >
                    {t("playground.remove")}
                  </button>
                ) : null}
              </div>
              <p className={styles.chatApiKeyHint}>{t("playground.apiKeyHint")}</p>
            </div>
            <div className={styles.chatMessages}>
              {chatMessages.map((message) => (
                <div
                  className={`${styles.chatMessage} ${
                    message.role === "user" ? styles.chatMessageUser : styles.chatMessageAssistant
                  }`}
                  key={message.id}
                >
                  <span className={styles.chatRole}>{message.role === "user" ? t("playground.you") : t("playground.chatTitle")}</span>
                  <p>{message.id === "welcome" ? t("playground.welcome") : message.content}</p>
                </div>
              ))}
              {chatLoading ? (
                <div className={`${styles.chatMessage} ${styles.chatMessageAssistant}`}>
                  <span className={styles.chatRole}>{t("playground.chatTitle")}</span>
                  <p>{t("playground.thinking")}</p>
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
                aria-label={t("playground.messageAria")}
                className={styles.chatInput}
                placeholder={
                  looksLikeOpenAiApiKey(chatApiKey)
                    ? t("playground.placeholderWithKey")
                    : t("playground.placeholderWithoutKey")
                }
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
              <button
                className={styles.chatSendButton}
                disabled={chatLoading || !chatInput.trim() || !looksLikeOpenAiApiKey(chatApiKey)}
                type="submit"
              >
                {t("playground.send")}
              </button>
            </form>
          </section>
        </Splitter>
      </div>
    </section>
  );

  const previewPane = (
    <section className={`${styles.pane} ${styles.previewPane}`}>
      <div className={styles.paneHeader}>
        <div>
          <h2 className={styles.paneTitle}>{t("playground.preview")}</h2>
          <p className={styles.paneHint}>{t("playground.previewHint")}</p>
        </div>
        <div className={styles.previewMenuWrap} ref={previewMenuRef}>
          <button
            aria-expanded={previewMenuOpen}
            aria-haspopup="menu"
            aria-label={t("playground.previewOptionsAria")}
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
                <PreviewMenuLabel iconName="border-all" label={t("playground.previewPadding")} />
                <SwitchField
                  checked={previewPadding}
                  id="playground-preview-padding-toggle"
                  label={t("playground.previewPadding")}
                  labelVisuallyHidden
                  mode="flagged"
                  size="sm"
                  onChange={(event) => setPreviewPadding(event.target.checked)}
                />
              </div>
              <div className={styles.previewMenuTheme}>
                <PreviewMenuLabel iconName="circle-half-stroke" label={t("playground.previewTheme")} />
                <ThemeToggleField
                  id="playground-preview-theme-toggle"
                  label={t("playground.previewTheme")}
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
                <PreviewMenuLabel iconName="rotate-left" label={t("playground.resetPreview")} />
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
                <PreviewMenuLabel iconName="up-right-from-square" label={t("playground.openExternal")} />
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
                  <PreviewMenuLabel iconName="compress" label={t("playground.exitFullWidth")} />
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
                  <PreviewMenuLabel iconName="expand" label={t("playground.fullWidth")} />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.paneBody} style={{ visibility: seedReady ? "visible" : "hidden" }}>
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
            <div className={styles.layoutControls} aria-label={t("playground.layoutControlsAria")}>
              <button
                className={styles.layoutButton}
                data-active={layout === "source" ? "true" : undefined}
                type="button"
                onClick={() => setLayout("source")}
              >
                {t("playground.source")}
              </button>
              <button
                className={styles.layoutButton}
                data-active={layout === "split" ? "true" : undefined}
                type="button"
                onClick={resetSplitLayout}
              >
                {t("playground.split")}
              </button>
              <button
                className={styles.layoutButton}
                data-active={layout === "preview" ? "true" : undefined}
                type="button"
                onClick={() => setLayout("preview")}
              >
                {t("playground.preview")}
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
