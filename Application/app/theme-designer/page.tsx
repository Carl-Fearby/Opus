import type { Metadata } from "next";
import { ThemeDesignerPage } from "@/components/documentation/ThemeDesignerPage";

export const metadata: Metadata = {
  title: "Theme designer | Opus",
  description:
    "Build an Opus theme in the browser: pick an appearance such as neumorphism or liquid glass, set global defaults, and preview it on live components.",
  alternates: { canonical: "/theme-designer" },
};

export default function ThemeDesigner() {
  return <ThemeDesignerPage />;
}
