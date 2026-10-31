"use client";

import { useState, type CSSProperties } from "react";
import { accentPalette, type AccentColor } from "@/components/AccentColorPicker";
import {
  Badge,
  Button,
  Card,
  CheckboxField,
  DEFAULT_FONT_FAMILY,
  DashboardContentContainer,
  googleFonts,
  Panel,
  ProgressBar,
  SearchBox,
  SelectField,
  Splitter,
  StatCard,
  SyntaxHighlighter,
  TextField,
  Tabs,
  ThemeToggleField,
  Tiles,
  type ControlRadius,
  type ControlTransparency,
  type GoogleFontFamily,
} from "opus-react";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { PreviewThemeBoundary } from "@/components/control-detail/ControlDetail/PreviewThemeBoundary";
import { PreviewPlatformSelector } from "@/components/control-detail/ControlDetail/PreviewThemeControls";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./ThemeDesignerPage.module.css";

type ColourControlProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

function Blob({ colour, className = styles.blob }: { colour: string; className?: string }) {
  return <span aria-hidden="true" className={className} style={{ "--theme-blob": colour } as CSSProperties} />;
}

function ColourControl({ label, value, onChange, open, onToggle, onClose }: ColourControlProps) {
  const { t } = useLocale();
  const selected = accentPalette.find((colour) => colour.value.toLowerCase() === value.toLowerCase());

  return (
    <div className={styles.colourControl}>
      <span className={styles.colourLabel}>{label}</span>
      <button
        type="button"
        className={styles.colourTrigger}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={onToggle}
      >
        <Blob colour={value} />
        <span>{selected?.label ?? t("themeDesigner.custom")}</span>
        <code>{value.toUpperCase()}</code>
        <span className={styles.chevron} />
      </button>
      {open ? (
        <div className={styles.blobPalette} role="listbox" aria-label={t("themeDesigner.coloursAria", { label })}>
          {accentPalette.map((colour: AccentColor) => {
            const isSelected = colour.value.toLowerCase() === value.toLowerCase();
            return (
              <button
                key={colour.value}
                type="button"
                role="option"
                aria-label={colour.label}
                aria-selected={isSelected}
                className={styles.blobOption}
                onClick={() => {
                  onChange(colour.value);
                  onClose();
                }}
              >
                <Blob colour={colour.value} className={styles.optionBlob} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ThemeDesignerControls() {
  const { t } = useLocale();
  const [openColour, setOpenColour] = useState<string | null>(null);
  const appearanceOptions = [
    { value: "standard", label: t("themeDesigner.standard") },
    { value: "neumorphism", label: t("themeDesigner.neumorphism") },
    { value: "liquid-glass", label: t("themeDesigner.liquidGlass") },
  ] as const;
  const radiusOptions = [
    { value: "none", label: t("themeDesigner.square") },
    { value: "standard", label: t("themeDesigner.standard") },
    { value: "medium", label: t("themeDesigner.medium") },
    { value: "large", label: t("themeDesigner.large") },
    { value: "full", label: t("themeDesigner.pill") },
  ] as const;
  const backgroundOptions = [
    { value: "standard", label: t("themeDesigner.solid") },
    { value: "none", label: t("themeDesigner.transparent") },
    { value: "glass", label: t("themeDesigner.glass") },
  ] as const;
  const {
    previewAccent,
    previewAccentSecondary,
    previewBaseColor,
    previewDefaults,
    previewFontFamily,
    previewTertiaryAccent,
    previewTheme,
    previewTileAccent,
    previewTileAccentSecondary,
    setPreviewAccent,
    setPreviewAccentSecondary,
    setPreviewBaseColor,
    setPreviewDefaults,
    setPreviewFontFamily,
    setPreviewTertiaryAccent,
    setPreviewTheme,
    setPreviewTileAccent,
    setPreviewTileAccentSecondary,
  } = useComponentsTheme();

  const updateDefaults = (updates: Partial<typeof previewDefaults>) => {
    setPreviewDefaults({ ...previewDefaults, ...updates });
  };

  const resetTheme = () => {
    setPreviewTheme("dark");
    setPreviewFontFamily(DEFAULT_FONT_FAMILY);
    setPreviewDefaults({ radius: "standard", transparency: "standard", gradient: false });
    setPreviewBaseColor("#64748b");
    setPreviewAccent("#8f6cff");
    setPreviewAccentSecondary("#0284c7");
    setPreviewTertiaryAccent("#0ea5e9");
    setPreviewTileAccent("#ec4899");
    setPreviewTileAccentSecondary("#0ea5e9");
    setOpenColour(null);
  };

  return (
    <aside className={styles.controls} aria-label={t("themeDesigner.controlsAria")}>
      <div className={styles.controlGroup}>
        <p className={styles.controlTitle}>{t("themeDesigner.appearance")}</p>
        <SelectField
          id="theme-designer-style"
          label={t("themeDesigner.themeStyle")}
          options={appearanceOptions.map((option) => option.label)}
          value={appearanceOptions.find((option) => option.value === (previewDefaults.appearance ?? "standard"))?.label ?? appearanceOptions[0].label}
          onChange={(event) => {
            const option = appearanceOptions.find((entry) => entry.label === event.target.value);
            if (option) updateDefaults({ appearance: option.value });
          }}
        />
        <ThemeToggleField
          id="theme-designer-appearance"
          label={t("themeDesigner.previewTheme")}
          value={previewTheme}
          onChange={setPreviewTheme}
        />
        <SelectField
          id="theme-designer-font"
          label={t("themeDesigner.fontFamily")}
          options={[...googleFonts]}
          value={previewFontFamily}
          onChange={(event) => setPreviewFontFamily(event.target.value as GoogleFontFamily)}
        />
      </div>

      <div className={styles.controlGroup}>
        <p className={styles.controlTitle}>{t("themeDesigner.globalDefaults")}</p>
        <SelectField
          id="theme-designer-radius"
          label={t("themeDesigner.cornerRadius")}
          options={radiusOptions.map((option) => option.label)}
          value={radiusOptions.find((option) => option.value === (previewDefaults.radius ?? "standard"))?.label ?? radiusOptions[0].label}
          onChange={(event) => {
            const option = radiusOptions.find((entry) => entry.label === event.target.value);
            if (option) updateDefaults({ radius: option.value as ControlRadius });
          }}
        />
        <SelectField
          id="theme-designer-transparency"
          label={t("themeDesigner.surfaceBackground")}
          options={backgroundOptions.map((option) => option.label)}
          value={backgroundOptions.find((option) => option.value === (previewDefaults.transparency ?? "standard"))?.label ?? backgroundOptions[0].label}
          onChange={(event) => {
            const option = backgroundOptions.find((entry) => entry.label === event.target.value);
            if (option) updateDefaults({ transparency: option.value as ControlTransparency });
          }}
        />
        <CheckboxField
          checked={previewDefaults.gradient ?? false}
          id="theme-designer-gradient"
          label={t("themeDesigner.useGradient")}
          onChange={(event) => updateDefaults({ gradient: event.target.checked })}
        />
      </div>

      <div className={styles.controlGroup}>
        <p className={styles.controlTitle}>{t("themeDesigner.colours")}</p>
        <div className={styles.colourGrid}>
          <ColourControl label={t("themeDesigner.base")} value={previewBaseColor} onChange={setPreviewBaseColor} open={openColour === "base"} onToggle={() => setOpenColour(openColour === "base" ? null : "base")} onClose={() => setOpenColour(null)} />
          <ColourControl label={t("themeDesigner.accent")} value={previewAccent} onChange={setPreviewAccent} open={openColour === "accent"} onToggle={() => setOpenColour(openColour === "accent" ? null : "accent")} onClose={() => setOpenColour(null)} />
          <ColourControl label={t("themeDesigner.secondaryAccent")} value={previewAccentSecondary} onChange={setPreviewAccentSecondary} open={openColour === "secondary"} onToggle={() => setOpenColour(openColour === "secondary" ? null : "secondary")} onClose={() => setOpenColour(null)} />
          <ColourControl label={t("themeDesigner.tertiaryAccent")} value={previewTertiaryAccent} onChange={setPreviewTertiaryAccent} open={openColour === "tertiary"} onToggle={() => setOpenColour(openColour === "tertiary" ? null : "tertiary")} onClose={() => setOpenColour(null)} />
          <ColourControl label={t("themeDesigner.tileAccent")} value={previewTileAccent} onChange={setPreviewTileAccent} open={openColour === "tile"} onToggle={() => setOpenColour(openColour === "tile" ? null : "tile")} onClose={() => setOpenColour(null)} />
          <ColourControl label={t("themeDesigner.tileSecondary")} value={previewTileAccentSecondary} onChange={setPreviewTileAccentSecondary} open={openColour === "tile-secondary"} onToggle={() => setOpenColour(openColour === "tile-secondary" ? null : "tile-secondary")} onClose={() => setOpenColour(null)} />
        </div>
      </div>

      <div className={styles.resetGroup}>
        <Button variant="secondary" onClick={resetTheme}>{t("themeDesigner.reset")}</Button>
      </div>
    </aside>
  );
}

export function ThemeDesignerPage() {
  const { t } = useLocale();
  const [optionsSize, setOptionsSize] = useState(18);
  const {
    previewAccent,
    previewAccentSecondary,
    previewBaseColor,
    previewDefaults,
    previewFontFamily,
    previewTertiaryAccent,
    previewTheme,
    previewTileAccent,
    previewTileAccentSecondary,
  } = useComponentsTheme();
  const themeCode = `import {
  OpusThemeProvider,
  createAccentStyle,
  createBaseStyle,
  createTileAccentStyle,
} from "opus-react";

const themeStyle = {
  ...createAccentStyle("${previewAccent}", "${previewAccentSecondary}", "${previewTertiaryAccent}"),
  ...createTileAccentStyle("${previewTileAccent}", "${previewTileAccentSecondary}"),
  ...createBaseStyle("${previewBaseColor}"),
};

const themeDefaults = {
  appearance: "${previewDefaults.appearance ?? "standard"}",
  radius: "${previewDefaults.radius ?? "standard"}",
  transparency: "${previewDefaults.transparency ?? "standard"}",
  gradient: ${previewDefaults.gradient ?? false},
};

export function App({ children }) {
  return (
    <OpusThemeProvider
      theme="${previewTheme}"
      fontFamily="${previewFontFamily}"
      style={themeStyle}
      defaults={themeDefaults}
    >
      {children}
    </OpusThemeProvider>
  );
}`;

  return (
    <main className={styles.shell}>
      <DocumentationTopBar current="theme" />
      <section className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{t("themeDesigner.eyebrow")}</p>
          <h1>{t("themeDesigner.title")}</h1>
          <p>{t("themeDesigner.description")}</p>
        </header>

        <Splitter className={styles.designer} flush minSize={15} onSizeChange={setOptionsSize} size={optionsSize}>
          <section className={styles.optionsPane}>
            <ThemeDesignerControls />
          </section>
          <section className={styles.previewPane}>
            <Tabs
              aria-label={t("themeDesigner.demoAria")}
              className={styles.previewTabs}
              panelClassName={styles.previewTabPanel}
              panelContentClassName={styles.previewTabContent}
              variant="card"
              items={[{
                label: t("themeDesigner.preview"),
                value: "preview",
                content: <PreviewThemeBoundary className={styles.canvas}>
            <div className={styles.previewPlatformBar}>
              <span>{previewDefaults.appearance === "liquid-glass" ? t("themeDesigner.liquidGlassPlatform") : t("themeDesigner.previewPlatform")}</span>
              <PreviewPlatformSelector />
            </div>
            <Tiles
              className={styles.tilesPreview}
              items={[
                { id: "overview", icon: "folder", label: "Overview", tone: "purple" },
                { id: "components", icon: "building", label: "Components", tone: "blue" },
                { id: "themes", icon: "bell", label: "Themes", tone: "purple" },
                { id: "team", icon: "users", label: "Team", tone: "blue" },
                { id: "activity", icon: "chart-line", label: "Activity", tone: "purple" },
                { id: "automations", icon: "gears", label: "Automations", tone: "blue" },
                { id: "assets", icon: "cube", label: "Assets", tone: "purple" },
                { id: "security", icon: "shield-halved", label: "Security", tone: "blue" },
              ]}
            />
            <div className={styles.grid}>
              <div className={styles.searchBoxPreview}>
                <SearchBox
                  ariaLabel="Search the library"
                  label="Search the library"
                  labelVisuallyHidden={false}
                  categories={[
                    { label: "All categories", value: "all" },
                    { label: "Components", value: "components" },
                    { label: "Documentation", value: "documentation" },
                    { label: "Accessibility", value: "accessibility" },
                    { label: "Analytics", value: "analytics" },
                    { label: "Authentication", value: "authentication" },
                    { label: "Automation", value: "automation" },
                    { label: "Billing", value: "billing" },
                    { label: "Content", value: "content" },
                    { label: "Dashboards", value: "dashboards" },
                    { label: "Data visualisation", value: "data-visualisation" },
                    { label: "Developer tools", value: "developer-tools" },
                    { label: "Integrations", value: "integrations" },
                    { label: "Marketing", value: "marketing" },
                    { label: "Navigation", value: "navigation" },
                    { label: "Notifications", value: "notifications" },
                    { label: "Onboarding", value: "onboarding" },
                    { label: "Overlays", value: "overlays" },
                    { label: "Reporting", value: "reporting" },
                    { label: "Security", value: "security" },
                    { label: "Settings", value: "settings" },
                    { label: "Workflows", value: "workflows" },
                  ]}
                  defaultCategory="all"
                  placeholder="Search for anything"
                  onSearch={() => undefined}
                />
                <p>{previewDefaults.appearance === "liquid-glass" ? "Smoked glass, soft reflections and luminous edges. Switch colour modes to explore both finishes." : previewDefaults.appearance === "neumorphism" ? "One shared surface, with raised actions and recessed inputs." : "The search action uses the global tertiary accent."}</p>
              </div>
              <div className={styles.widgetGrid} aria-label="Dashboard widget preview">
                <DashboardContentContainer className={styles.widgetBackground} width="full">
                  <StatCard label="Monthly visitors" value="24,892" change="12.4%" trend="up" icon={<span aria-hidden="true">↗</span>} />
                </DashboardContentContainer>
                <DashboardContentContainer className={styles.widgetBackground} width="full">
                  <StatCard label="Conversion rate" value="8.6%" change="1.8%" trend="up" icon={<span aria-hidden="true">◎</span>} />
                </DashboardContentContainer>
                <DashboardContentContainer className={styles.widgetBackground} width="full">
                  <StatCard label="Open tasks" value="18" change="4.0%" trend="down" icon={<span aria-hidden="true">✓</span>} />
                </DashboardContentContainer>
              </div>
              <div className={styles.widgetPanel}>
                <DashboardContentContainer width="full" title="Widget background">
                  <Panel
                    title="Project health"
                    description="An inner surface against the themed widget background."
                    actions={<Badge label="On track" variant="solid" />}
                    footer={<Button variant="ghost">View report</Button>}
                  >
                    <div className={styles.progressList}>
                      <ProgressBar label="Design system" value={82} />
                      <ProgressBar label="Documentation" value={64} />
                      <ProgressBar label="Accessibility" value={91} />
                    </div>
                  </Panel>
                </DashboardContentContainer>
              </div>
              <Card title="Profile details" actions={<><Button>Save changes</Button><Button variant="secondary">Cancel</Button></>}>
                <TextField id="theme-designer-name" label="Full name" placeholder="Jane Cooper" type="text" value="Jane Cooper" onChange={() => undefined} />
                <SelectField id="theme-designer-role" label="Role" options={["Administrator", "Editor", "Viewer"]} value="Editor" onChange={() => undefined} />
              </Card>
              <Card title="Notifications" actions={<><Button variant="tertiary">Invite member</Button><Button variant="ghost">Learn more</Button></>}>
                <p>See borders, panels, typography, and action colours together.</p>
                <div className={styles.badges}><Badge label="New" /><Badge label="Review" variant="outline" /><Badge label="Active" variant="solid" /></div>
              </Card>
            </div>
                </PreviewThemeBoundary>,
              }, {
                label: t("themeDesigner.themeCode"),
                value: "code",
                content: <div className={styles.codePanel}>
                  <p>{t("themeDesigner.codeNote")}</p>
                  <SyntaxHighlighter code={themeCode} language="tsx" />
                </div>,
              }]}
            />
          </section>
        </Splitter>
      </section>
    </main>
  );
}
