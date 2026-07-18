import { Suspense } from "react";
import { ExternalPlaygroundPreview } from "@/components/documentation/CodePlayground/ExternalPlaygroundPreview";

export default function ExternalPlaygroundPreviewPage() {
  return (
    <Suspense fallback={null}>
      <ExternalPlaygroundPreview />
    </Suspense>
  );
}
