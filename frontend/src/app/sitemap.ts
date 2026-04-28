import type { MetadataRoute } from "next";

import { guidePages, toolPages } from "@/lib/contentGrowth";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://pointtint.com",
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://pointtint.com/studio",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://pointtint.com/explore",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://pointtint.com/tools",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: "https://pointtint.com/guides",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.72,
    },
    ...toolPages.map((page) => ({
      url: `https://pointtint.com${page.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: page.slug === "image-to-cursor" ? 0.9 : 0.85,
    })),
    ...guidePages.map((page) => ({
      url: `https://pointtint.com${page.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
