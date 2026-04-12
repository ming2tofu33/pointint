import { getTranslations } from "next-intl/server";

import PolicyPage from "@/components/policy/PolicyPage";

export default async function TermsPage() {
  const t = await getTranslations("policy");

  return (
    <PolicyPage title={t("termsTitle")} body={t("termsBody")} />
  );
}
