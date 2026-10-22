"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOpusPortalAppearance } from "@/components/OpusThemeProvider";

/** Keep scoped theme tokens when a control renders outside its provider's DOM. */
function PortalAppearance({ children }: { children: ReactNode }) {
  const appearance = useOpusPortalAppearance();
  if (!appearance) return <>{children}</>;
  return (
    <div
      data-opus-appearance={appearance.appearance}
      data-theme={appearance.theme}
      style={{
        ...appearance.style,
        color: "var(--opus-text)",
        colorScheme: appearance.theme,
        display: "contents",
        fontFamily: "var(--opus-font-family, inherit)",
      }}
    >
      {children}
    </div>
  );
}

export function createThemedPortal(children: ReactNode, container: Element | DocumentFragment, key?: string | null) {
  return createPortal(<PortalAppearance>{children}</PortalAppearance>, container, key);
}
