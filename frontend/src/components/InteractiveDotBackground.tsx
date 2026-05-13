"use client";

import { HTMLAttributes } from "react";

interface InteractiveDotBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  baseColor?: string;
  hoverColor?: string;
  dotSize?: number;
  spacing?: number;
  hoverRadius?: number;
}

export default function InteractiveDotBackground({
  baseColor = "color-mix(in srgb, var(--color-text-primary) 14%, transparent)",
  hoverColor = "var(--color-accent)", // usually pink in this project
  dotSize = 1,
  spacing = 20,
  hoverRadius = 120,
  style,
  ...props
}: InteractiveDotBackgroundProps) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `radial-gradient(${baseColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          zIndex: 0,
          ...style,
        }}
        {...props}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `radial-gradient(${hoverColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          maskImage: `radial-gradient(circle ${hoverRadius}px at var(--mouse-x, -${hoverRadius}px) var(--mouse-y, -${hoverRadius}px), black, transparent)`,
          WebkitMaskImage: `radial-gradient(circle ${hoverRadius}px at var(--mouse-x, -${hoverRadius}px) var(--mouse-y, -${hoverRadius}px), black, transparent)`,
          zIndex: 0,
          ...style,
        }}
        {...props}
      />
    </>
  );
}
