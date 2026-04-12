import { getTranslations } from "next-intl/server";
import LandingPage from "@/components/landing/LandingPage";
import { buildShowcaseCopy } from "@/lib/showcaseCopy";

export default async function Home() {
  const t = await getTranslations("landing");
  const guideT = await getTranslations("guide");

  const copy = {
    hero: {
      logo: t("logo"),
      tagline: t("tagline"),
      sub: t("heroSub"),
      cta: t("startCreating"),
      proofLabel: t("proofLabel"),
      proofSourceAlt: t("proofSourceAlt"),
      proofCursorAlt: t("proofCursorAlt"),
      proofSourceCaption: t("proofSourceCaption"),
      proofCursorCaption: t("proofCursorCaption"),
    },
    workflow: {
      title: t("workflowTitle"),
      sub: t("workflowSub"),
      steps: [
        {
          title: t("step1Title"),
          sub: t("step1Sub"),
        },
        {
          title: t("step2Title"),
          sub: t("step2Sub"),
        },
        {
          title: t("step3Title"),
          sub: t("step3Sub"),
        },
      ],
    },
    showcase: buildShowcaseCopy(t, guideT),
    mood: {
      eyebrow: t("moodEyebrow"),
      title: t("moodTitle"),
      sub: t("moodSub"),
    },
    trust: {
      title: t("trustTitle"),
      facts: [
        t("trustFact1"),
        t("trustFact2"),
        t("trustFact3"),
        t("trustFact4"),
      ],
      cta: t("startCreating"),
    },
    footer: {
      tagline: t("footerTagline"),
      policyLabel: t("footerPolicyLabel"),
      privacyLabel: t("footerPrivacyLabel"),
      cookieLabel: t("footerCookieLabel"),
      termsLabel: t("footerTermsLabel"),
    },
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Pointint",
    url: "https://pointtint.com",
    applicationCategory: "DesignApplication",
    operatingSystem: "Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Turn an image into a custom Windows cursor in a proof-first flow. Upload, refine, preview, and download a Windows-ready .cur.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <LandingPage copy={copy} />
    </>
  );
}
