import { notFound } from "next/navigation";
import { ControlDetail } from "@/components/control-detail/ControlDetail";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { getAllSlugs, getControl } from "@/lib/controls/registry";
import type { ControlSlug } from "@/lib/controls/types";
import { getComponentDocumentation } from "@/lib/documentation/componentDocs";

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

  return (
    <ControlDetail
      control={control}
      defaultSettings={defaultSettings}
      documentation={getComponentDocumentation(slug as ControlSlug)?.content}
    />
  );
}
