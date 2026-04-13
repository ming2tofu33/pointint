import { describe, expect, it } from "vitest";

import {
  ensureAniZipPackage,
  type AniDownloadPayload,
} from "@/lib/aniDownload";

async function readBlobBytes(blob: Blob) {
  if (typeof FileReader !== "undefined") {
    return await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result;
        if (!(buffer instanceof ArrayBuffer)) {
          reject(new Error("Expected ArrayBuffer from FileReader"));
          return;
        }
        resolve(new Uint8Array(buffer));
      };
      reader.onerror = () => reject(new Error("Failed to read Blob"));
      reader.readAsArrayBuffer(blob);
    });
  }

  if (typeof blob.arrayBuffer === "function") {
    return new Uint8Array(await blob.arrayBuffer());
  }

  if (typeof blob.stream === "function") {
    const reader = blob.stream().getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      chunks.push(chunk);
      total += chunk.length;
    }

    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  }

  return new Uint8Array(await new Response(blob).arrayBuffer());
}

describe("ensureAniZipPackage", () => {
  it("wraps legacy raw ANI responses into a zip package", async () => {
    const rawAni = new Blob(["RIFFdemoACON"], {
      type: "application/octet-stream",
    });
    const payload: AniDownloadPayload = {
      blob: rawAni,
      filename: "orbit.ani",
      contentType: "application/octet-stream",
    };

    const zipBlob = await ensureAniZipPackage(payload, "orbit");
    const bytes = await readBlobBytes(zipBlob);
    const text = new TextDecoder().decode(bytes);

    expect(zipBlob.type).toBe("application/zip");
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(text).toContain("orbit.ani");
    expect(text).toContain("apply-ani.txt");
  });

  it("keeps existing zip responses unchanged", async () => {
    const zipBlob = new Blob(["PKdemo"], { type: "application/zip" });
    const payload: AniDownloadPayload = {
      blob: zipBlob,
      filename: "pointint-orbit.zip",
      contentType: "application/zip",
    };

    const result = await ensureAniZipPackage(payload, "orbit");

    expect(result).toBe(zipBlob);
  });
});
