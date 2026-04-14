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
    expect(messages.studio.downloadCurrentSlot).toBe("\ud604\uc7ac \uc2ac\ub86f\ub9cc \ub2e4\uc6b4\ub85c\ub4dc");
  });

  it("keeps simulation copy readable in Korean", () => {
    const filePath = path.resolve(process.cwd(), "src/i18n/messages/ko.json");
    const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));

    expect(messages.simulation.bgLight).toBe("\ubc1d\uc740 \ubc30\uacbd");
    expect(messages.simulation.bgDark).toBe("\uc5b4\ub450\uc6b4 \ubc30\uacbd");
    expect(messages.simulation.backgroundModeSwitch).toBe(
      "\uc2dc\ubbac\ub808\uc774\uc158 \ubc30\uacbd \ubaa8\ub4dc"
    );
    expect(messages.simulation.placeholderNormalRequired).toBe(
      "\uae30\ubcf8 \ud3ec\uc778\ud130\ub97c \ucd94\uac00\ud558\uba74 \uc2dc\ubbac\ub808\uc774\uc158\uc744 \ubbf8\ub9ac\ubcfc \uc218 \uc788\uc2b5\ub2c8\ub2e4."
    );
    expect(messages.simulation.browserTabDocumentation).toBe(
      "\uc124\uce58 \uac00\uc774\ub4dc"
    );
    expect(messages.simulation.browserQuickActions).toBe(
      "\ube60\ub978 \uc791\uc5c5"
    );
    expect(messages.simulation.browserOpenCursorSettings).toBe(
      "\ucee4\uc11c \uc124\uc815 \uc5f4\uae30"
    );
    expect(messages.simulation.browserApplyTheme).toBe(
      "\ud14c\ub9c8 \uc801\uc6a9"
    );
    expect(messages.simulation.browserSearchValue).toBe(
      "\ud3ec\uc778\ud130 \uad6c\uc131\ud45c"
    );
  });
});
