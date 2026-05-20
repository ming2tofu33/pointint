import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ToolPageSurface from "@/components/content/ToolPageSurface";
import { absoluteUrl, getToolPage } from "@/lib/contentGrowth";

const page = getToolPage("video-to-ani-cursor");

export const metadata: Metadata = {
  title: "Video to ANI Cursor Converter | Pointint",
  description:
    "Convert a short MP4 or WebM clip into a Windows .ani cursor with frame extraction, optional background removal, preview, and export.",
  alternates: {
    canonical: absoluteUrl("/tools/video-to-ani-cursor"),
  },
  openGraph: {
    title: "Video to ANI Cursor Converter | Pointint",
    description:
      "Make an animated Windows cursor from a short MP4 or WebM clip with Pointint Studio.",
    url: absoluteUrl("/tools/video-to-ani-cursor"),
    type: "website",
  },
};

export default function VideoToAniCursorPage() {
  if (!page) notFound();

  return <ToolPageSurface page={page} />;
}
