import {
  getDefaultCursorNameForSlot,
  type WindowsRoleSlotId,
} from "@/lib/cursorThemeProject";

export interface WindowsRoleExportEntry {
  name: string;
  blob: Blob;
}

export interface WindowsRoleInstallerEntry {
  slotId: WindowsRoleSlotId;
  extension: Exclude<WindowsRoleExportExtension, "zip">;
}

export type WindowsRoleExportExtension = "cur" | "ani" | "zip";

const WINDOWS_SCHEME_ORDER: Array<WindowsRoleSlotId | null> = [
  "normalSelect",
  null,
  "workingInBackground",
  "busy",
  null,
  "textSelect",
  null,
  "unavailable",
  "verticalResize",
  "horizontalResize",
  "diagonalResize1",
  "diagonalResize2",
  "move",
  null,
  "linkSelect",
];

export function buildWindowsRoleDownloadFilename(
  slotId: WindowsRoleSlotId,
  extension: WindowsRoleExportExtension = "zip"
) {
  const roleName = getDefaultCursorNameForSlot(slotId);
  return `pointint_${roleName}.${extension}`;
}

export function buildWindowsRolePackagePath(
  slotId: WindowsRoleSlotId,
  extension: Exclude<WindowsRoleExportExtension, "zip">
) {
  return `cursors/${buildWindowsRoleDownloadFilename(slotId, extension)}`;
}

export function buildWindowsRoleInstallInf(
  entries: WindowsRoleInstallerEntry[]
) {
  const configuredPaths = new Map<WindowsRoleSlotId, string>();

  entries.forEach((entry) => {
    configuredPaths.set(
      entry.slotId,
      `%10%\\Cursors\\Pointint\\${buildWindowsRoleDownloadFilename(
        entry.slotId,
        entry.extension
      )}`
    );
  });

  const schemeValue = WINDOWS_SCHEME_ORDER.map((slotId) =>
    slotId ? configuredPaths.get(slotId) ?? "" : ""
  ).join(",");

  const copyFiles = entries
    .map((entry) => buildWindowsRoleDownloadFilename(entry.slotId, entry.extension))
    .join("\n");

  const inf = `; Pointint Windows role cursor set
; Right-click this file and select "Install".
; Then go to Settings > Mouse > Additional mouse settings > Pointers
; and select "Pointint" from the Scheme dropdown.

[Version]
signature="$CHICAGO$"

[DefaultInstall]
CopyFiles = Scheme.Cursors
AddReg    = Scheme.Reg

[DestinationDirs]
Scheme.Cursors = 10,"Cursors\\Pointint"

[Scheme.Cursors]
${copyFiles}

[Scheme.Reg]
HKCU,"Control Panel\\Cursors\\Schemes","Pointint",,"${schemeValue}"

[Strings]
`;

  return inf.replace(/\n/g, "\r\n");
}

export function buildWindowsRoleRestoreInf() {
  const inf = `; Pointint Cursor Restore Default
; Right-click this file and select "Install".
; This removes the Pointint cursor scheme.
; Then go to Settings > Mouse > Additional mouse settings > Pointers
; and select "None" or "Windows Default" from the Scheme dropdown.

[Version]
signature="$CHICAGO$"

[DefaultInstall]
DelReg = Restore.Reg

[Restore.Reg]
HKCU,"Control Panel\\Cursors\\Schemes","Pointint"

[Strings]
`;

  return inf.replace(/\n/g, "\r\n");
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
