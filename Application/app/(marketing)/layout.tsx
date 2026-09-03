import type { Metadata } from "next";
import { MarketingAtmosphere } from "@/components/marketing/MarketingAtmosphere";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import "./marketing.css";

export const metadata: Metadata = {
  title: {
    default: "Opus — Design system for modern business apps",
    template: "%s · Opus",
  },
  description:
    "Build production React interfaces for internal tools, CRM, and operations apps. Install opus-react, browse the catalogue, and try components in the AI-assisted Playground.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketingSite">
      <MarketingAtmosphere />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
