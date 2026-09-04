import type { AppSetupSettings } from "./types";

type AppTheme = AppSetupSettings["theme"];

export function patchAppSetupPlaygroundTheme(code: string, theme: AppTheme): string {
  return code.replace(/(<OpusAppShell theme=)(["'])(?:dark|light)\2/, `$1$2${theme}$2`);
}

export function generateAppSetupPlaygroundCode({
  accent,
  accentSecondary,
  baseColor,
  fontFamily,
  theme,
  tileAccent,
  tileAccentSecondary,
}: AppSetupSettings): string {
  return `"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  createAccentStyle,
  createBaseStyle,
  createTileAccentStyle,
  DescriptionList,
  Panel,
  PortalHost,
  ThemeProvider,
} from "opus-react";

const appFont = ${JSON.stringify(fontFamily)};
const appAppearance = {
  ...createAccentStyle(${JSON.stringify(accent)}, ${JSON.stringify(accentSecondary)}),
  ...createTileAccentStyle(${JSON.stringify(tileAccent)}, ${JSON.stringify(tileAccentSecondary)}),
  ...createBaseStyle(${JSON.stringify(baseColor)}),
  fontFamily: appFont,
} as CSSProperties;

function OpusAppShell({
  children,
  theme,
}: {
  children: ReactNode;
  theme: "dark" | "light";
}) {
  return (
    <ThemeProvider applyToDocument={false} fontFamily={appFont} theme={theme}>
      <div data-theme={theme} style={appAppearance}>
        <PortalHost id="opus-portal-host">{children}</PortalHost>
      </div>
    </ThemeProvider>
  );
}

export default function Example() {
  return (
    <OpusAppShell theme=${JSON.stringify(theme)}>
      <Panel
        title="Opus application wrapper"
        description="One root boundary applies the design system consistently across the app."
      >
        <DescriptionList
          items={[
            { term: "Theme", details: ${JSON.stringify(theme)} },
            { term: "Font", details: ${JSON.stringify(fontFamily)} },
            { term: "Base colour", details: ${JSON.stringify(baseColor)} },
            { term: "Accent", details: ${JSON.stringify(accent)} },
            { term: "Secondary accent", details: ${JSON.stringify(accentSecondary)} },
            { term: "Tile accent", details: ${JSON.stringify(tileAccent)} },
            { term: "Tile secondary accent", details: ${JSON.stringify(tileAccentSecondary)} },
            { term: "Font token", details: "--opus-font-family" },
            { term: "Portal host", details: "#opus-portal-host" },
          ]}
        />
      </Panel>
    </OpusAppShell>
  );
}`;
}

export function generateAppSetupBoilerplate({ theme }: AppSetupSettings): string {
  return `// Copy these files into a Next.js app.

// app/layout.tsx
import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "opus-react/styles.css";
import "opus-react/index.css";
import "./globals.css";
import { OpusAppShell } from "./OpusAppShell";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "My App",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      data-theme=${JSON.stringify(theme)}
      lang="en-GB"
      style={{ colorScheme: ${JSON.stringify(theme)} }}
      suppressHydrationWarning
    >
      <body className={\`\${spaceGrotesk.variable} \${ibmPlexMono.variable}\`}>
        <OpusAppShell theme=${JSON.stringify(theme)}>{children}</OpusAppShell>
      </body>
    </html>
  );
}

// app/OpusAppShell.tsx
"use client";

import type { ReactNode } from "react";
import { PortalHost, ThemeProvider } from "opus-react";

type OpusAppShellProps = {
  children: ReactNode;
  theme: "dark" | "light";
};

export function OpusAppShell({ children, theme }: OpusAppShellProps) {
  return (
    <ThemeProvider
      fontFamily="var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif"
      theme={theme}
    >
      <PortalHost id="opus-portal-host">{children}</PortalHost>
    </ThemeProvider>
  );
}

// app/page.tsx
import { DescriptionList, Panel } from "opus-react";

export default function HomePage() {
  return (
    <Panel title="My Opus app" description="The global wrapper is active.">
      <DescriptionList
        items={[
          { term: "Theme", details: ${JSON.stringify(theme)} },
          { term: "Font", details: "Space Grotesk" },
          { term: "Portal host", details: "Ready" },
        ]}
      />
    </Panel>
  );
}`;
}
