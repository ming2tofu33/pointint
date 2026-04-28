import type { Metadata } from "next";

import ContentHubSurface from "@/components/content/ContentHubSurface";
import { absoluteUrl, toolPages } from "@/lib/contentGrowth";

export const metadata: Metadata = {
  title: "Cursor Tools | Pointint",
  description:
    "Choose a Pointint cursor tool: make a Windows cursor from an image or convert a GIF into a Windows .ani cursor.",
  alternates: {
    canonical: absoluteUrl("/tools"),
  },
};

export default function ToolsPage() {
  return (
    <ContentHubSurface
      eyebrow="Tools"
      title="Cursor tools"
      description="Start with the cursor output you want to make. These tools route directly into the Studio workflow that fits the source."
      pages={toolPages}
    />
  );
}
