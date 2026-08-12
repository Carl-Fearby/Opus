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
    "Build production React interfaces with 267 documented Opus catalogue entries and an AI-assisted Playground that gives ChatGPT live component source, preview context, and runtime errors.",
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
