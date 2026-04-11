export type WorkflowFamily = "cur" | "ani";

export type WorkflowOptionId =
  | "cur-static-image"
  | "cur-ai-generate"
  | "ani-animated-gif"
  | "ani-multiple-pngs"
  | "ani-ai-generate";

export type WorkflowAvailability = "available" | "soon";

export type StudioState =
  | "workflow-pick"
  | "cur-upload"
  | "uploaded"
  | "processing"
  | "editing";

export interface WorkflowOption {
  id: WorkflowOptionId;
  family: WorkflowFamily;
  titleKey: string;
  descriptionKey: string;
  availability: WorkflowAvailability;
}

export const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    id: "cur-static-image",
    family: "cur",
    titleKey: "curStaticImage",
    descriptionKey: "curStaticImageSub",
    availability: "available",
  },
  {
    id: "cur-ai-generate",
    family: "cur",
    titleKey: "curAiGenerate",
    descriptionKey: "curAiGenerateSub",
    availability: "soon",
  },
  {
    id: "ani-animated-gif",
    family: "ani",
    titleKey: "aniAnimatedGif",
    descriptionKey: "aniAnimatedGifSub",
    availability: "soon",
  },
  {
    id: "ani-multiple-pngs",
    family: "ani",
    titleKey: "aniMultiplePngs",
    descriptionKey: "aniMultiplePngsSub",
    availability: "soon",
  },
  {
    id: "ani-ai-generate",
    family: "ani",
    titleKey: "aniAiGenerate",
    descriptionKey: "aniAiGenerateSub",
    availability: "soon",
  },
];

export const CUR_STATIC_IMAGE_WORKFLOW_ID: WorkflowOptionId = "cur-static-image";

export function isSelectableWorkflow(workflowId: WorkflowOptionId): boolean {
  return workflowId === CUR_STATIC_IMAGE_WORKFLOW_ID;
}
