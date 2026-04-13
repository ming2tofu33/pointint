import { type FitMode } from "@/lib/cursorFrame";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function removeBackground(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BACKEND_URL}/api/remove-background`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Server error: ${res.status}`);
  }

  return res.blob();
}

export interface HealthResult {
  visibility: "pass" | "warn" | "fail";
  hotspot: "pass" | "warn";
  readability: "pass" | "warn";
  messages: string[];
}

export async function checkCursorHealth(
  pngBlob: Blob,
  hotspotX: number,
  hotspotY: number
): Promise<HealthResult> {
  const formData = new FormData();
  formData.append("file", pngBlob, "cursor.png");
  formData.append("hotspot_x", String(hotspotX));
  formData.append("hotspot_y", String(hotspotY));

  const res = await fetch(`${BACKEND_URL}/api/cursor-health`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) return { visibility: "pass", hotspot: "pass", readability: "pass", messages: [] };

  return res.json();
}

export async function generateCursor(
  pngBlob: Blob,
  hotspotX: number,
  hotspotY: number,
  cursorSize: number = 32,
  cursorName: string = "cursor"
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", pngBlob, "cursor.png");
  formData.append("hotspot_x", String(hotspotX));
  formData.append("hotspot_y", String(hotspotY));
  formData.append("cursor_size", String(cursorSize));
  formData.append("cursor_name", cursorName);

  const res = await fetch(`${BACKEND_URL}/api/generate-cursor`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Server error: ${res.status}`);
  }

  return res.blob();
}

export interface GenerateAniInput {
  aniName?: string;
  hotspotX?: number;
  hotspotY?: number;
  cursorSize?: number;
  fitMode?: FitMode;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
}

export interface BinaryDownloadResponse {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
}

export async function generateAni(
  gifBlob: Blob,
  input: GenerateAniInput = {}
): Promise<BinaryDownloadResponse> {
  const formData = new FormData();
  formData.append("file", gifBlob, "ani.gif");
  formData.append("cursor_name", input.aniName ?? "cursor");

  if (typeof input.hotspotX === "number") {
    formData.append("hotspot_x", String(input.hotspotX));
  }
  if (typeof input.hotspotY === "number") {
    formData.append("hotspot_y", String(input.hotspotY));
  }
  if (typeof input.cursorSize === "number") {
    formData.append("cursor_size", String(input.cursorSize));
  }
  if (input.fitMode) {
    formData.append("fit_mode", input.fitMode);
  }
  if (typeof input.offsetX === "number") {
    formData.append("offset_x", String(input.offsetX));
  }
  if (typeof input.offsetY === "number") {
    formData.append("offset_y", String(input.offsetY));
  }
  if (typeof input.scale === "number") {
    formData.append("scale", String(input.scale));
  }

  const res = await fetch(`${BACKEND_URL}/api/generate-ani`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Server error: ${res.status}`);
  }

  return {
    blob: await res.blob(),
    filename: parseContentDispositionFilename(
      res.headers.get("content-disposition")
    ),
    contentType: res.headers.get("content-type"),
  };
}

function parseContentDispositionFilename(header: string | null) {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    const fallback = parsePlainFilename(header);
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
    } catch {
      return fallback;
    }
  }

  return parsePlainFilename(header);
}

function parsePlainFilename(header: string) {
  const plainMatch = header.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return null;
}
