import { Suspense } from "react";
import { ExternalPlaygroundPreview } from "@/components/documentation/CodePlayground/ExternalPlaygroundPreview";
import type { Theme } from "@/components/fields/types";

type ExternalPlaygroundPreviewPageProps = {
  searchParams: Promise<{ theme?: string }>;
};

function parseExternalTheme(value: string | undefined): Theme {
  return value === "light" ? "light" : "dark";
}

export default async function ExternalPlaygroundPreviewPage({ searchParams }: ExternalPlaygroundPreviewPageProps) {
  const theme = parseExternalTheme((await searchParams).theme);
  const themeBootstrap = `(function(){var t=${JSON.stringify(theme)};var r=document.documentElement;r.setAttribute("data-shell-theme",t);r.setAttribute("data-preview-theme",t);r.setAttribute("data-theme",t);r.style.colorScheme=t;window.__OPUS_THEME__=t;window.__OPUS_PREVIEW_THEME__=t;}());`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      <Suspense fallback={null}>
        <ExternalPlaygroundPreview />
      </Suspense>
    </>
  );
}
