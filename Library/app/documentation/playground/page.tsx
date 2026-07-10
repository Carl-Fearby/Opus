"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CodePlayground } from "@/components/documentation/CodePlayground";
import { PLAYGROUND_BASE_PATH } from "@/lib/documentation/routes";
import { readPlaygroundSeed } from "@/lib/playground/playgroundNavigation";

function PlaygroundPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  useEffect(() => {
    if (slug) {
      return;
    }

    const seed = readPlaygroundSeed();
    if (!seed) {
      return;
    }

    const params = new URLSearchParams({ slug: seed.slug });
    if (seed.category) {
      params.set("category", seed.category);
    }

    router.replace(`${PLAYGROUND_BASE_PATH}?${params.toString()}`);
  }, [router, slug]);

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
