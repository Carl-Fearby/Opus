/**
 * Native `<select>` style type-ahead: printable keys jump to the next option
 * whose label starts with the typed text. Repeating the same character cycles
 * through every option starting with it.
 */
export type TypeaheadState = {
  buffer: string;
  lastTime: number;
};

export const TYPEAHEAD_TIMEOUT_MS = 500;

export function createTypeaheadState(): TypeaheadState {
  return { buffer: "", lastTime: 0 };
}

export function isTypeaheadKey(key: string) {
  return key.length === 1 && key !== " ";
}

function findMatch(options: readonly string[], query: string, startIndex: number) {
  const total = options.length;
  for (let offset = 0; offset < total; offset += 1) {
    const index = (((startIndex + offset) % total) + total) % total;
    if (options[index].toLowerCase().startsWith(query)) {
      return index;
    }
  }
  return null;
}

/**
 * Returns the option index the typed key should move to, or `null` when the key
 * is not type-ahead input (Enter, arrows, modifiers, space, …).
 */
export function resolveTypeaheadIndex(
  options: readonly string[],
  key: string,
  state: TypeaheadState,
  currentIndex: number,
  now: number = Date.now(),
): number | null {
  if (!isTypeaheadKey(key) || options.length === 0) {
    return null;
  }

  const expired = now - state.lastTime > TYPEAHEAD_TIMEOUT_MS;
  const previous = expired ? "" : state.buffer;
  const keyLower = key.toLowerCase();
  // "c", "c", "c" cycles Carl → Carla → …; "c", "a" builds the prefix "ca".
  const repeating = previous.length === 1 && previous.toLowerCase() === keyLower;
  const buffer = repeating ? previous : `${previous}${key}`;

  state.lastTime = now;
  state.buffer = buffer;

  let match = findMatch(options, buffer.toLowerCase(), repeating ? currentIndex + 1 : 0);

  if (match === null && buffer.length > 1) {
    // The accumulated prefix no longer matches, so start a fresh search.
    state.buffer = key;
    match = findMatch(options, keyLower, currentIndex);
  }

  if (match === null) {
    return null;
  }

  if (!repeating && buffer.length === 1) {
    // Keep the current option when it already starts with the typed letter.
    const current = options[currentIndex];
    if (current && current.toLowerCase().startsWith(keyLower)) {
      return currentIndex;
    }
  }

  return match;
}
