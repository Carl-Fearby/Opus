import { NextRequest, NextResponse } from "next/server";

type StoredPreview = {
  code: string;
  createdAt: number;
  padded: boolean;
  theme: string;
};

const STORE_KEY = "__opusPlaygroundPreviewStore";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const globalStore = globalThis as typeof globalThis & { [STORE_KEY]?: Map<string, StoredPreview> };
const previews = (globalStore[STORE_KEY] ??= new Map<string, StoredPreview>());

function removeExpiredPreviews() {
  const cutoff = Date.now() - MAX_AGE_MS;
  for (const [id, preview] of previews) {
    if (preview.createdAt < cutoff) previews.delete(id);
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    id?: unknown;
    payload?: { code?: unknown; padded?: unknown; theme?: unknown };
  };
  const { id, payload } = body;

  if (
    typeof id !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(id) ||
    typeof payload?.code !== "string" ||
    payload.code.length > 2_000_000 ||
    typeof payload.theme !== "string"
  ) {
    return NextResponse.json({ error: "Invalid preview payload" }, { status: 400 });
  }

  removeExpiredPreviews();
  previews.set(id, {
    code: payload.code,
    createdAt: Date.now(),
    padded: payload.padded !== false,
    theme: payload.theme,
  });

  return NextResponse.json({ id }, { status: 201 });
}

export function GET(request: NextRequest) {
  removeExpiredPreviews();
  const id = request.nextUrl.searchParams.get("id");
  const preview = id ? previews.get(id) : undefined;

  if (!preview) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: preview.code,
    padded: preview.padded,
    theme: preview.theme,
  });
}
