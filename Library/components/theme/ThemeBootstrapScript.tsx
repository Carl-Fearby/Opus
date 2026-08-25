import Script from "next/script";
import { COMPONENTS_THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme/componentsThemeStorage";

export function ThemeBootstrapScript() {
  return (
    // This renders from the root layout, where the bootstrap must run before
    // hydration to avoid applying the wrong persisted theme for one frame.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{ __html: COMPONENTS_THEME_BOOTSTRAP_SCRIPT }}
      id="opus-theme-bootstrap"
      strategy="beforeInteractive"
    />
  );
}
