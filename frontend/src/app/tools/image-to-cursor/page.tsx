import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ToolPageSurface from "@/components/content/ToolPageSurface";
import { absoluteUrl, getToolPage } from "@/lib/contentGrowth";

const page = getToolPage("image-to-cursor");

export const metadata: Metadata = {
  title: "Image to Cursor Converter | Pointint",
  description:
    "Turn PNG, JPG, or WebP images into Windows-ready .cur cursor files with hotspot editing, preview, and download guidance.",
  alternates: {
    canonical: absoluteUrl("/tools/image-to-cursor"),
  },
  openGraph: {
    title: "Image to Cursor Converter | Pointint",
    description:
      "Make a custom Windows cursor from an image with Pointint Studio.",
    url: absoluteUrl("/tools/image-to-cursor"),
    type: "website",
  },
};

export default function ImageToCursorPage() {
  if (!page) notFound();

  return <ToolPageSurface page={page} />;
}
