import type { ShowcaseCopy } from "@/components/landing/ShowcaseSurface";
import { showcaseSamples } from "@/lib/showcaseSamples";

type Translate = (key: string) => string;

export function buildShowcaseCopy(
  t: Translate,
  guideT: Translate
): ShowcaseCopy {
  return {
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
  };
}
