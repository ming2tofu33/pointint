import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GuidePageSurface from "@/components/content/GuidePageSurface";
import { absoluteUrl, getGuidePage } from "@/lib/contentGrowth";

const page = getGuidePage("how-to-change-cursor-windows");

export const metadata: Metadata = {
  title: "How to Change Your Cursor on Windows | Pointint",
  description:
    "Learn how to apply custom .cur and .ani cursor files in Windows and save them as a pointer scheme.",
  alternates: {
    canonical: absoluteUrl("/guides/how-to-change-cursor-windows"),
  },
};

export default function HowToChangeCursorWindowsPage() {
  if (!page) notFound();

  return <GuidePageSurface page={page} />;
}
