import { type WindowsRoleSlotId } from "@/lib/cursorThemeProject";

export interface WindowsRoleExportEntry {
  name: string;
  blob: Blob;
}

export function buildWindowsRoleDownloadFilename(slotId: WindowsRoleSlotId) {
  const segment = toWindowsRolePackageSegment(slotId);
  return `pointint-${segment}.zip`;
}

export function buildWindowsRolePackagePath(slotId: WindowsRoleSlotId) {
  const segment = toWindowsRolePackageSegment(slotId);
  return `${segment}/pointint-${segment}.zip`;
}

export async function buildWindowsRoleMasterZip(
  entries: WindowsRoleExportEntry[]
): Promise<Blob> {
  const binaryEntries = await Promise.all(
    entries.map(async (entry) => ({
      name: entry.name,
      data: await blobToUint8Array(entry.blob),
    }))
  );

  return buildZipArchive(binaryEntries, "application/zip");
}

function toWindowsRolePackageSegment(slotId: WindowsRoleSlotId) {
  return slotId.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
  if (typeof blob.arrayBuffer === "function") {
    return new Uint8Array(await blob.arrayBuffer()) as Uint8Array<ArrayBuffer>;
  }

  if (typeof blob.stream === "function") {
    const response = new Response(blob.stream());
    return new Uint8Array(await response.arrayBuffer()) as Uint8Array<ArrayBuffer>;
  }

  const response = new Response(blob);
  return new Uint8Array(await response.arrayBuffer()) as Uint8Array<ArrayBuffer>;
}

function buildZipArchive(
  entries: Array<{ name: string; data: Uint8Array<ArrayBuffer> }>,
  mimeType: string
) {
  const localParts: Uint8Array<ArrayBuffer>[] = [];
  const centralParts: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const crc = crc32(entry.data);
    const localHeader = concatUint8Arrays([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(crc),
      uint32(entry.data.length),
      uint32(entry.data.length),
      uint16(nameBytes.length),
      uint16(0),
      nameBytes,
      entry.data,
    ]);

    localParts.push(localHeader);

    const centralHeader = concatUint8Arrays([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(crc),
      uint32(entry.data.length),
      uint32(entry.data.length),
      uint16(nameBytes.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      nameBytes,
    ]);

    centralParts.push(centralHeader);
    offset += localHeader.length;
  }

  const centralDirectory = concatUint8Arrays(centralParts);
  const endOfCentralDirectory = concatUint8Arrays([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0),
  ]);

  return new Blob([...localParts, centralDirectory, endOfCentralDirectory], {
    type: mimeType,
  });
}

function concatUint8Arrays(parts: Uint8Array<ArrayBuffer>[]) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(size) as Uint8Array<ArrayBuffer>;
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function uint16(value: number) {
  const out = new Uint8Array(2);
  new DataView(out.buffer).setUint16(0, value, true);
  return out as Uint8Array<ArrayBuffer>;
}

function uint32(value: number) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value >>> 0, true);
  return out as Uint8Array<ArrayBuffer>;
}

const CRC32_TABLE = createCrc32Table();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff]!;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let bit = 0; bit < 8; bit += 1) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}
