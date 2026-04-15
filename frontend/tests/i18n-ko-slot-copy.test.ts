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
    expect(messages.studio.downloadCurrentSlot).toBe(
      "\uc120\ud0dd\ud55c \ucee4\uc11c \ub2e4\uc6b4\ub85c\ub4dc"
    );
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
});
