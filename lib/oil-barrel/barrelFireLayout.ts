/** Barrel dimensions from GameEngine2 `OilBarrelDimensions.js` / `OilBarrel.js`. */
export const OIL_BARREL_PLAYER_STAND_EYE = 1.65;
export const OIL_BARREL_HEIGHT = OIL_BARREL_PLAYER_STAND_EYE * 0.5;
export const OIL_BARREL_RADIUS = 0.3;
export const RIM_BEVEL = Math.min(0.038, OIL_BARREL_RADIUS * 0.11);
export const VIDEO_FLOOR_LIFT = 0.04;
export const VIDEO_CLIP_RADIUS_FACTOR = 0.96;

export type InteriorFireTuning = {
  interiorFireOffsetX: number;
  interiorFlameTexBottom: number;
  interiorFlameTexTop: number;
  interiorVideoCenterOffsetX: number;
  interiorVideoCenterOffsetY: number;
  interiorVideoHeightScale: number;
  interiorVideoWidthScale: number;
};

export const DEFAULT_INTERIOR_FIRE_TUNING: InteriorFireTuning = {
  interiorVideoWidthScale: 1.9,
  interiorVideoHeightScale: 2,
  interiorVideoCenterOffsetX: -0.195,
  interiorVideoCenterOffsetY: 0.185,
  interiorFireOffsetX: 0.185,
  interiorFlameTexBottom: 0.15,
  interiorFlameTexTop: 0.92,
};

export function getOpenBarrelInteriorMetrics() {
  const bevel = RIM_BEVEL;
  const halfHeight = OIL_BARREL_HEIGHT / 2;
  const innerRadius = OIL_BARREL_RADIUS - bevel;
  const floorY = -halfHeight + bevel + 0.003;
  const topLipY = halfHeight - bevel;

  return {
    bevel,
    floorY,
    halfHeight,
    innerRadius,
    topLipY,
  };
}

export function computeInteriorFireCenterX(tuning: InteriorFireTuning) {
  return tuning.interiorVideoCenterOffsetX + tuning.interiorFireOffsetX;
}

export function normalizeFlameTexVRange(tuning: InteriorFireTuning) {
  let sampleV0 = tuning.interiorFlameTexBottom;
  let sampleV1 = tuning.interiorFlameTexTop;
  sampleV0 = Math.min(sampleV0, 0.98);
  sampleV1 = Math.min(sampleV1, 1);

  if (sampleV1 < sampleV0 + 0.02) {
    sampleV1 = Math.min(1, sampleV0 + 0.02);
  }

  return { sampleV0, sampleV1 };
}

export function computeInteriorFlameLayout(
  innerRadius: number,
  floorY: number,
  rimY: number,
  tuning: InteriorFireTuning,
) {
  const widthScale = tuning.interiorVideoWidthScale;
  const heightScale = tuning.interiorVideoHeightScale;
  const maxWidth = innerRadius * 2.08 * widthScale;
  const offsetY = tuning.interiorVideoCenterOffsetY;
  const x = computeInteriorFireCenterX(tuning);

  const bottomY = floorY + VIDEO_FLOOR_LIFT;
  const topY = rimY + 0.03;
  let height = (topY - bottomY) * heightScale;
  let width = height * (540 / 304) * widthScale;

  if (width > maxWidth) {
    width = maxWidth;
  }

  return {
    height,
    width,
    x,
    y: bottomY + height * 0.5 + offsetY,
    z: 0,
  };
}
