import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readMessages(locale: "en" | "ko") {
  const filePath = path.resolve(
    process.cwd(),
    `src/i18n/messages/${locale}.json`,
  );

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

describe("Windows install copy", () => {
  it("keeps English install copy honest about manual Windows activation", () => {
    const messages = readMessages("en");
    const serialized = JSON.stringify(messages);

    expect(serialized).not.toContain("one-click installer");
    expect(messages.guide.step1).toBe("Extract the downloaded ZIP");
    expect(messages.guide.step4).toBe(
      'Select "Pointint" from the Scheme dropdown, then click OK',
    );
    expect(messages.guide.restore).toBe(
      "To remove the Pointint pointer set from the list, right-click",
    );
    expect(messages.guide.restoreAction).toBe(
      'then choose "Install". If Pointint is active, switch to Windows Default in pointer settings.',
    );
  });

  it("keeps Korean install copy clear about pointer sets and removal", () => {
    const messages = readMessages("ko");
    const serialized = JSON.stringify(messages);

    expect(serialized).not.toContain("원클릭");
    expect(messages.guide.step1).toBe("다운로드한 ZIP 파일의 압축을 풉니다");
    expect(messages.guide.step4).toBe(
      '구성표(커서 세트) 드롭다운에서 "Pointint"를 선택하고 확인을 누릅니다',
    );
    expect(messages.guide.restore).toBe(
      "Pointint 커서 세트를 목록에서 제거하려면",
    );
    expect(messages.guide.restoreAction).toBe(
      '를 마우스 오른쪽 버튼으로 클릭한 뒤 "Install"을 선택하세요. Pointint가 적용 중이라면 포인터 설정에서 Windows Default로 전환하세요',
    );
  });
});
