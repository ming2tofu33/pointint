import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GuidePageSurface from "@/components/content/GuidePageSurface";
import { absoluteUrl, getGuidePage } from "@/lib/contentGrowth";

const page = getGuidePage("fix-blurry-custom-cursor");

export const metadata: Metadata = {
  title: "How to Fix a Blurry Custom Cursor | Pointint",
  description:
    "Troubleshoot blurry custom cursors with better source images, output-size checks, background cleanup, and framing.",
  alternates: {
    canonical: absoluteUrl("/guides/fix-blurry-custom-cursor"),
  },
};

export default function FixBlurryCustomCursorPage() {
  if (!page) notFound();

  return <GuidePageSurface page={page} />;
}
