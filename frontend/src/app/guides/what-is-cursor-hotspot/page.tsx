import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GuidePageSurface from "@/components/content/GuidePageSurface";
import { absoluteUrl, getGuidePage } from "@/lib/contentGrowth";

const page = getGuidePage("what-is-cursor-hotspot");

export const metadata: Metadata = {
  title: "What Is a Cursor Hotspot? | Pointint",
  description:
    "Understand cursor hotspots, why click position matters, and how to set a precise hotspot for Windows cursor files.",
  alternates: {
    canonical: absoluteUrl("/guides/what-is-cursor-hotspot"),
  },
};

export default function WhatIsCursorHotspotPage() {
  if (!page) notFound();

  return <GuidePageSurface page={page} />;
}
