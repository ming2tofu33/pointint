export type FitMode = "contain" | "cover";
export type ImageRotation = 0 | 90 | 180 | 270;
export type ImageTransformAction =
  | "rotate-clockwise"
  | "flip-horizontal"
  | "flip-vertical";

export interface ImageTransform {
  rotation: ImageRotation;
  flipX: boolean;
  flipY: boolean;
}

export interface FrameInput {
  sourceWidth: number;
  sourceHeight: number;
  viewportSize: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation?: ImageRotation;
  flipX?: boolean;
  flipY?: boolean;
}

export interface FrameRect {
  drawWidth: number;
  drawHeight: number;
  drawX: number;
  drawY: number;
}

export interface TransformedImagePlacement {
  imageDrawWidth: number;
  imageDrawHeight: number;
  transform: string | undefined;
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
  rotation?: ImageRotation;
  flipX?: boolean;
  flipY?: boolean;
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

export interface AlphaContentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TrimTransparentImageBlobResult {
  blob: Blob;
  width: number;
  height: number;
  trimmed: boolean;
}

export interface SuggestViewportHotspotInput {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation?: ImageRotation;
  flipX?: boolean;
  flipY?: boolean;
  viewportSize: number;
}

export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = {
  rotation: 0,
  flipX: false,
  flipY: false,
};

export function createDefaultImageTransform(): ImageTransform {
  return { ...DEFAULT_IMAGE_TRANSFORM };
}

export function applyImageTransformAction(
  transform: ImageTransform,
  action: ImageTransformAction
): ImageTransform {
  switch (action) {
    case "rotate-clockwise":
      return {
        ...transform,
        rotation: normalizeImageRotation(transform.rotation + 90),
      };
    case "flip-horizontal":
      return { ...transform, flipX: !transform.flipX };
    case "flip-vertical":
      return { ...transform, flipY: !transform.flipY };
  }
}

export function normalizeImageRotation(rotation: number): ImageRotation {
  const normalized = ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;
  return normalized as ImageRotation;
}

export function normalizeImageTransform(
  transform: Partial<ImageTransform> | undefined
): ImageTransform {
  return {
    rotation: normalizeImageRotation(transform?.rotation ?? 0),
    flipX: Boolean(transform?.flipX),
    flipY: Boolean(transform?.flipY),
  };
}

export function hasNonDefaultImageTransform(
  transform: Partial<ImageTransform> | undefined
) {
  const normalized = normalizeImageTransform(transform);
  return (
    normalized.rotation !== 0 ||
    normalized.flipX ||
    normalized.flipY
  );
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
  const transform = normalizeImageTransform(input);

  const { width: safeWidth, height: safeHeight } =
    getEffectiveSourceDimensions(sourceWidth, sourceHeight, transform.rotation);
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

export function getTransformedImagePlacement(
  frameRect: FrameRect,
  transform: Partial<ImageTransform> | undefined
): TransformedImagePlacement {
  const normalized = normalizeImageTransform(transform);
  const rotatedSideways =
    normalized.rotation === 90 || normalized.rotation === 270;
  const transforms = [
    `scale(${normalized.flipX ? -1 : 1}, ${normalized.flipY ? -1 : 1})`,
    normalized.rotation !== 0 ? `rotate(${normalized.rotation}deg)` : null,
  ].filter(Boolean);

  return {
    imageDrawWidth: rotatedSideways ? frameRect.drawHeight : frameRect.drawWidth,
    imageDrawHeight: rotatedSideways ? frameRect.drawWidth : frameRect.drawHeight,
    transform: transforms.length > 0 ? transforms.join(" ") : undefined,
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

export function getAlphaContentBounds(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 12
): AlphaContentBounds | null {
  if (!width || !height || alpha.length < width * height) {
    return null;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alpha[y * width + x] < threshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export function suggestHotspotFromAlphaMask(
  alpha: Uint8ClampedArray,
  width: number,
  height: number
): { x: number; y: number } | null {
  if (!width || !height || alpha.length < width * height) {
    return null;
  }

  let best: { x: number; y: number } | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!isOpaque(alpha, width, height, x, y)) continue;
      if (!isBoundaryPixel(alpha, width, height, x, y)) continue;

      const support = countOpaqueNeighbors(alpha, width, height, x, y, 2);
      if (support < 4) continue;

      const centroid = getLocalOpaqueCentroid(alpha, width, height, x, y, 4);
      if (!centroid) continue;

      const dx = centroid.x - x;
      const dy = centroid.y - y;

      if (dx <= 0.5 || dy <= 0.5) continue;

      const score = x + y - (dx + dy) * 0.6 - support * 0.08;
      if (score < bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
  }

  if (best) {
    return best;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!isOpaque(alpha, width, height, x, y)) continue;
      if (countOpaqueNeighbors(alpha, width, height, x, y, 2) < 4) continue;
      return { x, y };
    }
  }

  return null;
}

export async function suggestViewportHotspot(
  input: SuggestViewportHotspotInput
): Promise<{ x: number; y: number } | null> {
  const {
    imageUrl,
    sourceWidth,
    sourceHeight,
    fitMode,
    scale,
    offsetX,
    offsetY,
    viewportSize,
  } = input;
  const transform = normalizeImageTransform(input);

  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = viewportSize;
  canvas.height = viewportSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const frameRect = getFrameRect({
    sourceWidth,
    sourceHeight,
    viewportSize,
    fitMode,
    scale,
    offsetX,
    offsetY,
    ...transform,
  });

  ctx.clearRect(0, 0, viewportSize, viewportSize);
  drawImageWithTransform(ctx, image, frameRect, transform);

  const imageData = ctx.getImageData(0, 0, viewportSize, viewportSize);
  const alpha = new Uint8ClampedArray(viewportSize * viewportSize);

  for (let i = 0; i < alpha.length; i += 1) {
    alpha[i] = imageData.data[i * 4 + 3] ?? 0;
  }

  return suggestHotspotFromAlphaMask(alpha, viewportSize, viewportSize);
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
    rotation,
    flipX,
    flipY,
    outputSize,
    hotspotX,
    hotspotY,
    editorViewportSize,
  } = input;
  const transform = normalizeImageTransform({ rotation, flipX, flipY });

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
    ...transform,
  });

