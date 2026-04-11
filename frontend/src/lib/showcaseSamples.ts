export type ShowcaseSampleSpec = {
  id: string;
  previewSrc: string;
  bundleHref: string;
  bundleFileName: string;
  accent: string;
};

export const showcaseSamples: ShowcaseSampleSpec[] = [
  {
    id: "auroraGlass",
    previewSrc: "/showcase/aurora-glass-preview.svg",
    bundleHref: "/showcase/aurora-glass-bundle.zip",
    bundleFileName: "aurora-glass-bundle.zip",
    accent: "rgba(111, 188, 255, 0.8)",
  },
  {
    id: "studioSignal",
    previewSrc: "/showcase/studio-signal-preview.svg",
    bundleHref: "/showcase/studio-signal-bundle.zip",
    bundleFileName: "studio-signal-bundle.zip",
    accent: "rgba(232, 73, 106, 0.78)",
  },
  {
    id: "nightOrbit",
    previewSrc: "/showcase/night-orbit-preview.svg",
    bundleHref: "/showcase/night-orbit-bundle.zip",
    bundleFileName: "night-orbit-bundle.zip",
    accent: "rgba(129, 105, 255, 0.72)",
  },
];
