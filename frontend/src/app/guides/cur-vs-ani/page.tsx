import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GuidePageSurface from "@/components/content/GuidePageSurface";
import { absoluteUrl, getGuidePage } from "@/lib/contentGrowth";

const page = getGuidePage("cur-vs-ani");

export const metadata: Metadata = {
  title: "CUR vs ANI Cursor Files | Pointint",
  description:
    "Learn when to use static .cur files and when to use animated .ani files for a Windows cursor set.",
  alternates: {
    canonical: absoluteUrl("/guides/cur-vs-ani"),
  },
};

export default function CurVsAniPage() {
  if (!page) notFound();

  return <GuidePageSurface page={page} />;
}
