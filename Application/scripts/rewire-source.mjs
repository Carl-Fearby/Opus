// Rewrites `@/components/<X>` specifiers to `opus-react` for Application builds.
const localRoots = new Set([
  "AudioPlayer",
  "control-detail",
  "DeployUpdateNotifier",
  "development",
  "documentation",
  "marketing",
  "Map",
  "NotesActivity",
  "Tabs",
  "theme",
  "VideoPlayer",
]);

const specifierPattern = /(["'])@\/components\/([A-Za-z0-9_-]+)(\/[^"']*)?\1/g;

export function rewireSource(source) {
  let changed = false;

  const next = source.replace(specifierPattern, (match, quote, root) => {
    if (localRoots.has(root)) {
      return match;
    }

    changed = true;
    return `${quote}opus-react${quote}`;
  });

  return { changed, source: next };
}
