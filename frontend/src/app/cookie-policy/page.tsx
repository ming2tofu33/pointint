import { getTranslations } from "next-intl/server";

import PolicyPage from "@/components/policy/PolicyPage";

export default async function CookiePolicyPage() {
  const t = await getTranslations("policy");

  return (
    <PolicyPage title={t("cookieTitle")} body={t("cookieBody")} />
  );
}
