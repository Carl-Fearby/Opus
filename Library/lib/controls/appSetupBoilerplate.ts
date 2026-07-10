import type { AppSetupSettings } from "./types";

type AppTheme = AppSetupSettings["theme"];

export function patchAppSetupPlaygroundTheme(code: string, theme: AppTheme): string {
  return code.replace(/(<OpusAppShell theme=)(["'])(?:dark|light)\2/, `$1$2${theme}$2`);
}

export function generateAppSetupPlaygroundCode({ theme }: AppSetupSettings): string {
  return `"use client";

import { useState, type ReactNode } from "react";
import { Button, Drawer, PortalHost, ThemeProvider } from "opus-react";

function OpusAppShell({
  children,
  theme,
}: {
  children: ReactNode;
  theme: "dark" | "light";
}) {
  return (
    <ThemeProvider theme={theme}>
      <PortalHost id="opus-portal-host">{children}</PortalHost>
    </ThemeProvider>
  );
}

export default function Example() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <OpusAppShell theme=${JSON.stringify(theme)}>
      <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
      <Drawer
        open={drawerOpen}
        title="Filters"
        onClose={() => setDrawerOpen(false)}
      >
        <p>Drawer, dialog, modal, and other overlays portal automatically.</p>
      </Drawer>
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
    <ThemeProvider theme={theme}>
      <PortalHost id="opus-portal-host">{children}</PortalHost>
    </ThemeProvider>
  );
}

// app/page.tsx
"use client";

import { Button, Drawer } from "opus-react";
import { useState } from "react";

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
      <Drawer
        open={drawerOpen}
        title="Filters"
        onClose={() => setDrawerOpen(false)}
      >
        <p>Drawer, dialog, modal, and other overlays portal automatically.</p>
      </Drawer>
    </>
  );
}`;
}
