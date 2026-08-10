import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "components");
const exemptSegments = ["/fields/", "/control-detail/", "/development/"];
// These controls own browser-native interaction mechanics that cannot be
// reproduced by a general-purpose field without degrading their semantics.
// Keep this list explicit: adding a new exception must be an architectural
// decision rather than an accidental bypass of the Opus field layer.
const specializedNativeControls = new Set([
  "components/AudioPlayer/AudioPlayer.tsx",
  "components/CommandPalette/CommandPalette.tsx",
  "components/CrmWorkspaceLab/CrmWorkspaceLab.tsx",
  "components/DataGrid/DataGrid.tsx",
  "components/EmojiPicker/EmojiPicker.tsx",
  "components/FontPicker/FontPicker.tsx",
  "components/IconPicker/IconPicker.tsx",
  "components/VideoPlayer/VideoPlayer.tsx",
  "components/documentation/CodePlayground/CodePlayground.tsx",
]);
// Existing composite debt discovered by the first framework-wide audit. The
// audit reports this baseline but only fails for regressions, allowing each
// component to be migrated without making the guard unusable in CI.
const legacyCompositeControls = new Set([
  "components/Calendar/Calendar.tsx",
  "components/DealsOverTime/DealsOverTime.tsx",
  "components/DualListBuilder/DualListBuilder.tsx",
  "components/FilterBuilder/FilterBuilder.tsx",
  "components/NoteComposer/NoteComposer.tsx",
  "components/NotesActivity/NotesActivity.tsx",
  "components/PermissionsMatrix/PermissionsMatrix.tsx",
  "components/PipelineOverview/PipelineOverview.tsx",
  "components/PropertyInspector/PropertyInspector.tsx",
  "components/QueryBuilder/QueryBuilder.tsx",
  "components/RuleBuilder/RuleBuilder.tsx",
]);
const nativeFieldPattern = /<(input|select|textarea)(?:\s|>)/g;

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(target));
    else if (entry.name.endsWith(".tsx")) files.push(target);
  }
  return files;
}

const violations = [];
const legacy = [];
for (const file of await collect(root)) {
  const normalized = file.split(path.sep).join("/");
  if (exemptSegments.some((segment) => normalized.includes(segment))) continue;
  const relative = path.relative(process.cwd(), file).split(path.sep).join("/");
  if (specializedNativeControls.has(relative)) continue;
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(nativeFieldPattern)) {
    const line = source.slice(0, match.index).split("\n").length;
    const finding = `${relative}:${line} uses raw <${match[1]}>`;
    if (legacyCompositeControls.has(relative)) legacy.push(finding);
    else violations.push(finding);
  }
}

if (violations.length) {
  console.error("Composite components must compose Opus field primitives:\n");
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Composition audit passed: composite components use Opus field primitives.");
}

if (legacy.length) {
  console.warn(`Known composition migration backlog (${legacy.length} controls):`);
  console.warn(legacy.join("\n"));
}
