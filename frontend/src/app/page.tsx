import { getTranslations } from "next-intl/server";
import LandingPage from "@/components/landing/LandingPage";
import { showcaseSamples } from "@/lib/showcaseSamples";

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
    showcase: {
      eyebrow: t("showcaseEyebrow"),
      title: t("showcaseTitle"),
      sub: t("showcaseSub"),
      installStripTitle: t("showcaseStripTitle"),
      installStripBody: t("showcaseStripBody"),
      installStripCta: t("showcaseStripCta"),
      studioCta: t("showcaseStudioCta"),
      installGuide: {
        eyebrow: t("showcaseGuideEyebrow"),
        title: t("showcaseGuideTitle"),
        close: guideT("close"),
        step1: guideT("step1"),
        step2: guideT("step2"),
        step3: guideT("step3"),
        step4: guideT("step4"),
        restore: guideT("restore"),
        restoreFile: guideT("restoreFile"),
        restoreAction: guideT("restoreAction"),
        gotIt: guideT("gotIt"),
      },
      samples: showcaseSamples.map((sample) => ({
        id: sample.id,
        title: t(`${sample.id}Title`),
        description: t(`${sample.id}Sub`),
        badge: t("showcaseBadge"),
        downloadLabel: t("showcaseDownloadLabel"),
        previewLabel: t(`${sample.id}Alt`),
        previewSrc: sample.previewSrc,
        bundleHref: sample.bundleHref,
        bundleFileName: sample.bundleFileName,
        accent: sample.accent,
      })),
    },
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
