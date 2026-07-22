export type ImageCropState = {
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export type ImageCropViewport = {
  height: number;
  width: number;
};

export type ImageCropFit = "cover" | "contain";

export function getImageCropMetrics(
  imageWidth: number,
  imageHeight: number,
  viewport: ImageCropViewport,
  state: ImageCropState,
  fit: ImageCropFit = "cover",
) {
  const widthRatio = viewport.width / imageWidth;
  const heightRatio = viewport.height / imageHeight;
  const baseScale = fit === "contain" ? Math.min(widthRatio, heightRatio) : Math.max(widthRatio, heightRatio);
  const scale = baseScale * state.zoom;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const centerX = viewport.width / 2 + state.offsetX;
  const centerY = viewport.height / 2 + state.offsetY;

  return {
    baseScale,
    centerX,
    centerY,
    drawHeight,
    drawWidth,
    drawX: centerX - drawWidth / 2,
    drawY: centerY - drawHeight / 2,
    scale,
  };
}

export function clampImageCropOffset(
  imageWidth: number,
  imageHeight: number,
  viewport: ImageCropViewport,
  state: ImageCropState,
  fit: ImageCropFit = "cover",
) {
  const { drawHeight, drawWidth } = getImageCropMetrics(imageWidth, imageHeight, viewport, state, fit);
  const maxX = Math.max(0, (drawWidth - viewport.width) / 2);
  const maxY = Math.max(0, (drawHeight - viewport.height) / 2);

  return {
    offsetX: Math.min(maxX, Math.max(-maxX, state.offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, state.offsetY)),
    zoom: state.zoom,
  };
}

export async function cropImageToViewport(
  image: HTMLImageElement,
  viewport: ImageCropViewport,
  output: ImageCropViewport,
  state: ImageCropState,
  options?: {
    circular?: boolean;
    fileName?: string;
    fillStyle?: string;
    fit?: ImageCropFit;
  },
): Promise<{ file: File; previewUrl: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = output.width;
  canvas.height = output.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  const fit = options?.fit ?? "cover";
  const { drawHeight, drawWidth, drawX, drawY } = getImageCropMetrics(
    image.naturalWidth,
    image.naturalHeight,
    viewport,
    state,
    fit,
  );
  const ratioX = output.width / viewport.width;
  const ratioY = output.height / viewport.height;

  context.clearRect(0, 0, output.width, output.height);

  if (options?.fillStyle) {
    context.fillStyle = options.fillStyle;
    context.fillRect(0, 0, output.width, output.height);
  }

  context.save();

  if (options?.circular) {
    context.beginPath();
    context.arc(output.width / 2, output.height / 2, Math.min(output.width, output.height) / 2, 0, Math.PI * 2);
    context.clip();
  }

  context.drawImage(
    image,
    drawX * ratioX,
    drawY * ratioY,
    drawWidth * ratioX,
    drawHeight * ratioY,
  );
  context.restore();

  const fileName = options?.fileName ?? (options?.circular ? "profile-photo.png" : "company-logo.png");

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to crop image."));
        return;
      }

      resolve({
        file: new File([blob], fileName, { type: blob.type || "image/png" }),
        previewUrl: URL.createObjectURL(blob),
      });
    }, "image/png");
  });
}

/** @deprecated Prefer getImageCropMetrics with a square viewport. */
export type CircularCropState = ImageCropState;

/** @deprecated Prefer getImageCropMetrics. */
export function getCircularCropMetrics(
  imageWidth: number,
  imageHeight: number,
  viewportSize: number,
  state: ImageCropState,
) {
  return getImageCropMetrics(imageWidth, imageHeight, { width: viewportSize, height: viewportSize }, state, "cover");
}

/** @deprecated Prefer clampImageCropOffset. */
export function clampCircularCropOffset(
  imageWidth: number,
  imageHeight: number,
  viewportSize: number,
  state: ImageCropState,
) {
  return clampImageCropOffset(imageWidth, imageHeight, { width: viewportSize, height: viewportSize }, state, "cover");
}

/** @deprecated Prefer cropImageToViewport with circular: true. */
export async function cropCircularImage(
  image: HTMLImageElement,
  viewportSize: number,
  outputSize: number,
  state: ImageCropState,
  fileName = "profile-photo.png",
) {
  return cropImageToViewport(
    image,
    { width: viewportSize, height: viewportSize },
    { width: outputSize, height: outputSize },
    state,
    { circular: true, fileName, fit: "cover" },
  );
}
