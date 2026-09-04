import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "opus-react/index.css";
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
  metadataBase: new URL("https://project-opus.netlify.app"),
  title: "Opus — Free, open-source React component library",
  description:
    "Opus is a free, open-source React component library and visual design system for accessible business applications, internal tools, CRM, and operations products.",
  applicationName: "Opus",
  alternates: { canonical: "/" },
  keywords: [
    "free React component library",
    "open-source React component library",
    "React design system",
    "accessible business UI components",
    "internal tools UI",
    "Opus",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Opus",
    title: "Opus — Free, open-source React component library",
    description:
      "Themeable, accessible React components for internal tools, CRM, operations, and business applications.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opus — Free, open-source React component library",
    description:
      "Themeable, accessible React components for internal tools, CRM, operations, and business applications.",
  },
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

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Opus",
      url: "https://project-opus.netlify.app",
      description: "A free, open-source, not-for-profit React component library and design system.",
      sameAs: ["https://github.com/Carl-Fearby/Opus"],
    },
    {
      "@type": "WebSite",
      name: "Opus",
      url: "https://project-opus.netlify.app",
      description: "Free, open-source React components and documented design-system tooling for business applications.",
      publisher: { "@type": "Organization", name: "Opus" },
    },
    {
      "@type": "SoftwareApplication",
      name: "opus-react",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      license: "https://github.com/Carl-Fearby/Opus/blob/main/LICENSE",
      codeRepository: "https://github.com/Carl-Fearby/Opus",
      downloadUrl: "https://www.npmjs.com/package/opus-react",
      url: "https://project-opus.netlify.app/documentation/components",
      description: "A free, open-source React component library with live documentation, visual theming, and accessible business UI components.",
    },
  ],
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

const fontBootstrapScript = `
(() => {
  try {
    const family = window.localStorage.getItem("opus-components-font");
    if (!family) return;
    const safeFamily = family.replace(/'/g, "\\\\'");
    document.documentElement.style.setProperty(
      "--opus-font-family",
      "'" + safeFamily + "', ui-sans-serif, system-ui, sans-serif"
    );
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" +
      encodeURIComponent(family).replace(/%20/g, "+") + "&display=swap";
    document.head.appendChild(link);
  } catch {}
})();
`;

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData) }}
        />
        <script dangerouslySetInnerHTML={{ __html: fontBootstrapScript }} />
        <script dangerouslySetInnerHTML={{ __html: performanceMeasureGuardScript }} />
        <ThemeBootstrapScript />
        {children}
      </body>
    </html>
  );
}
