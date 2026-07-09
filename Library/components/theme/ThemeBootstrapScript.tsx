import Script from "next/script";
import { COMPONENTS_THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme/componentsThemeStorage";

export function ThemeBootstrapScript() {
  return (
    <Script
      dangerouslySetInnerHTML={{ __html: COMPONENTS_THEME_BOOTSTRAP_SCRIPT }}
      id="opus-theme-bootstrap"
      strategy="beforeInteractive"
    />
  );
}
