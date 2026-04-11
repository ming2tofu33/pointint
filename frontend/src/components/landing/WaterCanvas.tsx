"use client";

import { useEffect, useRef } from "react";

const MAX_RIPPLES = 64;

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_baseColor;
  uniform vec3 u_midColor;
  uniform vec3 u_highlightColor;
  uniform float u_waveStrength;
  uniform float u_ringSpeed;
  uniform float u_ringSharpness;
  uniform float u_rippleFrequency;
  uniform float u_rippleAmplitude;
  uniform float u_specularStrength;
  uniform float u_depthFloor;
  uniform float u_vignetteStrength;
  uniform vec4 u_ripples[${MAX_RIPPLES}];
  uniform int u_rippleCount;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;

    float perspective = 0.5 + uv.y * 0.5;
    p.x /= perspective;

    float ambientWave = 0.0;
    ambientWave += sin(p.x * 5.0 + u_time * 0.3) * 0.12;
    ambientWave += sin(p.x * 9.0 - u_time * 0.5 + p.y * 2.5) * 0.06;
    ambientWave += sin(p.y * 7.0 + u_time * 0.25) * 0.08;
    ambientWave += sin((p.x + p.y) * 11.0 + u_time * 0.4) * 0.04;
    float wave = ambientWave * u_waveStrength;

    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      if (i >= u_rippleCount) break;

      vec2 ripplePos = (u_ripples[i].xy - u_resolution * 0.5) / u_resolution.y;
      ripplePos.x /= perspective;
      float birthTime = u_ripples[i].z;
      float age = u_time - birthTime;

      if (age < 0.0 || age > 3.0) continue;

      float dist = length(p - ripplePos);
      float ringRadius = age * u_ringSpeed;
      float envelope = exp(-abs(dist - ringRadius) * u_ringSharpness);
      float temporalDamping = exp(-age * 1.5);
      float rippleWave = sin((dist - ringRadius) * u_rippleFrequency) * envelope;

      float intensity = u_ripples[i].w;
      wave += rippleWave * temporalDamping * u_rippleAmplitude * intensity;
    }

    float brightness = wave * 0.5 + 0.5;
    vec3 waterColor = mix(u_baseColor, u_midColor, brightness);

    float specular = pow(max(wave * 1.2, 0.0), 5.0) * u_specularStrength;
    waterColor += u_highlightColor * specular;

    float depthFade = mix(u_depthFloor, 1.0, uv.y);
    waterColor *= depthFade;

    float vignette = 1.0 - length((uv - 0.5) * 1.3);
    vignette = smoothstep(0.0, 0.7, vignette);
    waterColor = mix(waterColor, waterColor * vignette, u_vignetteStrength);

    gl_FragColor = vec4(waterColor, 1.0);
  }
