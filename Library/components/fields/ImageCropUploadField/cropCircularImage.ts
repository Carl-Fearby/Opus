export type CircularCropState = {
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export function getCircularCropMetrics(
  imageWidth: number,
  imageHeight: number,
  viewportSize: number,
  state: CircularCropState,
) {
  const baseScale = Math.max(viewportSize / imageWidth, viewportSize / imageHeight);
  const scale = baseScale * state.zoom;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const centerX = viewportSize / 2 + state.offsetX;
  const centerY = viewportSize / 2 + state.offsetY;

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

export function clampCircularCropOffset(
  imageWidth: number,
  imageHeight: number,
  viewportSize: number,
  state: CircularCropState,
) {
  const { drawHeight, drawWidth } = getCircularCropMetrics(imageWidth, imageHeight, viewportSize, state);
  const maxX = Math.max(0, (drawWidth - viewportSize) / 2);
  const maxY = Math.max(0, (drawHeight - viewportSize) / 2);

  return {
    offsetX: Math.min(maxX, Math.max(-maxX, state.offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, state.offsetY)),
    zoom: state.zoom,
  };
}

export async function cropCircularImage(
  image: HTMLImageElement,
  viewportSize: number,
  outputSize: number,
  state: CircularCropState,
  fileName = "profile-photo.png",
): Promise<{ file: File; previewUrl: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  const { drawHeight, drawWidth, drawX, drawY } = getCircularCropMetrics(
    image.naturalWidth,
    image.naturalHeight,
    viewportSize,
    state,
  );
  const ratio = outputSize / viewportSize;

  context.clearRect(0, 0, outputSize, outputSize);
  context.save();
  context.beginPath();
  context.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
  context.clip();
  context.drawImage(image, drawX * ratio, drawY * ratio, drawWidth * ratio, drawHeight * ratio);
  context.restore();

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
