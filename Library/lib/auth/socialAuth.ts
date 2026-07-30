/**
 * Browser helpers that start Google / Apple OAuth (authorization-code + PKCE).
 * Pair with a server route that exchanges `code` + stored verifier for tokens.
 */

export type SocialAuthMode = "login" | "register";
export type SocialAuthProvider = "google" | "apple";

export type ContinueWithSocialOptions = {
  /** Login vs register intent stored with the OAuth state for your callback. */
  mode?: SocialAuthMode;
  /** Overrides `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` / Apple equivalent. */
  clientId?: string;
  /** Defaults to `{origin}/api/auth/callback/{provider}`. */
  redirectUri?: string;
  /** Extra space-delimited scopes beyond the defaults. */
  scopes?: string[];
};

export type SocialAuthStartResult =
  | { ok: true; provider: SocialAuthProvider; authorizeUrl: string }
  | { ok: false; provider: SocialAuthProvider; error: string };

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const APPLE_AUTH_URL = "https://appleid.apple.com/auth/authorize";
const STORAGE_PREFIX = "opus-social-auth";

function readPublicEnv(name: string): string {
  if (typeof process === "undefined" || !process.env) {
    return "";
  }
  return String(process.env[name] ?? "").trim();
}

function defaultClientId(provider: SocialAuthProvider): string {
  if (provider === "google") {
    return readPublicEnv("NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID");
  }
  return readPublicEnv("NEXT_PUBLIC_APPLE_OAUTH_CLIENT_ID");
}

function defaultRedirectUri(provider: SocialAuthProvider): string {
  const configured = readPublicEnv("NEXT_PUBLIC_OAUTH_REDIRECT_URI");
  if (configured) {
    return configured.replace("{provider}", provider);
  }
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.origin}/api/auth/callback/${provider}`;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  view.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function createPkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return toBase64Url(digest);
}

function storageKey(provider: SocialAuthProvider): string {
  return `${STORAGE_PREFIX}:${provider}`;
}

export type StoredSocialAuthSession = {
  mode: SocialAuthMode;
  provider: SocialAuthProvider;
  redirectUri: string;
  state: string;
  verifier: string;
  createdAt: number;
};

export function readSocialAuthSession(provider: SocialAuthProvider): StoredSocialAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(storageKey(provider));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredSocialAuthSession;
  } catch {
    return null;
  }
}

export function clearSocialAuthSession(provider: SocialAuthProvider): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(storageKey(provider));
}

function persistSession(session: StoredSocialAuthSession): void {
  window.sessionStorage.setItem(storageKey(session.provider), JSON.stringify(session));
}

async function buildAuthorizeUrl(
  provider: SocialAuthProvider,
  options: ContinueWithSocialOptions = {},
): Promise<SocialAuthStartResult> {
  if (typeof window === "undefined") {
    return { ok: false, provider, error: "Social auth can only start in the browser." };
  }

  const clientId = (options.clientId ?? defaultClientId(provider)).trim();
  if (!clientId) {
    const envName =
      provider === "google" ? "NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID" : "NEXT_PUBLIC_APPLE_OAUTH_CLIENT_ID";
    return {
      ok: false,
      provider,
      error: `Missing ${envName}. Add your OAuth client id to enable Continue with ${provider === "google" ? "Google" : "Apple"}.`,
    };
  }

  const redirectUri = (options.redirectUri ?? defaultRedirectUri(provider)).trim();
  if (!redirectUri) {
    return { ok: false, provider, error: "Missing OAuth redirect URI." };
  }

  const mode = options.mode ?? "login";
  const state = randomString(24);
  const verifier = randomString(32);
  const challenge = await createPkceChallenge(verifier);

  persistSession({
    provider,
    mode,
    state,
    verifier,
    redirectUri,
    createdAt: Date.now(),
  });

  if (provider === "google") {
    const scopes = ["openid", "email", "profile", ...(options.scopes ?? [])].join(" ");
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scopes);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");
    url.searchParams.set("include_granted_scopes", "true");
    return { ok: true, provider, authorizeUrl: url.toString() };
  }

  const scopes = ["name", "email", ...(options.scopes ?? [])].join(" ");
  const url = new URL(APPLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);
  // Apple does not use S256 PKCE the same way as Google; state + server verification is required.
  return { ok: true, provider, authorizeUrl: url.toString() };
}

/** Starts the Google OAuth redirect (authorization code + PKCE). */
export async function continueWithGoogle(options: ContinueWithSocialOptions = {}): Promise<SocialAuthStartResult> {
  const result = await buildAuthorizeUrl("google", options);
  if (result.ok) {
    window.location.assign(result.authorizeUrl);
  }
  return result;
}

/** Starts the Apple OAuth redirect (Sign in with Apple). */
export async function continueWithApple(options: ContinueWithSocialOptions = {}): Promise<SocialAuthStartResult> {
  const result = await buildAuthorizeUrl("apple", options);
  if (result.ok) {
    window.location.assign(result.authorizeUrl);
  }
  return result;
}