  ctx.clearRect(0, 0, outputSize, outputSize);
  drawImageWithTransform(ctx, image, frameRect, transform);

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

export async function trimTransparentImageBlob(
  blob: Blob,
  padding = 2
): Promise<TrimTransparentImageBlobResult> {
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(objectUrl);
    const width = Math.max(image.naturalWidth || image.width || 0, 1);
    const height = Math.max(image.naturalHeight || image.height || 0, 1);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create canvas context");
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const alpha = new Uint8ClampedArray(width * height);

    for (let i = 0; i < alpha.length; i += 1) {
      alpha[i] = imageData.data[i * 4 + 3] ?? 0;
    }

    const bounds = getAlphaContentBounds(alpha, width, height);
    if (!bounds) {
      return { blob, width, height, trimmed: false };
    }

    const crop = padAlphaBounds(bounds, width, height, padding);
    if (
      crop.x === 0 &&
      crop.y === 0 &&
      crop.width === width &&
      crop.height === height
    ) {
      return { blob, width, height, trimmed: false };
    }

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = crop.width;
    outputCanvas.height = crop.height;

    const outputCtx = outputCanvas.getContext("2d");
    if (!outputCtx) {
      throw new Error("Failed to create canvas context");
    }

    outputCtx.clearRect(0, 0, crop.width, crop.height);
    outputCtx.drawImage(
      canvas,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return {
      blob: await canvasToBlob(outputCanvas),
      width: crop.width,
      height: crop.height,
      trimmed: true,
    };
  } finally {
    safeRevokeObjectUrl(objectUrl);
  }
}

function padAlphaBounds(
  bounds: AlphaContentBounds,
  imageWidth: number,
  imageHeight: number,
  padding: number
): AlphaContentBounds {
  const safePadding = Math.max(0, Math.round(padding));
  const x = clamp(bounds.x - safePadding, 0, imageWidth - 1);
  const y = clamp(bounds.y - safePadding, 0, imageHeight - 1);
  const right = clamp(
    bounds.x + bounds.width - 1 + safePadding,
    0,
    imageWidth - 1
  );
  const bottom = clamp(
    bounds.y + bounds.height - 1 + safePadding,
    0,
    imageHeight - 1
  );

  return {
    x,
    y,
    width: right - x + 1,
    height: bottom - y + 1,
  };
}

function safeRevokeObjectUrl(url: string) {
  if (typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isOpaque(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  threshold = 64
) {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return false;
  }

  return alpha[y * width + x] >= threshold;
}

function isBoundaryPixel(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
) {
  for (let ny = y - 1; ny <= y + 1; ny += 1) {
    for (let nx = x - 1; nx <= x + 1; nx += 1) {
      if (nx === x && ny === y) continue;
      if (!isOpaque(alpha, width, height, nx, ny)) {
        return true;
      }
    }
  }

  return false;
}

function countOpaqueNeighbors(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  let count = 0;

  for (let ny = y - radius; ny <= y + radius; ny += 1) {
    for (let nx = x - radius; nx <= x + radius; nx += 1) {
      if (isOpaque(alpha, width, height, nx, ny)) {
        count += 1;
      }
    }
  }

  return count;
}

function getLocalOpaqueCentroid(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let ny = y - radius; ny <= y + radius; ny += 1) {
    for (let nx = x - radius; nx <= x + radius; nx += 1) {
      if (!isOpaque(alpha, width, height, nx, ny)) continue;
      sumX += nx;
      sumY += ny;
      count += 1;
    }
  }

  if (!count) {
    return null;
  }

  return {
    x: sumX / count,
    y: sumY / count,
  };
}

function getEffectiveSourceDimensions(
  sourceWidth: number,
  sourceHeight: number,
  rotation: ImageRotation
) {
  const safeWidth = Math.max(sourceWidth, 1);
  const safeHeight = Math.max(sourceHeight, 1);

  if (rotation === 90 || rotation === 270) {
    return { width: safeHeight, height: safeWidth };
  }

  return { width: safeWidth, height: safeHeight };
}

function drawImageWithTransform(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  frameRect: FrameRect,
  transform: ImageTransform
) {
  if (!hasNonDefaultImageTransform(transform)) {
    ctx.drawImage(
      image,
      frameRect.drawX,
      frameRect.drawY,
      frameRect.drawWidth,
      frameRect.drawHeight
    );
    return;
  }

  const placement = getTransformedImagePlacement(frameRect, transform);

  ctx.save();
  ctx.translate(
    frameRect.drawX + frameRect.drawWidth / 2,
    frameRect.drawY + frameRect.drawHeight / 2
  );
  ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.drawImage(
    image,
    -placement.imageDrawWidth / 2,
    -placement.imageDrawHeight / 2,
    placement.imageDrawWidth,
    placement.imageDrawHeight
  );
  ctx.restore();
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
