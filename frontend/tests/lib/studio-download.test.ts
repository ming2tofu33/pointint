import {
  buildWindowsRoleDownloadFilename,
  buildWindowsRolePackagePath,
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
});
