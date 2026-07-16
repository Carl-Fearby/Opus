import { NextResponse } from "next/server";

type PlaygroundChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type PlaygroundChatRequest = {
  code?: string;
  componentCategory?: string | null;
  componentSlug?: string | null;
  messages?: PlaygroundChatMessage[];
  previewError?: string | null;
  seedCode?: string;
  theme?: string;
};

function outputTextFromResponse(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const outputText = (payload as { output_text?: unknown }).output_text;
  if (typeof outputText === "string") {
    return outputText;
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) {
        return [];
      }

      return content.flatMap((part) => {
        if (!part || typeof part !== "object") {
          return [];
        }

        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? [text] : [];
      });
    })
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Set OPENAI_API_KEY on the server to enable playground chat." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as PlaygroundChatRequest;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const code = typeof body.code === "string" ? body.code : "";
  const previewError = typeof body.previewError === "string" ? body.previewError : "";
  const seedCode = typeof body.seedCode === "string" ? body.seedCode : "";
  const componentSlug = typeof body.componentSlug === "string" ? body.componentSlug : "unknown";
  const componentCategory = typeof body.componentCategory === "string" ? body.componentCategory : "unknown";
  const theme = typeof body.theme === "string" ? body.theme : "unknown";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_PLAYGROUND_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "developer",
          content:
            "You are helping inside the Opus component playground. Diagnose React, TypeScript, CSS, Three.js, and Opus UI playground code. The playground strips imports before compiling but exposes React hooks, THREE/three, Opus components, demo data, and FontAwesomeIcon in scope. Valid playground code must export default function Example(). If a preview error is present, prioritize fixing it. When asked to fix code, return the smallest safe change or a complete corrected playground source, and explain why.",
        },
        {
          role: "user",
          content: [
            "Playground context:",
            `Component slug: ${componentSlug}`,
            `Component category: ${componentCategory}`,
            `Preview theme: ${theme}`,
            "",
            "Current preview error:",
            previewError || "(none)",
            "",
            "Generated seed source:",
            seedCode || "(none)",
            "",
            "Current edited playground source:",
            code || "(empty)",
          ].join("\n"),
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const error =
      payload && typeof payload === "object" && "error" in payload
        ? (payload as { error?: { message?: string } }).error?.message
        : undefined;
    return NextResponse.json({ error: error ?? "OpenAI request failed." }, { status: response.status });
  }

  const text = outputTextFromResponse(payload);
  return NextResponse.json({ message: text || "I could not find a text response." });
}
