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
  hotspotY: number
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", pngBlob, "cursor.png");
  formData.append("hotspot_x", String(hotspotX));
  formData.append("hotspot_y", String(hotspotY));

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
