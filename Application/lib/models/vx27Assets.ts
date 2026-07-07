import type { ModelAsset } from "opus-react";

import {
  OIL_BARREL_FIRE_ALPHA_SRC,
  OIL_BARREL_FIRE_COLOR_SRC,
} from "@/lib/oil-barrel/interiorFireTuning";

/** Walk cycle from the PX-27 android walk export. */
export const PX27_ANDROID_WALK_ANIMATION = "Armature|walking_man|baselayer";

/** Looped flame videos composited with GameEngine2 interior-fire shader logic. */
export const OIL_BARREL_FIRE_OVERLAY = {
  colorSrc: OIL_BARREL_FIRE_COLOR_SRC,
  alphaSrc: OIL_BARREL_FIRE_ALPHA_SRC,
} as const;

export const vx27ModelAssets: ModelAsset[] = [
  {
    id: "control-panel",
    name: "Control panel",
    src: "/models/vx27/control-panel.glb",
    alt: "VX-27 sci-fi control panel 3D asset.",
    description: "Interactive terminal hardware from the VX-27 environment set.",
  },
  {
    id: "ammo-crate",
    name: "Ammo crate",
    src: "/models/vx27/ammo-crate.glb",
    alt: "VX-27 ammunition crate 3D asset.",
    description: "Compact supply crate for pickups, cover, and environment dressing.",
  },
  {
    id: "oil-barrel",
    name: "Fire barrel",
    src: "/models/vx27/oil-barrel.glb",
    alt: "Open-top oil barrel with burning interior flames.",
    description: "Burning hazard prop — open-top barrel with animated fire from the VX-27 arena.",
    fireOverlay: OIL_BARREL_FIRE_OVERLAY,
  },
  {
    id: "px27-android",
    name: "PX-27 android",
    src: "/models/vx27/px27-android-walk.glb",
    alt: "PX-27 android droid 3D enemy character.",
    description: "Animated arena enemy from the VX-27 combat roster.",
    autoplay: true,
    animationName: PX27_ANDROID_WALK_ANIMATION,
  },
];

export function formatModelAssetForUsage(asset: ModelAsset): string {
  const parts = [
    `id: "${asset.id ?? ""}"`,
    `name: "${asset.name}"`,
    `src: "${asset.src}"`,
    `alt: "${asset.alt}"`,
  ];

  if (asset.description) {
    parts.push(`description: "${asset.description}"`);
  }

  if (asset.autoplay) {
    parts.push("autoplay: true");
  }

  if (asset.animationName) {
    parts.push(`animationName: "${asset.animationName}"`);
  }

  if (asset.cameraOrbit) {
    parts.push(`cameraOrbit: "${asset.cameraOrbit}"`);
  }

  if (asset.fireOverlay) {
    parts.push(
      `fireOverlay: { colorSrc: "${asset.fireOverlay.colorSrc}", alphaSrc: "${asset.fireOverlay.alphaSrc}" }`,
    );
  }

  return `{ ${parts.join(", ")} }`;
}

export function formatModelAssetsForUsage(
  assets: ModelAsset[] = vx27ModelAssets,
): string {
  return `[\n  ${assets.map(formatModelAssetForUsage).join(",\n  ")},\n]`;
}
