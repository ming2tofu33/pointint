export type FitMode = "contain" | "cover";

export const EDITOR_VIEWPORT_SIZE = 256;

export interface FrameGeometryInput {
  viewportSize: number;
  sourceViewportSize?: number;
  imageWidth: number;
  imageHeight: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface FrameGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  baseScale: number;
  effectiveScale: number;
}

export interface HotspotMappingInput {
  hotspotX: number;
  hotspotY: number;
  viewportSize: number;
  outputSize: number;
}

export interface RasterizeSquarePngInput {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  outputSize: number;
  sourceViewportSize?: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
}

function toFinitePositive(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

export function clampCoordinate(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function getBaseFitScale(
  imageWidth: number,
  imageHeight: number,
  viewportSize: number,
  fitMode: FitMode
): number {
  const safeImageWidth = toFinitePositive(imageWidth, 1);
  const safeImageHeight = toFinitePositive(imageHeight, 1);
  const safeViewport = toFinitePositive(viewportSize, 1);

  const ratioX = safeViewport / safeImageWidth;
  const ratioY = safeViewport / safeImageHeight;
  return fitMode === "cover" ? Math.max(ratioX, ratioY) : Math.min(ratioX, ratioY);
}

export function getFrameGeometry(input: FrameGeometryInput): FrameGeometry {
  const safeViewport = toFinitePositive(input.viewportSize, 1);
  const safeSourceViewport = toFinitePositive(
    input.sourceViewportSize ?? safeViewport,
    safeViewport
  );
  const viewportRatio = safeViewport / safeSourceViewport;
  const safeScale = toFinitePositive(input.scale, 1);
  const baseScale = getBaseFitScale(
    input.imageWidth,
    input.imageHeight,
    safeSourceViewport,
    input.fitMode
  );
  const effectiveScale = baseScale * safeScale * viewportRatio;
  const scaledOffsetX = input.offsetX * viewportRatio;
  const scaledOffsetY = input.offsetY * viewportRatio;

  const width = input.imageWidth * effectiveScale;
  const height = input.imageHeight * effectiveScale;
  const x = (safeViewport - width) / 2 + scaledOffsetX;
  const y = (safeViewport - height) / 2 + scaledOffsetY;

  return {
    x,
    y,
    width,
    height,
    baseScale,
    effectiveScale,
  };
}

export function mapViewportHotspotToOutput({
  hotspotX,
  hotspotY,
  viewportSize,
  outputSize,
}: HotspotMappingInput): { x: number; y: number } {
  const safeViewport = toFinitePositive(viewportSize, 1);
  const safeOutput = toFinitePositive(outputSize, 1);
  const ratio = safeOutput / safeViewport;

  return {
    x: clampCoordinate(hotspotX * ratio, safeOutput - 1),
    y: clampCoordinate(hotspotY * ratio, safeOutput - 1),
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export async function rasterizeSquarePng(
  input: RasterizeSquarePngInput
): Promise<Blob> {
  const safeOutputSize = toFinitePositive(input.outputSize, 1);
  const img = await loadImage(input.imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = safeOutputSize;
  canvas.height = safeOutputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  const geometry = getFrameGeometry({
    viewportSize: safeOutputSize,
    sourceViewportSize: input.sourceViewportSize,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    fitMode: input.fitMode,
    scale: input.scale,
    offsetX: input.offsetX,
    offsetY: input.offsetY,
  });

  ctx.clearRect(0, 0, safeOutputSize, safeOutputSize);
  ctx.drawImage(img, geometry.x, geometry.y, geometry.width, geometry.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to render cursor preview"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