`;

type ThemeName = "dark" | "light" | "custom";

interface Ripple {
  x: number;
  y: number;
  birthTime: number;
  intensity: number;
}

interface WaterCanvasProps {
  mouseX: number;
  mouseY: number;
  variant?: "hero" | "page";
  motionScale?: number;
}

const DEFAULT_ACCENT: [number, number, number] = [232 / 255, 73 / 255, 106 / 255];
const FALLBACK_DARK_BG: [number, number, number] = [8 / 255, 12 / 255, 24 / 255];
const FALLBACK_DARK_MID: [number, number, number] = [16 / 255, 32 / 255, 64 / 255];
const FALLBACK_DARK_HIGHLIGHT: [number, number, number] = [121 / 255, 163 / 255, 1];
const FALLBACK_LIGHT_MID: [number, number, number] = [216 / 255, 235 / 255, 1];
const FALLBACK_LIGHT_HIGHLIGHT: [number, number, number] = [118 / 255, 174 / 255, 1];

const VARIANT_SETTINGS = {
  hero: {
    defaultMotionScale: 0.4,
    minDist: 11,
    opacity: 0.52,
    waveStrength: 0.92,
    ringSpeed: 0.32,
    ringSharpness: 18,
    rippleFrequency: 80,
    rippleAmplitude: 0.3,
    specularStrength: 0.58,
  },
  page: {
    defaultMotionScale: 0.42,
    minDist: 15,
    opacity: 0.82,
    waveStrength: 0.88,
    ringSpeed: 0.4,
    ringSharpness: 10,
    rippleFrequency: 42,
    rippleAmplitude: 0.34,
    specularStrength: 0.42,
  },
} as const;

export default function WaterCanvas({
  mouseX,
  mouseY,
  variant = "hero",
  motionScale,
}: WaterCanvasProps) {
  const settings = VARIANT_SETTINGS[variant];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastRipplePosRef = useRef({ x: 0, y: 0, time: 0 });
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
  } | null>(null);

  useEffect(() => {
    if (!glRef.current) return;

    const { canvas } = glRef.current;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const mx = mouseX * dpr;
    const my = mouseY * dpr;
    const rippleScale = motionScale ?? settings.defaultMotionScale;
    const now = (performance.now() - startTimeRef.current) / 1000;

    if (lastRipplePosRef.current.time === 0) {
      lastRipplePosRef.current = { x: mx, y: my, time: now };
      return;
    }

    const dx = mx - lastRipplePosRef.current.x;
    const dy = my - lastRipplePosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = settings.minDist * dpr;

    if (dist > minDist) {
      const dt = Math.max(0.001, now - lastRipplePosRef.current.time);
      const speed = dist / dt;
      const intensity =
        Math.min(Math.max(speed * 0.0015, 0.15), 1.5) * rippleScale;
      const steps = Math.floor(dist / minDist);

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const interpX = lastRipplePosRef.current.x + dx * t;
        const interpY = lastRipplePosRef.current.y + dy * t;

        ripplesRef.current.push({
          x: interpX,
          y: canvas.height - interpY,
          birthTime: now,
          intensity,
        });
      }

      while (ripplesRef.current.length > MAX_RIPPLES) {
        ripplesRef.current.shift();
      }

      lastRipplePosRef.current = { x: mx, y: my, time: now };
    }
  }, [mouseX, mouseY, motionScale, settings]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const targetCanvas = canvas;

    const glContext = targetCanvas.getContext("webgl", { alpha: false });
    if (!glContext) return;
    const gl = glContext;

    function createShader(type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uBaseColor = gl.getUniformLocation(program, "u_baseColor");
    const uMidColor = gl.getUniformLocation(program, "u_midColor");
    const uHighlightColor = gl.getUniformLocation(program, "u_highlightColor");
    const uWaveStrength = gl.getUniformLocation(program, "u_waveStrength");
    const uRingSpeed = gl.getUniformLocation(program, "u_ringSpeed");
    const uRingSharpness = gl.getUniformLocation(program, "u_ringSharpness");
    const uRippleFrequency = gl.getUniformLocation(program, "u_rippleFrequency");
    const uRippleAmplitude = gl.getUniformLocation(program, "u_rippleAmplitude");
    const uSpecularStrength = gl.getUniformLocation(program, "u_specularStrength");
    const uDepthFloor = gl.getUniformLocation(program, "u_depthFloor");
    const uVignetteStrength = gl.getUniformLocation(program, "u_vignetteStrength");
    const uRipples = gl.getUniformLocation(program, "u_ripples");
    const uRippleCount = gl.getUniformLocation(program, "u_rippleCount");

    if (
      !uResolution ||
      !uTime ||
      !uBaseColor ||
      !uMidColor ||
      !uHighlightColor ||
      !uWaveStrength ||
      !uRingSpeed ||
      !uRingSharpness ||
      !uRippleFrequency ||
      !uRippleAmplitude ||
      !uSpecularStrength ||
      !uDepthFloor ||
      !uVignetteStrength ||
      !uRipples ||
      !uRippleCount
    ) {
      return;
    }

    gl.uniform1f(uWaveStrength, settings.waveStrength);
    gl.uniform1f(uRingSpeed, settings.ringSpeed);
    gl.uniform1f(uRingSharpness, settings.ringSharpness);
    gl.uniform1f(uRippleFrequency, settings.rippleFrequency);
    gl.uniform1f(uRippleAmplitude, settings.rippleAmplitude);
    gl.uniform1f(uSpecularStrength, settings.specularStrength);

    function applyThemeUniforms() {
      const styles = getComputedStyle(document.documentElement);
      const theme =
        (document.documentElement.getAttribute("data-theme") as ThemeName | null) ??
        "dark";
      const base =
        parseCssColor(styles.getPropertyValue("--landing-bg-start").trim()) ??
        parseCssColor(styles.getPropertyValue("--color-bg-primary").trim()) ??
        FALLBACK_DARK_BG;
      const accent =
        parseCssColor(styles.getPropertyValue("--color-accent").trim()) ??
        DEFAULT_ACCENT;
      const palette = resolveWaterPalette({
        base,
        accent,
        theme,
        variant,
        styles,
      });
      const shading = resolveWaterShading(base);

      gl.uniform3f(uBaseColor, base[0], base[1], base[2]);
      gl.uniform3f(uMidColor, palette.mid[0], palette.mid[1], palette.mid[2]);
      gl.uniform3f(
        uHighlightColor,
        palette.highlight[0],
        palette.highlight[1],
        palette.highlight[2]
      );
      gl.uniform1f(uDepthFloor, shading.depthFloor);
      gl.uniform1f(uVignetteStrength, shading.vignetteStrength);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      targetCanvas.width = targetCanvas.offsetWidth * dpr;
      targetCanvas.height = targetCanvas.offsetHeight * dpr;
      gl.viewport(0, 0, targetCanvas.width, targetCanvas.height);
      gl.uniform2f(uResolution, targetCanvas.width, targetCanvas.height);
    }

    startTimeRef.current = performance.now();
    glRef.current = { gl, canvas: targetCanvas };

    applyThemeUniforms();

    const themeObserver = new MutationObserver(() => {
      applyThemeUniforms();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    function animate() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      gl.uniform1f(uTime, elapsed);

      const ripples = ripplesRef.current;
      const count = Math.min(ripples.length, MAX_RIPPLES);
      gl.uniform1i(uRippleCount, count);

      const rippleData = new Float32Array(MAX_RIPPLES * 4);
      for (let i = 0; i < count; i++) {
        rippleData[i * 4] = ripples[i].x;
        rippleData[i * 4 + 1] = ripples[i].y;
        rippleData[i * 4 + 2] = ripples[i].birthTime;
        rippleData[i * 4 + 3] = ripples[i].intensity;
      }
      gl.uniform4fv(uRipples, rippleData);

      ripplesRef.current = ripples.filter((ripple) => elapsed - ripple.birthTime < 3);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      glRef.current = null;
    };
  }, [settings, variant]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: variant === "page" ? "fixed" : "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: `calc(${settings.opacity} * var(--landing-water-opacity-scale, 1))`,
      }}
    />
  );
}

function resolveWaterPalette({
  base,
  accent,
  theme,
  variant,
  styles,
}: {
  base: [number, number, number];
  accent: [number, number, number];
  theme: ThemeName;
  variant: "hero" | "page";
  styles: CSSStyleDeclaration;
}) {
  const tokenMid = parseCssColor(styles.getPropertyValue("--landing-water-mid").trim());
  const tokenHighlight = parseCssColor(
    styles.getPropertyValue("--landing-water-highlight").trim()
  );

  if (tokenMid && tokenHighlight) {
    return {
      mid: tokenMid,
      highlight: tokenHighlight,
    };
  }

  const isLightSurface = getLuminance(base) > 0.72;

  if (isLightSurface) {
    return {
      mid: mixColors(base, FALLBACK_LIGHT_MID, variant === "page" ? 0.82 : 0.7),
      highlight: mixColors(
        base,
        FALLBACK_LIGHT_HIGHLIGHT,
        variant === "page" ? 0.54 : 0.4
      ),
    };
  }

  return {
    mid: mixColors(base, FALLBACK_DARK_MID, variant === "page" ? 0.66 : 0.52),
    highlight: mixColors(accent, FALLBACK_DARK_HIGHLIGHT, 0.62),
  };
}

function resolveWaterShading(base: [number, number, number]) {
  const isLightSurface = getLuminance(base) > 0.72;

  if (isLightSurface) {
    return {
      depthFloor: 0.9,
      vignetteStrength: 0.14,
    };
  }

  return {
    depthFloor: 0.4,
    vignetteStrength: 1,
  };
}

function parseCssColor(value: string): [number, number, number] | null {
  if (!value) return null;

  if (value.startsWith("#")) {
    return hexToRgb(value);
  }

  const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);
  if (!rgbMatch) return null;

  const parts = rgbMatch[1]
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
    .slice(0, 3);

  if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = hex.replace("#", "").trim();

  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0] + normalized[0], 16) / 255;
    const g = Number.parseInt(normalized[1] + normalized[1], 16) / 255;
    const b = Number.parseInt(normalized[2] + normalized[2], 16) / 255;
    return [r, g, b];
  }

  if (normalized.length !== 6) return null;

  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function mixColors(
  from: [number, number, number],
  to: [number, number, number],
  amount: number
): [number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

function getLuminance([r, g, b]: [number, number, number]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
