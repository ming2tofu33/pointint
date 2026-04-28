import type { Metadata } from "next";

import ContentHubSurface from "@/components/content/ContentHubSurface";
import { absoluteUrl, guidePages } from "@/lib/contentGrowth";

export const metadata: Metadata = {
  title: "Cursor Guides | Pointint",
  description:
    "Practical guides for Windows custom cursors, cursor hotspots, CUR vs ANI formats, and sharper cursor exports.",
  alternates: {
    canonical: absoluteUrl("/guides"),
  },
};

export default function GuidesPage() {
  return (
    <ContentHubSurface
      eyebrow="Guides"
      title="Cursor guides"
      description="Practical support for custom Windows cursor decisions, from applying files to fixing blurry results."
      pages={guidePages}
    />
  );
}
