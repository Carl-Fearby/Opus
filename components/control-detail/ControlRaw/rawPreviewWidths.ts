export type RawPreviewWidthId =
  | "full"
  | "1600"
  | "1200"
  | "1080"
  | "800"
  | "720"
  | "400"
  | "390";

export type RawPreviewOrientation = "portrait" | "landscape";

export type RawPreviewWidthOption = {
  id: RawPreviewWidthId;
  label: string;
  px: number | null;
};

export type RawPreviewCanvasSize = {
  full: boolean;
  height: number | null;
  width: number | null;
};

/** Layout breakpoints used by Section and other responsive components. */
export const OPUS_LAYOUT_BREAKPOINTS = {
  tablet: 720,
  desktop: 1080,
} as const;

/** Typical phone logical height for a 390px-wide viewport (iPhone 14 class). */
const PHONE_PORTRAIT_HEIGHT = 844;

/** Typical tablet portrait height for a 768px-wide class device. */
const TABLET_PORTRAIT_HEIGHT = 1024;

export const RAW_PREVIEW_ORIENTATION_OPTIONS: { id: RawPreviewOrientation; label: string }[] = [
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

export const RAW_PREVIEW_WIDTH_OPTIONS: RawPreviewWidthOption[] = [
  { id: "full", label: "Full width", px: null },
  { id: "1600", label: "1600px", px: 1600 },
  { id: "1200", label: "1200px", px: 1200 },
  { id: "1080", label: `Desktop (${OPUS_LAYOUT_BREAKPOINTS.desktop}px)`, px: OPUS_LAYOUT_BREAKPOINTS.desktop },
  { id: "800", label: "800px", px: 800 },
  { id: "720", label: `Tablet (${OPUS_LAYOUT_BREAKPOINTS.tablet}px)`, px: OPUS_LAYOUT_BREAKPOINTS.tablet },
  { id: "400", label: "400px", px: 400 },
  { id: "390", label: "Mobile (390px)", px: 390 },
];

export function getRawPreviewWidthOption(id: RawPreviewWidthId) {
  return RAW_PREVIEW_WIDTH_OPTIONS.find((option) => option.id === id) ?? RAW_PREVIEW_WIDTH_OPTIONS[0];
}

function portraitHeightForWidth(basePx: number) {
  if (basePx <= 480) {
    return Math.round((basePx / 390) * PHONE_PORTRAIT_HEIGHT);
  }

  if (basePx <= OPUS_LAYOUT_BREAKPOINTS.tablet) {
    return Math.round((basePx / 768) * TABLET_PORTRAIT_HEIGHT);
  }

  return Math.round(basePx * 9 / 16);
}

export function resolveRawPreviewCanvasSize(
  widthOption: RawPreviewWidthOption,
  orientation: RawPreviewOrientation,
): RawPreviewCanvasSize {
  if (widthOption.px === null) {
    return { full: true, width: null, height: null };
  }

  const portraitHeight = portraitHeightForWidth(widthOption.px);

  if (orientation === "portrait") {
    return {
      full: false,
      width: widthOption.px,
      height: portraitHeight,
    };
  }

  return {
    full: false,
    width: portraitHeight,
    height: widthOption.px,
  };
}

export function formatRawPreviewCanvasLabel(size: RawPreviewCanvasSize, orientation: RawPreviewOrientation) {
  if (size.full || size.width === null || size.height === null) {
    return "Edge-to-edge canvas";
  }

  return `${size.width} × ${size.height}px ${orientation}`;
}
