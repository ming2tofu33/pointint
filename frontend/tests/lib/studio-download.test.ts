import {
  buildWindowsRoleInstallInf,
  buildWindowsRoleDownloadFilename,
  buildWindowsRolePackagePath,
  buildWindowsRoleRestoreInf,
} from "@/lib/studioDownload";

describe("studioDownload", () => {
  it("uses Windows role-style filenames instead of internal slot ids", () => {
    expect(buildWindowsRoleDownloadFilename("normalSelect", "cur")).toBe(
      "pointint_arrow.cur"
    );
    expect(buildWindowsRoleDownloadFilename("textSelect", "cur")).toBe(
      "pointint_ibeam.cur"
    );
    expect(buildWindowsRoleDownloadFilename("linkSelect", "ani")).toBe(
      "pointint_link.ani"
    );
    expect(buildWindowsRoleDownloadFilename("workingInBackground", "ani")).toBe(
      "pointint_working.ani"
    );
    expect(buildWindowsRoleDownloadFilename("horizontalResize", "cur")).toBe(
      "pointint_ew.cur"
    );
    expect(buildWindowsRoleDownloadFilename("diagonalResize2", "cur")).toBe(
      "pointint_nesw.cur"
    );
  });

  it("builds package paths from the Windows role-style filenames", () => {
    expect(buildWindowsRolePackagePath("busy", "ani")).toBe(
      "cursors/pointint_busy.ani"
    );
    expect(buildWindowsRolePackagePath("unavailable", "cur")).toBe(
      "cursors/pointint_unavail.cur"
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

    expect(inf).toContain('[DefaultInstall]');
    expect(inf).toContain('CopyFiles = Scheme.Cursors');
    expect(inf).toContain('pointint_arrow.cur');
    expect(inf).toContain('pointint_working.ani');
    expect(inf).toContain('pointint_busy.ani');
    expect(inf).toContain('pointint_link.ani');
    expect(inf).toContain('pointint_move.cur');
    expect(inf).toContain(
      'HKCU,"Control Panel\\Cursors\\Schemes","Pointint",,"%10%\\Cursors\\Pointint\\pointint_arrow.cur'
    );
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_working.ani');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_busy.ani');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_link.ani');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_unavail.cur');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_ns.cur');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_ew.cur');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_nwse.cur');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_nesw.cur');
    expect(inf).toContain('%10%\\Cursors\\Pointint\\pointint_move.cur');
  });

  it("generates a restore INF that removes the Pointint scheme", () => {
    const inf = buildWindowsRoleRestoreInf();

    expect(inf).toContain("[DefaultInstall]");
    expect(inf).toContain("DelReg = Restore.Reg");
    expect(inf).toContain(
      'HKCU,"Control Panel\\Cursors\\Schemes","Pointint"'
    );
  });
});
