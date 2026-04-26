import {
  buildWindowsRoleInstallInf,
  buildWindowsRoleDownloadFilename,
  buildWindowsRoleMasterZip,
  buildWindowsRolePackagePath,
  buildWindowsRoleRestoreInf,
} from "@/lib/studioDownload";

describe("studioDownload", () => {
  it("uses Windows role-style filenames instead of internal slot ids", () => {
    expect(buildWindowsRoleDownloadFilename("normalSelect", "cur")).toBe(
      "pointint_arrow.cur",
    );
    expect(buildWindowsRoleDownloadFilename("textSelect", "cur")).toBe(
      "pointint_ibeam.cur",
    );
    expect(buildWindowsRoleDownloadFilename("linkSelect", "ani")).toBe(
      "pointint_link.ani",
    );
    expect(buildWindowsRoleDownloadFilename("workingInBackground", "ani")).toBe(
      "pointint_working.ani",
    );
    expect(buildWindowsRoleDownloadFilename("horizontalResize", "cur")).toBe(
      "pointint_ew.cur",
    );
    expect(buildWindowsRoleDownloadFilename("diagonalResize2", "cur")).toBe(
      "pointint_nesw.cur",
    );
  });

  it("builds package paths from the Windows role-style filenames", () => {
    expect(buildWindowsRolePackagePath("busy", "ani")).toBe(
      "cursors/pointint_busy.ani",
    );
    expect(buildWindowsRolePackagePath("unavailable", "cur")).toBe(
      "cursors/pointint_unavail.cur",
    );
  });

  it("generates an installer INF that maps configured Windows roles into a scheme", () => {
    const inf = buildWindowsRoleInstallInf([
      { slotId: "normalSelect", extension: "cur" },
      { slotId: "textSelect", extension: "cur" },
      { slotId: "linkSelect", extension: "ani" },
      { slotId: "busy", extension: "ani" },
      { slotId: "workingInBackground", extension: "ani" },
      { slotId: "move", extension: "cur" },
      { slotId: "horizontalResize", extension: "cur" },
      { slotId: "verticalResize", extension: "cur" },
      { slotId: "diagonalResize1", extension: "cur" },
      { slotId: "diagonalResize2", extension: "cur" },
      { slotId: "unavailable", extension: "cur" },
    ]);

    expect(inf).toContain("[DefaultInstall]");
    expect(inf).toContain("CopyFiles = Scheme.Cursors");
    expect(inf).toContain('Scheme.Cursors = 10,"Cursors\\Pointint"');
    expect(inf).toContain('1 = "Pointint cursor files",,,');
    expect(inf).toContain("pointint_arrow.cur = 1,\\cursors");
    expect(inf).toContain("pointint_arrow.cur");
    expect(inf).toContain("pointint_working.ani");
    expect(inf).toContain("pointint_busy.ani");
    expect(inf).toContain("pointint_link.ani");
    expect(inf).toContain("pointint_move.cur");
    expect(inf).toContain(
      'HKCU,"Control Panel\\Cursors\\Schemes","Pointint",,"%10%\\Cursors\\Pointint\\pointint_arrow.cur',
    );
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_working.ani");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_busy.ani");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_link.ani");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_unavail.cur");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_ns.cur");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_ew.cur");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_nwse.cur");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_nesw.cur");
    expect(inf).toContain("%10%\\Cursors\\Pointint\\pointint_move.cur");
  });

  it("fills unconfigured Windows roles with system default cursors", () => {
    const inf = buildWindowsRoleInstallInf([
      { slotId: "normalSelect", extension: "cur" },
    ]);

    expect(inf).toContain(
      'HKCU,"Control Panel\\Cursors\\Schemes","Pointint",,"%10%\\Cursors\\Pointint\\pointint_arrow.cur,%SystemRoot%\\cursors\\aero_helpsel.cur,%SystemRoot%\\cursors\\aero_working.ani,%SystemRoot%\\cursors\\aero_busy.ani,%SystemRoot%\\cursors\\cross_r.cur,%SystemRoot%\\cursors\\beam_r.cur,%SystemRoot%\\cursors\\aero_pen.cur,%SystemRoot%\\cursors\\aero_unavail.cur,%SystemRoot%\\cursors\\aero_ns.cur,%SystemRoot%\\cursors\\aero_ew.cur,%SystemRoot%\\cursors\\aero_nwse.cur,%SystemRoot%\\cursors\\aero_nesw.cur,%SystemRoot%\\cursors\\aero_move.cur,%SystemRoot%\\cursors\\aero_up.cur,%SystemRoot%\\cursors\\aero_link.cur"',
    );
  });

  it("generates a restore INF that removes the Pointint scheme", () => {
    const inf = buildWindowsRoleRestoreInf();

    expect(inf).toContain("; Pointint Cursor Remove");
    expect(inf).toContain(
      "; This removes the Pointint entry from Windows pointer settings.",
    );
    expect(inf).toContain('; and select "Windows Default".');
    expect(inf).toContain("[DefaultInstall]");
    expect(inf).toContain("DelReg = Restore.Reg");
    expect(inf).toContain('HKCU,"Control Panel\\Cursors\\Schemes","Pointint"');
  });

  it("builds a flat Windows package zip with cursor and installer entries", async () => {
    const zip = await buildWindowsRoleMasterZip([
      {
        name: "cursors/pointint_arrow.cur",
        blob: new Blob(["arrow"], { type: "application/octet-stream" }),
      },
      {
        name: "cursors/pointint_ibeam.cur",
        blob: new Blob(["ibeam"], { type: "application/octet-stream" }),
      },
      {
        name: "install.inf",
        blob: new Blob(["install"], { type: "text/plain" }),
      },
      {
        name: "restore-default.inf",
        blob: new Blob(["restore"], { type: "text/plain" }),
      },
    ]);

    const zipBytes = new Uint8Array(await readBlobAsArrayBuffer(zip));
    const zipText = new TextDecoder().decode(zipBytes);

    expect(zip.type).toBe("application/zip");
    expect(zipText).toContain("cursors/pointint_arrow.cur");
    expect(zipText).toContain("cursors/pointint_ibeam.cur");
    expect(zipText).toContain("install.inf");
    expect(zipText).toContain("restore-default.inf");
  });
});

function readBlobAsArrayBuffer(blob: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}
