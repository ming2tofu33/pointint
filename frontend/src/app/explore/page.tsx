import { getTranslations } from "next-intl/server";

import ExplorePageSurface from "@/components/explore/ExplorePageSurface";
import { buildShowcaseCopy } from "@/lib/showcaseCopy";

export default async function ExplorePage() {
  const exploreT = await getTranslations("explore");
  const landingT = await getTranslations("landing");
  const guideT = await getTranslations("guide");

  return (
    <ExplorePageSurface
      title={exploreT("title")}
      sub={exploreT("sub")}
      showcase={buildShowcaseCopy(landingT, guideT)}
    />
  );
}
