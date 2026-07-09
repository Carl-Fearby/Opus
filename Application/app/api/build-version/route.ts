import { BUILD_VERSION } from "@/lib/buildVersion";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { buildVersion: BUILD_VERSION },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
