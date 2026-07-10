"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CodePlayground } from "@/components/documentation/CodePlayground";

function PlaygroundPageContent() {
  const searchParams = useSearchParams();

  return (
    <CodePlayground
      initialCategory={searchParams.get("category")}
      initialSlug={searchParams.get("slug")}
    />
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <PlaygroundPageContent />
    </Suspense>
  );
}
