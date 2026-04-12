import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("ko translation copy", () => {
  it("keeps consent, footer, and policy labels in Korean", () => {
    const filePath = path.resolve(
      process.cwd(),
      "src/i18n/messages/ko.json"
    );
    const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));

    expect(messages.consent.title).toBe("쿠키 설정");
    expect(messages.consent.body).toBe(
      "사용자 경험 개선을 위해 쿠키를 사용합니다."
    );
    expect(messages.consent.details).toBe("자세히 보기");
    expect(messages.landing.footerPolicyLabel).toBe("정책");
    expect(messages.landing.footerPrivacyLabel).toBe("개인정보 처리방침");
    expect(messages.landing.footerCookieLabel).toBe("쿠키 정책");
    expect(messages.landing.footerTermsLabel).toBe("이용약관");
    expect(messages.policy.privacyTitle).toBe("개인정보 처리방침");
    expect(messages.policy.cookieTitle).toBe("쿠키 정책");
    expect(messages.policy.termsTitle).toBe("이용약관");
  });
});
