"use client";

import type { ReactNode } from "react";
import { DeployUpdateNotifier } from "@/components/DeployUpdateNotifier";

export function OpusAppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <DeployUpdateNotifier />
      {children}
    </>
  );
}
