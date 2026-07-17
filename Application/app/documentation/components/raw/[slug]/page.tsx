import { notFound } from "next/navigation";
import { ControlRaw } from "@/components/control-detail/ControlRaw";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { getAllSlugs, getControl } from "@/lib/controls/registry";
import type { ControlSlug } from "@/lib/controls/types";

type ControlRawPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ config?: string | string[]; preview?: string | string[] }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ControlRawPageProps) {
  const { slug } = await params;
  const control = getControl(slug);

  if (!control) {
    return { title: "Control not found" };
  }

  return {
    title: `${control.title} (raw) | Opus`,
    description: control.description,
  };
}

export default async function ControlRawPage({ params, searchParams }: ControlRawPageProps) {
  const { slug } = await params;
  const { config, preview } = await searchParams;
  const control = getControl(slug);

  if (!control) {
    notFound();
  }

  const encodedSettings = Array.isArray(config) ? config[0] : config;
  const previewId = Array.isArray(preview) ? preview[0] : preview;

  return (
    <ControlRaw
      defaultSettings={getDefaultSettings(slug as ControlSlug)}
      encodedSettings={encodedSettings}
      previewId={previewId}
      slug={slug as ControlSlug}
    />
  );
}
