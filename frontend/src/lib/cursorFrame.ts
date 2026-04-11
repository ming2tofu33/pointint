export type FitMode = "contain" | "cover";

export interface FrameInput {
  sourceWidth: number;
  sourceHeight: number;
  viewportSize: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface FrameRect {
  drawWidth: number;
  drawHeight: number;
  drawX: number;
  drawY: number;
}

export interface ViewportHotspotInput {
  hotspotX: number;
  hotspotY: number;
  viewportSize: number;
  outputSize: number;
}

export interface RasterizeSquarePngInput {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  outputSize: number;
  hotspotX: number;
  hotspotY: number;
  editorViewportSize: number;
}

export interface RasterizeSquarePngResult {
  blob: Blob;
  hotspotX: number;
  hotspotY: number;
  frameRect: FrameRect;
}

export function getFrameRect(input: FrameInput): FrameRect {
  const {
    sourceWidth,
    sourceHeight,
    viewportSize,
    fitMode,
    scale,
    offsetX,
    offsetY,
  } = input;

  const safeWidth = Math.max(sourceWidth, 1);
  const safeHeight = Math.max(sourceHeight, 1);
  const baseScale =
    fitMode === "cover"
      ? Math.max(viewportSize / safeWidth, viewportSize / safeHeight)
      : Math.min(viewportSize / safeWidth, viewportSize / safeHeight);
  const drawWidth = safeWidth * baseScale * scale;
  const drawHeight = safeHeight * baseScale * scale;

  return {
    drawWidth,
    drawHeight,
    drawX: (viewportSize - drawWidth) / 2 + offsetX,
    drawY: (viewportSize - drawHeight) / 2 + offsetY,
  };
}

export function mapViewportHotspotToOutput(
  input: ViewportHotspotInput
): { x: number; y: number } {
  const { hotspotX, hotspotY, viewportSize, outputSize } = input;
  const ratio = outputSize / Math.max(viewportSize, 1);

  return {
    x: clamp(Math.round(hotspotX * ratio), 0, outputSize - 1),
    y: clamp(Math.round(hotspotY * ratio), 0, outputSize - 1),
  };
}

export async function rasterizeSquarePng(
  input: RasterizeSquarePngInput
): Promise<RasterizeSquarePngResult> {
  const {
    imageUrl,
    sourceWidth,
    sourceHeight,
    fitMode,
    scale,
    offsetX,
    offsetY,
    outputSize,
    hotspotX,
    hotspotY,
    editorViewportSize,
  } = input;

  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }

  const offsetScale = outputSize / Math.max(editorViewportSize, 1);
  const frameRect = getFrameRect({
    sourceWidth,
    sourceHeight,
    viewportSize: outputSize,
    fitMode,
    scale,
    offsetX: offsetX * offsetScale,
    offsetY: offsetY * offsetScale,
  });

  ctx.clearRect(0, 0, outputSize, outputSize);
  ctx.drawImage(
    image,
    frameRect.drawX,
    frameRect.drawY,
    frameRect.drawWidth,
    frameRect.drawHeight
  );

  const blob = await canvasToBlob(canvas);
  const mappedHotspot = mapViewportHotspotToOutput({
    hotspotX,
    hotspotY,
    viewportSize: editorViewportSize,
    outputSize,
  });

  return {
    blob,
    hotspotX: mappedHotspot.x,
    hotspotY: mappedHotspot.y,
    frameRect,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to rasterize image"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
