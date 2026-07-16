import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "../packages/opus-react/dist/flags.css";
import "../packages/opus-react/dist/index.css";
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

const performanceMeasureGuardScript = `
(() => {
  const performanceRef = window.performance;

  if (!performanceRef || performanceRef.__opusMeasureGuard === true) {
    return;
  }

  const nativeMeasure = performanceRef.measure.bind(performanceRef);

  Object.defineProperty(performanceRef, "__opusMeasureGuard", {
    configurable: false,
    enumerable: false,
    value: true,
  });

  Object.defineProperty(performanceRef, "measure", {
    configurable: true,
    value(name, startOrOptions, endMark) {
      if (startOrOptions && typeof startOrOptions === "object") {
        const options = { ...startOrOptions };
        const start = Number(options.start);
        const end = Number(options.end);

        if (Number.isFinite(start) && start < 0) {
          options.start = 0;
        }

        if (Number.isFinite(end) && end < 0) {
          options.end = 0;
        }

        if (
          Number.isFinite(Number(options.start)) &&
          Number.isFinite(Number(options.end)) &&
          Number(options.end) < Number(options.start)
        ) {
          options.end = options.start;
        }

        try {
          return nativeMeasure(name, options);
        } catch (error) {
          if (String(error && error.message).includes("negative time stamp")) {
            return nativeMeasure(name, { ...options, start: 0, end: 0 });
          }

          throw error;
        }
      }

      return nativeMeasure(name, startOrOptions, endMark);
    },
  });
})();
`;

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
        <script dangerouslySetInnerHTML={{ __html: performanceMeasureGuardScript }} />
        <ThemeBootstrapScript />
        {children}
      </body>
    </html>
  );
}
