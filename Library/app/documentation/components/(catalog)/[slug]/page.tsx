import { notFound } from "next/navigation";
import { ControlDetail } from "@/components/control-detail/ControlDetail";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { getAllSlugs, getControl } from "@/lib/controls/registry";
import type { ControlSlug } from "@/lib/controls/types";
import { getComponentDocumentation } from "@/lib/documentation/componentDocs";
import { localizeComponentDocumentation } from "@/lib/i18n/componentDocumentation";
import { readServerLocale } from "@/lib/i18n/server";

type ControlPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ControlPageProps) {
  const { slug } = await params;
  const control = getControl(slug);

  if (!control) {
    return { title: "Control not found" };
  }

  return {
    title: `${control.title} | Opus`,
    description: control.description,
  };
}

export default async function ControlPage({ params }: ControlPageProps) {
  const { slug } = await params;
  const control = getControl(slug);

  if (!control) {
    notFound();
  }

  const defaultSettings = getDefaultSettings(slug as ControlSlug);
  const locale = await readServerLocale();
  const docs = getComponentDocumentation(slug as ControlSlug)?.content;

  return (
    <ControlDetail
      control={control}
      defaultSettings={defaultSettings}
      documentation={docs ? localizeComponentDocumentation(locale, slug, docs) : undefined}
    />
  );
}
