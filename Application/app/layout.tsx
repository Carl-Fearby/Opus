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
  title: "Opus",
  description: "Opus form component library demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <OpusAppShell>{children}</OpusAppShell>
      </body>
    </html>
  );
}
