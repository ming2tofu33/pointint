import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContentHubSurface from "@/components/content/ContentHubSurface";
import GuidePageSurface from "@/components/content/GuidePageSurface";
import ToolPageSurface from "@/components/content/ToolPageSurface";
import {
  getGuidePage,
  getToolPage,
  guidePages,
  toolPages,
} from "@/lib/contentGrowth";

describe("content growth pages", () => {
  it("renders a tools hub that exposes both tool entry points", () => {
    render(
      <ContentHubSurface
        eyebrow="Tools"
        title="Cursor tools"
        description="Start with the cursor output you want to make."
        pages={toolPages}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Cursor tools" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Image to Cursor Converter" })
    ).toHaveAttribute("href", "/tools/image-to-cursor");
    expect(
      screen.getByRole("link", { name: "GIF to ANI Cursor Converter" })
    ).toHaveAttribute("href", "/tools/gif-to-ani-cursor");
  });

  it("renders a guides hub that exposes all trust guides", () => {
    render(
      <ContentHubSurface
        eyebrow="Guides"
        title="Cursor guides"
        description="Practical support for custom Windows cursor decisions."
        pages={guidePages}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Cursor guides" })
    ).toBeInTheDocument();

    for (const page of guidePages) {
      expect(screen.getByRole("link", { name: page.title })).toHaveAttribute(
        "href",
        page.path
      );
    }
  });

  it("defines Wave 1-2 tool pages with direct Studio workflow CTAs", () => {
    expect(toolPages.map((page) => page.slug)).toEqual([
      "image-to-cursor",
      "gif-to-ani-cursor",
    ]);

    expect(getToolPage("image-to-cursor")?.cta.href).toBe(
      "/studio?workflow=cur-static-image"
    );
    expect(getToolPage("gif-to-ani-cursor")?.cta.href).toBe(
      "/studio?workflow=ani-animated-gif"
    );
  });

  it("defines Wave 3 trust guides with practical support topics", () => {
    expect(guidePages.map((page) => page.slug)).toEqual([
      "how-to-change-cursor-windows",
      "what-is-cursor-hotspot",
      "cur-vs-ani",
      "fix-blurry-custom-cursor",
    ]);

    expect(getGuidePage("what-is-cursor-hotspot")?.title).toMatch(/hotspot/i);
    expect(getGuidePage("fix-blurry-custom-cursor")?.description).toMatch(
      /blurry/i
    );
  });

  it("renders a tool page with FAQ and related guide links", () => {
    const page = getToolPage("image-to-cursor");
    if (!page) throw new Error("Missing image-to-cursor page");

    render(<ToolPageSurface page={page} />);

    expect(
      screen.getByRole("heading", { level: 1, name: page.title })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: page.cta.label })).toHaveAttribute(
      "href",
      page.cta.href
    );

    const faq = screen.getByTestId("content-page-faq");
    expect(
      within(faq).getAllByRole("heading", { level: 3 }).length
    ).toBeGreaterThan(2);
    expect(
      screen
        .getAllByRole("link", { name: /hotspot/i })
        .some(
          (link) =>
            link.getAttribute("href") === "/guides/what-is-cursor-hotspot"
        )
    ).toBe(true);
  });

  it("renders a guide page with a product-led CTA", () => {
    const page = getGuidePage("how-to-change-cursor-windows");
    if (!page) throw new Error("Missing Windows install guide");

    render(<GuidePageSurface page={page} />);

    expect(
      screen.getByRole("heading", { level: 1, name: page.title })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: page.cta.label })).toHaveAttribute(
      "href",
      page.cta.href
    );
    expect(page.sections[0]?.items.length).toBeGreaterThanOrEqual(3);
  });
});
