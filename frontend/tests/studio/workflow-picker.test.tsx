// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WorkflowPicker } from "../../src/components/WorkflowPicker";
import en from "../../src/i18n/messages/en.json";
import { WORKFLOW_OPTIONS } from "../../src/lib/studioWorkflow";

afterEach(() => {
  cleanup();
});

function renderPicker() {
  const messages = JSON.parse(JSON.stringify(en));
  messages.upload.curGroup = "CUR GROUP";
  messages.upload.aniGroup = "ANI GROUP";
  messages.upload.curStaticImage = "CUR STATIC";
  messages.upload.curStaticImageSub = "Static description";
  messages.upload.aniAnimatedGif = "ANI GIF";
  messages.upload.aniAnimatedGifSub = "GIF description";
  messages.upload.aniMultiplePngs = "ANI PNGS";
  messages.upload.aniMultiplePngsSub = "PNGs description";
  messages.upload.aniAiGenerate = "ANI AI";
  messages.upload.aniAiGenerateSub = "AI description";
  messages.upload.available = "Available!";
  messages.upload.soon = "Soon!";

  const rendered = render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <WorkflowPicker />
    </NextIntlClientProvider>
  );

  return { messages, ...rendered };
}

function getWorkflowCopy(
  messages: typeof en,
  optionId: (typeof WORKFLOW_OPTIONS)[number]["id"]
) {
  const option = WORKFLOW_OPTIONS.find((entry) => entry.id === optionId);

  if (!option) {
    throw new Error(`Unknown workflow option: ${optionId}`);
  }

  return {
    title: messages.upload[option.titleKey as keyof typeof messages.upload] as string,
    description: messages.upload[option.descriptionKey as keyof typeof messages.upload] as string,
    badge:
      option.availability === "available"
        ? messages.upload.available
        : messages.upload.soon,
  };
}

describe("WorkflowPicker", () => {
  it("renders CUR and ANI groups with available and soon workflow cards", () => {
    const { messages } = renderPicker();

    expect(screen.getByRole("heading", { name: "CUR GROUP" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "ANI GROUP" })).not.toBeNull();

    for (const option of WORKFLOW_OPTIONS) {
      const copy = getWorkflowCopy(messages, option.id);
      expect(screen.getByText(copy.title)).not.toBeNull();
      expect(screen.getByText(copy.description)).not.toBeNull();
      expect(screen.getAllByText(copy.badge)).toHaveLength(
        option.availability === "available" ? 1 : 3
      );
    }

    expect(
      screen.getByRole("button", {
        name: /CUR STATIC.*Available!/i,
      }).disabled
    ).toBe(false);
    expect(
      screen.getByRole("button", { name: /ANI GIF.*Soon!/i }).disabled
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: /ANI PNGS.*Soon!/i }).disabled
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: /ANI AI.*Soon!/i }).disabled
    ).toBe(true);
  });

  it("calls the workflow callback for the enabled CUR card only", () => {
    const onSelectWorkflow = vi.fn();
    const messages = JSON.parse(JSON.stringify(en));
    messages.upload.curStaticImage = "CUR STATIC";
    messages.upload.curStaticImageSub = "Static description";
    messages.upload.available = "Available!";

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <WorkflowPicker onSelectWorkflow={onSelectWorkflow} />
      </NextIntlClientProvider>
    );

    screen.getByRole("button", { name: /CUR STATIC/i }).click();

    expect(onSelectWorkflow).toHaveBeenCalledTimes(1);
    expect(onSelectWorkflow).toHaveBeenCalledWith("cur-static-image");
  });
});
