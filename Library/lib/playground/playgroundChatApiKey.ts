const PLAYGROUND_OPENAI_API_KEY_STORAGE_KEY = "opus-playground-openai-api-key-v1";

export function readPlaygroundOpenAiApiKey() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(PLAYGROUND_OPENAI_API_KEY_STORAGE_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function storePlaygroundOpenAiApiKey(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  const next = value.trim();
  try {
    if (!next) {
      window.localStorage.removeItem(PLAYGROUND_OPENAI_API_KEY_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(PLAYGROUND_OPENAI_API_KEY_STORAGE_KEY, next);
  } catch {
    // Ignore quota / private-mode failures; the in-memory field still works for the session.
  }
}

export function looksLikeOpenAiApiKey(value: string) {
  const key = value.trim();
  return key.startsWith("sk-") && key.length >= 20;
}
