import { controls } from "./registry";
import type { ControlDefinition, ControlSlug } from "./types";

export function getCompositionParents(slug: ControlSlug): ControlDefinition[] {
  return controls
    .filter((control) => control.compositionParts?.includes(slug))
    .sort((left, right) => left.title.localeCompare(right.title));
}
