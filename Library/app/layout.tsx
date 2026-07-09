import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "../packages/opus-react/dist/flags.css";
import "./globals.css";
import "./preview-theme.css";
import { ThemeBootstrapScript } from "@/components/theme/ThemeBootstrapScript";
import { readServerPreviewTheme, readServerTheme } from "@/lib/theme/readServerTheme";

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
        {children}
      </body>
    </html>
  );
}
