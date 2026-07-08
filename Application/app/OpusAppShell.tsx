"use client";

import { OpusThemeProvider } from "opus-react";
import type { ReactNode } from "react";

export function OpusAppShell({ children }: { children: ReactNode }) {
  return <OpusThemeProvider theme="dark">{children}</OpusThemeProvider>;
}
