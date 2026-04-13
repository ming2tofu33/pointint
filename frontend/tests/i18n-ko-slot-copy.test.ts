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
  });
});
