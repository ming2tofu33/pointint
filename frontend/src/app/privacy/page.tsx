import { getTranslations } from "next-intl/server";

import PolicyPage from "@/components/policy/PolicyPage";

export default async function PrivacyPage() {
  const t = await getTranslations("policy");

  return (
    <PolicyPage title={t("privacyTitle")} body={t("privacyBody")} />
  );
}
