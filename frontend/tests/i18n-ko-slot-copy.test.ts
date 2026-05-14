import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("ko slot rail copy", () => {
  it("uses tool-oriented Korean labels for slot state and type", () => {
    const filePath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));

    expect(messages.studio.slotRailTitle).toBe("\uc2ac\ub86f");
    expect(messages.studio.slotNormal).toBe("\uc77c\ubc18");
    expect(messages.studio.slotText).toBe("\ud14d\uc2a4\ud2b8");
    expect(messages.studio.slotLink).toBe("\ub9c1\ud06c");
    expect(messages.studio.slotButton).toBe("\ubc84\ud2bc");
    expect(messages.studio.slotEmpty).toBe("\ube44\uc5b4 \uc788\uc74c");
    expect(messages.studio.slotFilled).toBe("\uc124\uc815\ub428");
    expect(messages.studio.slotKindUnset).toBe("\ubbf8\uc815");
    expect(messages.studio.slotStatic).toBe("\uc815\uc801");
    expect(messages.studio.slotAnimated).toBe("\uc560\ub2c8\uba54\uc774\uc158");
    expect(messages.studio.slotSelected).toBe("\uc120\ud0dd");
    expect(messages.studio.recommended).toBe("\ucd94\ucc9c");
    expect(messages.studio.manual).toBe("\uc218\ub3d9");
    expect(messages.studio.downloadAllRoles).toBe("\uc804\uccb4 \ub2e4\uc6b4\ub85c\ub4dc");
    expect(messages.studio.downloadCurrentSlot).toBe("\ud604\uc7ac \ucee4\uc11c");
    expect(messages.studio.viewZoom).toBe("\ubcf4\uae30 \ud655\ub300");
  });

  it("keeps simulation copy readable in Korean", () => {
    const filePath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));

    expect(messages.simulation.themeLight).toBe(
      "\ub77c\uc774\ud2b8 \ubaa8\ub4dc"
    );
    expect(messages.simulation.themeDark).toBe(
      "\ub2e4\ud06c \ubaa8\ub4dc"
    );
    expect(messages.simulation.themeModeSwitch).toBe(
      "\uc2dc\ubbac\ub808\uc774\uc158 \ud14c\ub9c8 \ubaa8\ub4dc \uc804\ud658"
    );
    expect(messages.simulation.placeholderNormalRequired).toBe(
      "\uc2dc\ubbac\ub808\uc774\uc158\uc744 \uc2dc\uc791\ud558\ub824\uba74 \uba3c\uc800 \ucee4\uc11c\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694."
    );
    expect(messages.simulation.browserTabDocumentation).toBe(
      "\uc0ac\uc6a9 \uac00\uc774\ub4dc"
    );
    expect(messages.simulation.browserQuickActions).toBe(
      "\ube60\ub978 \uc791\uc5c5"
    );
    expect(messages.simulation.browserAddress).toBe(
      "pointtint.com/cursor-preview"
    );
    expect(messages.simulation.browserOpenCursorSettings).toBe(
      "\ucee4\uc11c \uc124\uc815 \uc5f4\uae30"
    );
    expect(messages.simulation.browserGuideIntro).toBe(
      "\ub9c1\ud06c, \uc785\ub825\ucc3d, \ubc84\ud2bc \uc704\uc5d0\uc11c \ucee4\uc11c\ub97c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
    );
    expect(messages.simulation.browserApplyTheme).toBe(
      "\uc2dc\uc2a4\ud15c\uc5d0 \uc801\uc6a9"
    );
    expect(messages.simulation.browserSearchValue).toBe(
      "\ucee4\uc11c \uc2a4\ud0c0\uc77c"
    );
    expect(messages.simulation.windowTitleMeta).toBe(
      "\uc81c\ubaa9 \ud45c\uc2dc\uc904, \uac00\uc7a5\uc790\ub9ac, \ubaa8\uc11c\ub9ac\uc5d0 \ucee4\uc11c\ub97c \uc62c\ub824 \ud655\uc778\ud558\uc138\uc694."
    );
    expect(messages.simulation.windowSidebarTitle).toBe(
      "\ud14c\uc2a4\ud2b8 \ub300\uc0c1"
    );
    expect(messages.simulation.windowSidebarLayers).toBe(
      "\uc81c\ubaa9 \ud45c\uc2dc\uc904"
    );
    expect(messages.simulation.windowSidebarProperties).toBe(
      "\ucc3d \uac00\uc7a5\uc790\ub9ac"
    );
    expect(messages.simulation.windowSidebarHistory).toBe(
      "\ucc3d \ubaa8\uc11c\ub9ac"
    );
    expect(messages.simulation.windowCanvasTitle).toBe(
      "\uc778\ud130\ub799\ud2f0\ube0c \ubbf8\ub9ac\ubcf4\uae30"
    );
    expect(messages.simulation.systemGuideIntro).toBe(
      "\ub300\uae30, \ubc31\uadf8\ub77c\uc6b4\ub4dc \uc791\uc5c5, \uc0ac\uc6a9 \ubd88\uac00 \uc0c1\ud0dc\ub97c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
    );
    expect(messages.simulation.windowGuideTitle).toBe(
      "\ud14c\uc2a4\ud2b8 \uac00\uc774\ub4dc"
    );
    expect(messages.simulation.windowGuideIntro).toBe(
      "\ud604\uc7ac \ucc3d\uc5d0\uc11c \uc774\ub3d9\uacfc \ud06c\uae30 \uc870\uc808 \ucee4\uc11c\ub97c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
    );
    expect(messages.simulation.windowGuideMoveExpected).toBe(
      "\uc774\ub3d9"
    );
    expect(messages.simulation.windowGuideHorizontalExpected).toBe(
      "\uac00\ub85c \uc870\uc808"
    );
    expect(messages.simulation.windowGuideVerticalExpected).toBe(
      "\uc138\ub85c \uc870\uc808"
    );
    expect(messages.simulation.windowGuideDiagonalPrimaryExpected).toBe(
      "NW-SE \uc870\uc808"
    );
    expect(messages.simulation.windowGuideDiagonalSecondaryExpected).toBe(
      "NE-SW \uc870\uc808"
    );
  });

  it("uses concise image-fit labels in the studio inspector", () => {
    const koPath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const enPath = path.resolve(process.cwd(), "src/i18n/messages/en.json");
    const koMessages = JSON.parse(fs.readFileSync(koPath, "utf8"));
    const enMessages = JSON.parse(fs.readFileSync(enPath, "utf8"));

    expect(koMessages.panel.framing).toBe("\uc774\ubbf8\uc9c0 \ub9de\ucda4");
    expect(koMessages.panel.fitContain).toBe("\uc804\uccb4 \ub9de\ucda4");
    expect(koMessages.panel.fitCover).toBe("\uc601\uc5ed \ucc44\uc6c0");
    expect(enMessages.panel.framing).toBe("Image fit");
    expect(enMessages.panel.fitContain).toBe("Fit whole");
    expect(enMessages.panel.fitCover).toBe("Fill area");
  });

  it("keeps the browser preview address aligned across locales", () => {
    const koPath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const enPath = path.resolve(process.cwd(), "src/i18n/messages/en.json");
    const koMessages = JSON.parse(fs.readFileSync(koPath, "utf8"));
    const enMessages = JSON.parse(fs.readFileSync(enPath, "utf8"));

    expect(koMessages.simulation.browserAddress).toBe(
      "pointtint.com/cursor-preview"
    );
    expect(enMessages.simulation.browserAddress).toBe(
      "pointtint.com/cursor-preview"
    );
    expect(koMessages.simulation.windowGuideTitle).toBe(
      "\ud14c\uc2a4\ud2b8 \uac00\uc774\ub4dc"
    );
    expect(enMessages.simulation.windowGuideTitle).toBe("Test guide");
    expect(enMessages.simulation.windowGuideMoveExpected).toBe("Move");
    expect(enMessages.simulation.windowGuideHorizontalExpected).toBe(
      "Horizontal resize"
    );
    expect(enMessages.simulation.windowGuideVerticalExpected).toBe(
      "Vertical resize"
    );
    expect(enMessages.simulation.windowGuideDiagonalPrimaryExpected).toBe(
      "NW-SE resize"
    );
    expect(enMessages.simulation.windowGuideDiagonalSecondaryExpected).toBe(
      "NE-SW resize"
    );
    expect(enMessages.simulation.windowTitleMeta).toBe(
      "Hover the title bar, edges, and corners to test each cursor."
    );
  });

  it("covers quick-finish studio copy in English and Korean", () => {
    const koPath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const enPath = path.resolve(process.cwd(), "src/i18n/messages/en.json");
    const koMessages = JSON.parse(fs.readFileSync(koPath, "utf8"));
    const enMessages = JSON.parse(fs.readFileSync(enPath, "utf8"));

    expect(enMessages.studio.quickStartTitle).toBe(
      "Drop an image. Get a cursor."
    );
    expect(enMessages.studio.quickStartDescription).toBe(
      "Pointint will pick the default framing and hotspot for you.\nYou can fine-tune later if you want."
    );
    expect(enMessages.studio.quickResultTitle).toBe("Your cursor is ready");
    expect(enMessages.studio.quickResultDescription).toBe(
      "Download it now, or open fine-tuning if you want to adjust the details."
    );
    expect(enMessages.studio.quickDownload).toBe("Download cursor");
    expect(enMessages.studio.quickDownloadDescription).toBe(
      "Download the current cursor file"
    );
    expect(enMessages.studio.openAdvancedEditor).toBe("Fine-tune");
    expect(enMessages.studio.closeAdvancedEditor).toBe(
      "Back to simple view"
    );
    expect(enMessages.studio.quickBackgroundRemoveTitle).toBe(
      "Remove the background?"
    );
    expect(enMessages.studio.quickBackgroundRemoveDescription).toBe(
      "Use AI background removal for sticker-like cursor images."
    );
    expect(enMessages.studio.quickUseAsIs).toBe("Use as is");
    expect(enMessages.studio.quickRemoveBackground).toBe(
      "Remove background"
    );
    expect(enMessages.studio.expandToWindowsSet).toBe(
      "Build full Windows set"
    );

    expect(koMessages.studio.quickStartTitle).toBe(
      "\uc774\ubbf8\uc9c0\ub97c \ub123\uc73c\uba74 \ucee4\uc11c\ub85c \uc644\uc131\ud569\ub2c8\ub2e4"
    );
    expect(koMessages.studio.quickStartDescription).toBe(
      "\uae30\ubcf8 \ud504\ub808\uc774\ubc0d\uacfc \ud56b\uc2a4\ud31f\uc740 Pointint\uac00 \uba3c\uc800 \ub9de\ucda5\ub2c8\ub2e4.\n\ud544\uc694\ud558\uba74 \ub098\uc911\uc5d0 \uc138\ubd80 \uc870\uc815\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
    );
    expect(koMessages.studio.quickResultTitle).toBe(
      "\ucee4\uc11c\uac00 \uc900\ube44\ub410\uc5b4\uc694"
    );
    expect(koMessages.studio.quickResultDescription).toBe(
      "\ubc14\ub85c \ub2e4\uc6b4\ub85c\ub4dc\ud558\uac70\ub098, \ud544\uc694\ud560 \ub54c\ub9cc \uc138\ubd80 \uc870\uc815\uc744 \uc5f4\uc5b4\ubcf4\uc138\uc694."
    );
    expect(koMessages.studio.quickDownload).toBe(
      "\uc774\ub300\ub85c \ub2e4\uc6b4\ub85c\ub4dc"
    );
    expect(koMessages.studio.quickDownloadDescription).toBe(
      "\ud604\uc7ac \ucee4\uc11c \ud30c\uc77c\uc744 \ub2e4\uc6b4\ub85c\ub4dc\ud569\ub2c8\ub2e4"
    );
    expect(koMessages.studio.openAdvancedEditor).toBe(
      "\uc138\ubd80 \uc870\uc815"
    );
    expect(koMessages.studio.closeAdvancedEditor).toBe(
      "\uac04\ub2e8\ud788 \ubcf4\uae30"
    );
    expect(koMessages.studio.quickBackgroundRemoveTitle).toBe(
      "\ubc30\uacbd\uc744 \uc81c\uac70\ud560\uae4c\uc694?"
    );
    expect(koMessages.studio.quickBackgroundRemoveDescription).toBe(
      "\uc2a4\ud2f0\ucee4\ucc98\ub7fc \ubcf4\uc774\ub294 \ucee4\uc11c\uc5d0\ub294 AI \ubc30\uacbd \uc81c\uac70\uac00 \uc798 \ub9de\uc2b5\ub2c8\ub2e4."
    );
    expect(koMessages.studio.quickUseAsIs).toBe(
      "\uadf8\ub300\ub85c \uc644\uc131"
    );
    expect(koMessages.studio.quickRemoveBackground).toBe(
      "\ubc30\uacbd \uc81c\uac70\ud558\uace0 \uc644\uc131"
    );
    expect(koMessages.studio.expandToWindowsSet).toBe(
      "Windows \uc804\uccb4 \uc138\ud2b8\ub85c \ud655\uc7a5"
    );
  });

  it("covers Video to ANI upload workflow copy in English and Korean", () => {
    const koPath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const enPath = path.resolve(process.cwd(), "src/i18n/messages/en.json");
    const ko = JSON.parse(fs.readFileSync(koPath, "utf8"));
    const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

    expect(en.upload.aniVideoToAni).toBe("Video to ANI");
    expect(en.upload.aniVideoToAniSub).toBe(
      "Turn a short MP4 or WebM clip into an animated Windows cursor"
    );
    expect(ko.upload.aniVideoToAni).toBe(
      "\ub3d9\uc601\uc0c1\uc73c\ub85c \uc560\ub2c8\uba54\uc774\uc158 \ub9cc\ub4e4\uae30"
    );
    expect(ko.upload.aniVideoToAniSub).toBe(
      "\uc9e7\uc740 MP4 \ub610\ub294 WebM \uc601\uc0c1\uc744 \uc560\ub2c8\uba54\uc774\uc158 Windows \ucee4\uc11c\ub85c \ubc14\uafc9\ub2c8\ub2e4"
    );
  });

  it("covers Video to ANI extraction option copy in English and Korean", () => {
    const koPath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const enPath = path.resolve(process.cwd(), "src/i18n/messages/en.json");
    const ko = JSON.parse(fs.readFileSync(koPath, "utf8"));
    const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

    expect(en.studio.videoOptionsTitle).toBe("Extract settings");
    expect(en.studio.videoOptionsDisclosure).toBe("More settings");
    expect(en.studio.videoStartLabel).toBe("Start");
    expect(en.studio.videoDurationLabel).toBe("Length");
    expect(en.studio.videoFpsLabel).toBe("FPS");
    expect(en.studio.videoFrameEstimate).toBe("Up to {count} frames");
    expect(typeof en.studio.videoFrameEstimate).toBe("string");
    expect(en.studio.videoFrameEstimate.replace("{count}", "30")).toContain(
      "30"
    );

    expect(ko.studio.videoOptionsTitle).toBe("\ucd94\ucd9c \uc124\uc815");
    expect(ko.studio.videoOptionsDisclosure).toBe("\uc138\ubd80 \uc124\uc815");
    expect(ko.studio.videoStartLabel).toBe("\uc2dc\uc791");
    expect(ko.studio.videoDurationLabel).toBe("\uae38\uc774");
    expect(ko.studio.videoFpsLabel).toBe("FPS");
    expect(ko.studio.videoFrameEstimate).toBe(
      "\ucd5c\ub300 {count}\ud504\ub808\uc784"
    );
    expect(typeof ko.studio.videoFrameEstimate).toBe("string");
    expect(ko.studio.videoFrameEstimate.replace("{count}", "30")).toContain(
      "30"
    );
  });

  it("covers Video to ANI background-removal decision copy in English and Korean", () => {
    const koPath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const enPath = path.resolve(process.cwd(), "src/i18n/messages/en.json");
    const ko = JSON.parse(fs.readFileSync(koPath, "utf8"));
    const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

    expect(en.studio.videoBackgroundDecisionTitle).toBe(
      "Remove the background?"
    );
    expect(en.studio.videoBackgroundDecisionDescription).toBe(
      "Use transparent frames for sticker-like animated cursors."
    );
    expect(en.studio.videoBackgroundKeep).toBe("Use as is");
    expect(en.studio.videoBackgroundRemove).toBe("Remove background");
    expect(en.studio.videoBackgroundProcessingTitle).toBe(
      "Removing backgrounds"
    );
    expect(en.studio.videoBackgroundProcessingDescription).toBe(
      "{completed} / {total} frames processed"
    );

    expect(ko.studio.videoBackgroundDecisionTitle).toBe(
      "배경을 제거할까요?"
    );
    expect(ko.studio.videoBackgroundDecisionDescription).toBe(
      "스티커처럼 보이는 애니메이션 커서에는 투명 프레임이 잘 맞습니다."
    );
    expect(ko.studio.videoBackgroundKeep).toBe("그대로 사용");
    expect(ko.studio.videoBackgroundRemove).toBe("배경 제거");
    expect(ko.studio.videoBackgroundProcessingTitle).toBe("배경 제거 중");
    expect(ko.studio.videoBackgroundProcessingDescription).toBe(
      "{completed} / {total}프레임 처리 중"
    );
  });
});
