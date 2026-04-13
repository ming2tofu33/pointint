"use client";

import type { HTMLAttributes, ReactNode } from "react";

type StudioSurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const STUDIO_INTERACTION_TRANSITION =
  "border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease, color 180ms ease";

export function StudioShellInteractionStyles() {
  return (
    <style>{`
      [data-studio-shell] button:focus-visible,
      [data-studio-shell] input:focus-visible,
      [data-studio-shell] select:focus-visible,
      [data-studio-shell] textarea:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
        box-shadow: 0 0 0 1px var(--color-accent);
      }

      @media (prefers-reduced-motion: reduce) {
        [data-studio-shell] button,
        [data-studio-shell] input,
        [data-studio-shell] select,
        [data-studio-shell] textarea {
          transition: none !important;
          animation: none !important;
        }
      }
    `}</style>
  );
}

export default function StudioSurfaceCard({
  children,
  style,
  ...props
}: StudioSurfaceCardProps) {
  return (
    <div
      {...props}
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "1rem",
        backgroundColor: "rgba(255,255,255,0.025)",
        padding: "1rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
