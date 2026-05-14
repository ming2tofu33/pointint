import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import WorkflowPicker from "@/components/WorkflowPicker";
import en from "@/i18n/messages/en.json";
import { WORKFLOW_OPTIONS } from "@/lib/studioWorkflow";

afterEach(() => {
  cleanup();
  trackEventMock.mockReset();
});

function renderPicker() {
  const messages = JSON.parse(JSON.stringify(en));
  messages.upload.curGroup = "CUR GROUP";
  messages.upload.aniGroup = "ANI GROUP";
  messages.upload.curStaticImage = "CUR STATIC";
  messages.upload.curStaticImageSub = "Static description";
  messages.upload.curAiGenerate = "CUR AI";
  messages.upload.curAiGenerateSub = "CUR AI description";
  messages.upload.aniAnimatedGif = "ANI GIF";
  messages.upload.aniAnimatedGifSub = "GIF description";
  messages.upload.aniMultiplePngs = "ANI PNGS";
  messages.upload.aniMultiplePngsSub = "PNGs description";
  messages.upload.aniAiGenerate = "ANI AI";
  messages.upload.aniAiGenerateSub = "AI description";
  messages.upload.available = "Available!";
  messages.upload.soon = "Soon!";

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <WorkflowPicker />
    </NextIntlClientProvider>
  );

  return messages;
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
    description: messages.upload[
      option.descriptionKey as keyof typeof messages.upload
    ] as string,
    badge:
      option.availability === "available"
        ? messages.upload.available
        : messages.upload.soon,
  };
}

function getBadgeCount(availability: (typeof WORKFLOW_OPTIONS)[number]["availability"]) {
  return WORKFLOW_OPTIONS.filter((option) => option.availability === availability)
    .length;
}

describe("WorkflowPicker", () => {
  it("uses the same dotted guide surface as the studio upload entry", () => {
    renderPicker();

    const picker = screen.getByTestId("workflow-picker");

    expect(picker).toBeVisible();
    expect(picker).toHaveClass("workflow-picker-shell");
    expect(screen.getByTestId("workflow-picker-panel")).toHaveClass(
      "workflow-picker-panel"
    );
    expect(screen.getByTestId("workflow-picker-dots-base")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-picker-dots-hover")).toBeInTheDocument();

    fireEvent.mouseMove(picker, { clientX: 88, clientY: 132 });

    expect(picker.style.getPropertyValue("--mouse-x")).toBe("88px");
    expect(picker.style.getPropertyValue("--mouse-y")).toBe("132px");
  });

  it("renders CUR and ANI groups with available and soon workflow cards", () => {
    const messages = renderPicker();

    expect(screen.getByRole("heading", { name: "CUR GROUP" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "ANI GROUP" })).not.toBeNull();

    for (const option of WORKFLOW_OPTIONS) {
      const copy = getWorkflowCopy(messages, option.id);
      expect(screen.getByText(copy.title)).not.toBeNull();
      expect(screen.getByText(copy.description)).not.toBeNull();
      expect(screen.getAllByText(copy.badge)).toHaveLength(
        getBadgeCount(option.availability)
      );
    }

    expect(
      screen.getByRole("button", {
        name: /CUR STATIC.*Available!/i,
      }).disabled
    ).toBe(false);
    expect(screen.getByTestId("workflow-card-cur-static-image")).toHaveClass(
      "workflow-picker-card--available"
    );
    expect(screen.getByRole("button", { name: /CUR AI.*Soon!/i }).disabled).toBe(
      true
    );
    expect(screen.getByTestId("workflow-card-cur-ai-generate")).toHaveClass(
      "workflow-picker-card--soon"
    );
    expect(
      screen.getByRole("button", { name: /ANI GIF.*Available!/i }).disabled
    ).toBe(false);
    expect(
      screen.getByRole("button", { name: /ANI PNGS.*Available!/i }).disabled
    ).toBe(false);
    expect(screen.getByTestId("workflow-card-ani-video-to-ani")).toHaveClass(
      "workflow-picker-card--available"
    );
    expect(
      screen.getByRole("button", { name: /Video to ANI.*Available!/i })
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: /ANI AI.*Soon!/i }).disabled).toBe(
      true
    );
  });

  it("calls the workflow callback for the enabled CUR card only", () => {
    const onSelectWorkflow = vi.fn();
    const messages = JSON.parse(JSON.stringify(en));
    messages.upload.curStaticImage = "CUR STATIC";
    messages.upload.curStaticImageSub = "Static description";
    messages.upload.curAiGenerate = "CUR AI";
    messages.upload.curAiGenerateSub = "CUR AI description";
    messages.upload.available = "Available!";

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <WorkflowPicker onSelectWorkflow={onSelectWorkflow} />
      </NextIntlClientProvider>
    );

    screen.getByRole("button", { name: /CUR STATIC/i }).click();

    expect(onSelectWorkflow).toHaveBeenCalledTimes(1);
    expect(onSelectWorkflow).toHaveBeenCalledWith("cur-static-image");
    expect(trackEventMock).toHaveBeenCalledWith("workflow_selected", {
      availability: "available",
      family: "cur",
      workflow_id: "cur-static-image",
    });
    expect(screen.getByRole("button", { name: /CUR AI/i }).disabled).toBe(true);
  });

  it("calls the workflow callback for the enabled ANI GIF card", () => {
    const onSelectWorkflow = vi.fn();
    const messages = JSON.parse(JSON.stringify(en));
    messages.upload.aniAnimatedGif = "ANI GIF";
    messages.upload.aniAnimatedGifSub = "GIF description";
    messages.upload.available = "Available!";

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <WorkflowPicker onSelectWorkflow={onSelectWorkflow} />
      </NextIntlClientProvider>
    );

    screen.getByRole("button", { name: /ANI GIF/i }).click();

    expect(onSelectWorkflow).toHaveBeenCalledTimes(1);
    expect(onSelectWorkflow).toHaveBeenCalledWith("ani-animated-gif");
  });

  it("calls the workflow callback for the enabled Video to ANI card", () => {
    const onSelectWorkflow = vi.fn();
    const messages = JSON.parse(JSON.stringify(en));

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <WorkflowPicker onSelectWorkflow={onSelectWorkflow} />
      </NextIntlClientProvider>
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Video to ANI.*Available/i })
    );

    expect(onSelectWorkflow).toHaveBeenCalledWith("ani-video-to-ani");
  });
});
