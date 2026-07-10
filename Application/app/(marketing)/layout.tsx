import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import "./marketing.css";

export const metadata: Metadata = {
  title: {
    default: "Opus — Design system for modern business apps",
    template: "%s · Opus",
  },
  description:
    "Opus is a themeable React component library for forms, dashboards, overlays, and data-rich interfaces — with live documentation and a Code Playground.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketingSite">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
