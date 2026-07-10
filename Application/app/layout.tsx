import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "opus-react/styles.css";
import "opus-react/index.css";
import "./globals.css";
import "./preview-theme.css";
import { ThemeBootstrapScript } from "@/components/theme/ThemeBootstrapScript";
import { readServerPreviewTheme, readServerTheme } from "@/lib/theme/readServerTheme";
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
  title: {
    default: "Opus — Design system for modern business apps",
    template: "%s · Opus",
  },
  description:
    "Opus is a themeable React component library for forms, dashboards, overlays, and data-rich interfaces — with live documentation and a Code Playground.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await readServerTheme();
  const previewTheme = await readServerPreviewTheme();

  return (
    <html
      data-preview-theme={previewTheme}
      data-shell-theme={theme}
      data-theme={theme}
      lang="en-GB"
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <ThemeBootstrapScript />
        <OpusAppShell>{children}</OpusAppShell>
      </body>
    </html>
  );
}
