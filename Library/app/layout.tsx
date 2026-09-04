import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../packages/opus-react/dist/index.css";
import "./globals.css";
import "./preview-theme.css";
import { ThemeBootstrapScript } from "@/components/theme/ThemeBootstrapScript";
import { createAccentStyle } from "@/lib/theme/accentThemeStorage";
import { readServerAccent, readServerPreviewTheme, readServerTheme } from "@/lib/theme/readServerTheme";

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
  title: "Opus",
  description: "Opus form component library demo",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await readServerTheme();
  const previewTheme = await readServerPreviewTheme();
  const accent = await readServerAccent();

  return (
    <html
      data-preview-theme={previewTheme}
      data-shell-theme={theme}
      lang="en-GB"
      style={{ colorScheme: theme, ...createAccentStyle(accent.accent, accent.accentSecondary) }}
      suppressHydrationWarning
    >
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <ThemeBootstrapScript />
        {children}
      </body>
    </html>
  );
}
