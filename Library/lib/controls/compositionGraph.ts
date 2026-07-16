import { controls } from "./registry";
import type { ControlDefinition, ControlSlug } from "./types";

export type CompositionTreeNode = ControlDefinition & {
  children: ControlDefinition[];
  parentCount: number;
};

const categoryPreference = ["dashboard", "content", "forms", "overlays", "graphs", "system", "labs"];

function uniqueControls(entries: ControlDefinition[]) {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = `${entry.category}:${entry.slug}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function getCompositionParents(slug: ControlSlug): ControlDefinition[] {
  return controls
    .filter((control) => getCompositionChildren(control).some((child) => child.slug === slug))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function getCompositionParentsForControl(target: ControlDefinition): ControlDefinition[] {
  return controls
    .filter((control) =>
      getCompositionChildren(control).some(
        (child) => child.slug === target.slug && child.category === target.category,
      ),
    )
    .sort((left, right) => left.title.localeCompare(right.title));
}

function resolveCompositionChild(parent: ControlDefinition, slug: ControlSlug): ControlDefinition | undefined {
  const matches = controls.filter((entry) => entry.slug === slug);

  if (matches.length <= 1) {
    return matches[0];
  }

  const withoutSelf = matches.filter((entry) => entry.slug !== parent.slug || entry.category !== parent.category);
  const candidates = withoutSelf.length ? withoutSelf : matches;

  return [...candidates].sort(
    (left, right) => categoryPreference.indexOf(left.category) - categoryPreference.indexOf(right.category),
  )[0];
}

export function getCompositionChildren(control: ControlDefinition): ControlDefinition[] {
  if (!control.compositionParts?.length) {
    return [];
  }

  const children = control.compositionParts
    .map((slug) => resolveCompositionChild(control, slug))
    .filter((entry): entry is ControlDefinition => Boolean(entry));

  return uniqueControls(children).sort((left, right) => left.title.localeCompare(right.title));
}

export function getCompositionTree(): CompositionTreeNode[] {
  return controls
    .map((control) => ({
      ...control,
      children: getCompositionChildren(control),
      parentCount: getCompositionParents(control.slug).length,
    }))
    .filter((control) => control.children.length > 0)
    .sort((left, right) => {
      if (right.children.length !== left.children.length) {
        return right.children.length - left.children.length;
      }

      return left.title.localeCompare(right.title);
    });
}
