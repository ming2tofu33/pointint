import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ToolPageSurface from "@/components/content/ToolPageSurface";
import { absoluteUrl, getToolPage } from "@/lib/contentGrowth";

const page = getToolPage("gif-to-ani-cursor");

export const metadata: Metadata = {
  title: "GIF to ANI Cursor Converter | Pointint",
  description:
    "Convert an animated GIF into a Windows .ani cursor with shared framing, hotspot editing, preview, and export.",
  alternates: {
    canonical: absoluteUrl("/tools/gif-to-ani-cursor"),
  },
  openGraph: {
    title: "GIF to ANI Cursor Converter | Pointint",
    description:
      "Make an animated Windows cursor from a GIF with Pointint Studio.",
    url: absoluteUrl("/tools/gif-to-ani-cursor"),
    type: "website",
  },
};

export default function GifToAniCursorPage() {
  if (!page) notFound();

  return <ToolPageSurface page={page} />;
}
