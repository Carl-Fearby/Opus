import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

/**
 * OAuth redirect target for Continue with Google / Apple.
 * Exchange `code` + the PKCE verifier from sessionStorage (client) on your auth server.
 */
export async function GET(request: Request, context: RouteContext) {
  const { provider } = await context.params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (provider !== "google" && provider !== "apple") {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  if (error) {
    return NextResponse.json(
      {
        provider,
        error,
        errorDescription,
      },
      { status: 400 },
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      {
        provider,
        error: "missing_code_or_state",
        message: "Expected authorization code and state from the identity provider.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    provider,
    code,
    state,
    message:
      "Authorization code received. Exchange it server-side with the PKCE verifier stored by continueWithGoogle / continueWithApple (session key opus-social-auth:{provider}).",
  });
}
