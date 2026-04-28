export type ContentCta = {
  label: string;
  href: string;
};

export type ContentLink = {
  label: string;
  href: string;
};

export type ContentSection = {
  title: string;
  body?: string;
  items: string[];
};

export type ContentFaq = {
  question: string;
  answer: string;
};

export type ToolPageSlug = "image-to-cursor" | "gif-to-ani-cursor";

export type GuidePageSlug =
  | "how-to-change-cursor-windows"
  | "what-is-cursor-hotspot"
  | "cur-vs-ani"
  | "fix-blurry-custom-cursor";

export type ToolPageContent = {
  slug: ToolPageSlug;
  path: `/tools/${ToolPageSlug}`;
  title: string;
  description: string;
  eyebrow: string;
  cta: ContentCta;
  secondaryCta: ContentCta;
  proofPoints: string[];
  sections: ContentSection[];
  faq: ContentFaq[];
  related: ContentLink[];
};

export type GuidePageContent = {
  slug: GuidePageSlug;
  path: `/guides/${GuidePageSlug}`;
  title: string;
  description: string;
  eyebrow: string;
  cta: ContentCta;
  sections: ContentSection[];
  faq: ContentFaq[];
  related: ContentLink[];
};

export const siteUrl = "https://pointtint.com";

export const toolPages: ToolPageContent[] = [
  {
    slug: "image-to-cursor",
    path: "/tools/image-to-cursor",
    eyebrow: "Free Windows cursor maker",
    title: "Image to Cursor Converter",
    description:
      "Turn a PNG, JPG, or WebP image into a Windows-ready .cur file with background cleanup, hotspot editing, live preview, and download guidance.",
    cta: {
      label: "Make an image cursor",
      href: "/studio?workflow=cur-static-image",
    },
    secondaryCta: {
      label: "Learn about hotspots",
      href: "/guides/what-is-cursor-hotspot",
    },
    proofPoints: [
      "PNG, JPG, and WebP input",
      "32, 48, and 64px cursor output checks",
      "Visual hotspot adjustment",
      "Windows apply guide after download",
    ],
    sections: [
      {
        title: "What this tool does",
        body: "Pointint is built for the whole cursor-making flow, not just a file extension swap.",
        items: [
          "Uploads a source image and frames it for a square cursor canvas.",
          "Lets you decide whether to remove the background before editing.",
          "Keeps preview, hotspot, and export size in the same Studio workflow.",
        ],
      },
      {
        title: "Best source images",
        items: [
          "Use a clear subject with a recognizable silhouette.",
          "Avoid tiny details that disappear at cursor size.",
          "Prefer transparent PNGs when you already have clean cutouts.",
        ],
      },
      {
        title: "After download",
        items: [
          "Use the included guide to apply the cursor in Windows Mouse settings.",
          "Save a Windows pointer scheme if you want to reuse the set later.",
          "Return to Studio when you want to fill additional cursor roles.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I convert a PNG to a Windows cursor?",
        answer:
          "Yes. Upload a PNG, JPG, JPEG, or WebP image and Pointint prepares a Windows .cur output from the Studio.",
      },
      {
        question: "Do I need to set the cursor hotspot?",
        answer:
          "Yes. The hotspot is the exact pixel where clicks register. Pointint gives you a visual hotspot control so the cursor feels accurate.",
      },
      {
        question: "Does Pointint remove the image background?",
        answer:
          "You can choose background removal after upload. If your image already has a transparent background, you can keep it as-is.",
      },
      {
        question: "Can I make a full cursor set?",
        answer:
          "The Studio supports Windows role slots so you can build beyond one cursor and download a role-based package.",
      },
    ],
    related: [
      {
        label: "Hotspot guide",
        href: "/guides/what-is-cursor-hotspot",
      },
      {
        label: "Windows cursor install guide",
        href: "/guides/how-to-change-cursor-windows",
      },
      {
        label: "Fix blurry custom cursors",
        href: "/guides/fix-blurry-custom-cursor",
      },
    ],
  },
  {
    slug: "gif-to-ani-cursor",
    path: "/tools/gif-to-ani-cursor",
    eyebrow: "Animated Windows cursor maker",
    title: "GIF to ANI Cursor Converter",
    description:
      "Convert an animated GIF into a Windows .ani cursor, then adjust shared framing, hotspot, size, and output timing in Pointint Studio.",
    cta: {
      label: "Make an animated cursor",
      href: "/studio?workflow=ani-animated-gif",
    },
    secondaryCta: {
      label: "Compare CUR and ANI",
      href: "/guides/cur-vs-ani",
    },
    proofPoints: [
      "GIF input for animated cursor source",
      "Shared framing and hotspot controls",
      "Windows .ani export",
      "GIF preview export while tuning motion",
    ],
    sections: [
      {
        title: "What this tool does",
        body: "ANI cursors need animation frames plus cursor-specific metadata. Pointint keeps those decisions in the same cursor Studio.",
        items: [
          "Reads a GIF as an animation source.",
          "Previews the animation in the cursor editor before export.",
          "Exports a Windows .ani cursor for animated pointer roles.",
        ],
      },
      {
        title: "Before you upload",
        items: [
          "Keep the motion short and readable at small sizes.",
          "Use transparent or high-contrast frames when possible.",
          "Avoid long GIFs that feel distracting as a pointer.",
        ],
      },
      {
        title: "When to use ANI",
        items: [
          "Use ANI for busy, working, or expressive cursor roles.",
          "Use CUR for normal pointing, text selection, and precise clicking.",
          "Preview motion against light and dark backgrounds before downloading.",
        ],
      },
    ],
    faq: [
      {
        question: "Can Windows use animated cursors?",
        answer:
          "Yes. Windows animated cursors use the .ani format. Pointint exports GIF-based animation work as .ani for Windows cursor roles.",
      },
      {
        question: "Can I edit individual GIF frames?",
        answer:
          "This wave keeps the GIF path focused on shared cursor framing, hotspot, and export. Frame-by-frame source editing is tracked separately.",
      },
      {
        question: "Can I export a preview GIF too?",
        answer:
          "Yes. The current Studio can save a GIF preview while the Windows cursor export remains .ani.",
      },
      {
        question: "Should every cursor role be animated?",
        answer:
          "Usually no. Keep animation for roles where motion helps, and use static .cur files for precise everyday pointing.",
      },
    ],
    related: [
      {
        label: "CUR vs ANI guide",
        href: "/guides/cur-vs-ani",
      },
      {
        label: "Windows cursor install guide",
        href: "/guides/how-to-change-cursor-windows",
      },
      {
        label: "Hotspot guide",
        href: "/guides/what-is-cursor-hotspot",
      },
    ],
  },
];

export const guidePages: GuidePageContent[] = [
  {
    slug: "how-to-change-cursor-windows",
    path: "/guides/how-to-change-cursor-windows",
    eyebrow: "Windows cursor guide",
    title: "How to Change Your Cursor on Windows",
    description:
      "A practical guide to applying custom .cur and .ani cursor files in Windows and saving them as a reusable pointer scheme.",
    cta: {
      label: "Make a Windows cursor",
      href: "/studio?workflow=cur-static-image",
    },
    sections: [
      {
        title: "Apply a cursor file",
        items: [
          "Open Windows Settings and go to Mouse settings.",
          "Open Additional mouse settings, then choose the Pointers tab.",
          "Select the cursor role you want to change and choose Browse.",
          "Pick your downloaded .cur or .ani file and apply the change.",
        ],
      },
      {
        title: "Save the scheme",
        items: [
          "After replacing one or more roles, use Save As to keep the scheme.",
          "Give the scheme a recognizable name so you can switch back later.",
          "Keep your downloaded cursor files in a stable folder so Windows can find them.",
        ],
      },
      {
        title: "Pointint package path",
        items: [
          "For full sets, extract the ZIP first.",
          "Use install.inf when a package includes a Windows scheme installer.",
          "Use restore-default.inf or Windows Default when you want to roll back.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I use both .cur and .ani files?",
        answer:
          "Yes. Windows supports static .cur files and animated .ani files in pointer schemes.",
      },
      {
        question: "Why did my cursor reset?",
        answer:
          "Windows needs the cursor file to remain available. Move the final files to a stable folder before saving a scheme.",
      },
      {
        question: "Do I need an installer?",
        answer:
          "No. You can browse to individual cursor files manually, while Pointint packages can also include install guidance for full sets.",
      },
    ],
    related: [
      {
        label: "Image to Cursor Converter",
        href: "/tools/image-to-cursor",
      },
      {
        label: "GIF to ANI Cursor Converter",
        href: "/tools/gif-to-ani-cursor",
      },
      {
        label: "CUR vs ANI guide",
        href: "/guides/cur-vs-ani",
      },
    ],
  },
  {
    slug: "what-is-cursor-hotspot",
    path: "/guides/what-is-cursor-hotspot",
    eyebrow: "Cursor basics",
    title: "What Is a Cursor Hotspot?",
    description:
      "The cursor hotspot is the exact pixel where clicking happens. Getting it right is what makes a custom cursor feel precise.",
    cta: {
      label: "Set a hotspot in Studio",
      href: "/studio?workflow=cur-static-image",
    },
    sections: [
      {
        title: "The short version",
        items: [
          "The hotspot is one pixel inside the cursor image.",
          "Windows uses that pixel as the click point.",
          "For pointer arrows, the hotspot usually belongs at the visual tip.",
        ],
      },
      {
        title: "Why it matters",
        items: [
          "A beautiful cursor can still feel broken if the click point is offset.",
          "Text and resize cursors need especially careful alignment.",
          "Animated cursors should keep the hotspot stable across motion.",
        ],
      },
      {
        title: "How Pointint handles it",
        items: [
          "Studio shows visual hotspot controls while you preview the cursor.",
          "You can use a recommended hotspot and then override it manually.",
          "Output previews keep size, framing, and hotspot decisions together.",
        ],
      },
    ],
    faq: [
      {
        question: "Is the hotspot always the top-left pixel?",
        answer:
          "No. Some cursors use the top-left corner, but arrows, text cursors, and resize cursors often need different positions.",
      },
      {
        question: "Can animated cursors have hotspots?",
        answer:
          "Yes. .ani cursors also need a hotspot so the click point stays predictable.",
      },
      {
        question: "What happens if the hotspot is wrong?",
        answer:
          "Clicks can feel offset from the visible cursor, which makes selection and button clicks feel inaccurate.",
      },
    ],
    related: [
      {
        label: "Image to Cursor Converter",
        href: "/tools/image-to-cursor",
      },
      {
        label: "Fix blurry custom cursors",
        href: "/guides/fix-blurry-custom-cursor",
      },
      {
        label: "CUR vs ANI guide",
        href: "/guides/cur-vs-ani",
      },
    ],
  },
  {
    slug: "cur-vs-ani",
    path: "/guides/cur-vs-ani",
    eyebrow: "Cursor formats",
    title: "CUR vs ANI: Which Cursor File Do You Need?",
    description:
      "Use .cur for static Windows cursors and .ani when the cursor role needs motion. Most cursor sets use both formats carefully.",
    cta: {
      label: "Open the cursor Studio",
      href: "/studio",
    },
    sections: [
      {
        title: "Use CUR for precision",
        items: [
          ".cur is the standard static Windows cursor format.",
          "It is best for normal select, text select, links, and resize roles.",
          "Static cursors are easier to read and less distracting.",
        ],
      },
      {
        title: "Use ANI for motion",
        items: [
          ".ani stores animated cursor frames for Windows.",
          "It works well for busy or working-in-background roles.",
          "Motion should be short, legible, and purposeful.",
        ],
      },
      {
        title: "Pointint workflow",
        items: [
          "Start with image-to-CUR when you need a precise static cursor.",
          "Start with GIF-to-ANI when the source already has useful motion.",
          "Preview both formats in the Studio before downloading.",
        ],
      },
    ],
    faq: [
      {
        question: "Can a cursor set mix CUR and ANI?",
        answer:
          "Yes. A practical Windows pointer scheme often mixes static .cur roles and animated .ani roles.",
      },
      {
        question: "Is ANI better than CUR?",
        answer:
          "No. ANI is only better when motion helps. CUR is usually better for precise everyday pointing.",
      },
      {
        question: "Can I make ANI from a GIF?",
        answer:
          "Yes. Pointint's GIF workflow turns a GIF source into an animated Windows cursor path.",
      },
    ],
    related: [
      {
        label: "Image to Cursor Converter",
        href: "/tools/image-to-cursor",
      },
      {
        label: "GIF to ANI Cursor Converter",
        href: "/tools/gif-to-ani-cursor",
      },
      {
        label: "Windows cursor install guide",
        href: "/guides/how-to-change-cursor-windows",
      },
    ],
  },
  {
    slug: "fix-blurry-custom-cursor",
    path: "/guides/fix-blurry-custom-cursor",
    eyebrow: "Cursor quality",
    title: "How to Fix a Blurry Custom Cursor",
    description:
      "Blurry custom cursors usually come from tiny source art, weak contrast, oversized detail, or scaling that does not match cursor output sizes.",
    cta: {
      label: "Make a sharper cursor",
      href: "/studio?workflow=cur-static-image",
    },
    sections: [
      {
        title: "Start with a readable source",
        items: [
          "Use a clean silhouette that still reads at 32px.",
          "Remove background clutter before exporting.",
          "Increase contrast between the cursor and common desktop backgrounds.",
        ],
      },
      {
        title: "Check output sizes",
        items: [
          "Preview the cursor at 32, 48, and 64px.",
          "Avoid thin lines that disappear at smaller sizes.",
          "Use simple shapes for the active click area.",
        ],
      },
      {
        title: "Use Studio corrections",
        items: [
          "Crop and center the source before downloading.",
          "Adjust scale so the subject fills the cursor area without clipping.",
          "Set the hotspot after the final size and framing decisions.",
        ],
      },
    ],
    faq: [
      {
        question: "Why does my cursor look worse after export?",
        answer:
          "Cursor output is much smaller than most source images. Fine details can blur or disappear when the image is reduced.",
      },
      {
        question: "Should I use a larger source image?",
        answer:
          "Use a clean source, not just a large one. A high-resolution image with too much detail can still make a blurry cursor.",
      },
      {
        question: "Does transparent background help?",
        answer:
          "Often yes. Removing background noise makes the cursor shape easier to read at small sizes.",
      },
    ],
    related: [
      {
        label: "Image to Cursor Converter",
        href: "/tools/image-to-cursor",
      },
      {
        label: "Hotspot guide",
        href: "/guides/what-is-cursor-hotspot",
      },
      {
        label: "Windows cursor install guide",
        href: "/guides/how-to-change-cursor-windows",
      },
    ],
  },
];

export function getToolPage(slug: ToolPageSlug) {
  return toolPages.find((page) => page.slug === slug);
}

export function getGuidePage(slug: GuidePageSlug) {
  return guidePages.find((page) => page.slug === slug);
}

export function absoluteUrl(path: string) {
  return `${siteUrl}${path === "/" ? "" : path}`;
}
