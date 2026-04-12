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

export interface SuggestViewportHotspotInput {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  viewportSize: number;
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
  });

  ctx.clearRect(0, 0, viewportSize, viewportSize);
  ctx.drawImage(
    image,
    frameRect.drawX,
    frameRect.drawY,
    frameRect.drawWidth,
    frameRect.drawHeight
  );

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
