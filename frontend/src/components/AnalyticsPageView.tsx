"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { initAnalytics, trackPageView } from "@/lib/analytics";

export default function AnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    initAnalytics();
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
