"use client";

import { useEffect, useRef } from "react";

const MAX_RIPPLES = 16;

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Ripple uniforms: each ripple has (x, y, birth_time, _pad)
const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_baseColor;
  uniform vec3 u_midColor;
  uniform vec3 u_highlightColor;
  uniform vec4 u_ripples[${MAX_RIPPLES}];
  uniform int u_rippleCount;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;

    // Perspective depth
    float perspective = 0.5 + uv.y * 0.5;
    p.x /= perspective;

    // Base water waves (ambient, always moving)
    float wave = 0.0;
    wave += sin(p.x * 5.0 + u_time * 0.3) * 0.12;
    wave += sin(p.x * 9.0 - u_time * 0.5 + p.y * 2.5) * 0.06;
    wave += sin(p.y * 7.0 + u_time * 0.25) * 0.08;
    wave += sin((p.x + p.y) * 11.0 + u_time * 0.4) * 0.04;

    // Ripples — each one expands outward and fades
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      if (i >= u_rippleCount) break;

      vec2 ripplePos = (u_ripples[i].xy - u_resolution * 0.5) / u_resolution.y;
      ripplePos.x /= perspective;
      float birthTime = u_ripples[i].z;
      float age = u_time - birthTime;

      if (age < 0.0 || age > 3.0) continue;

      float dist = length(p - ripplePos);

      // Natural expanding ring physics
      float ringRadius = age * 0.35; // Speed of the wavefront
      
      // Spatial envelope: intensity peaks exactly at the ringRadius
      float envelope = exp(-abs(dist - ringRadius) * 18.0);
      
      // Temporal damping: fades naturally over 3 seconds
      float temporalDamping = exp(-age * 1.5);
      
      // High-frequency ripple traveling alongside the wavefront
      float rippleWave = sin((dist - ringRadius) * 80.0) * envelope;
      
      wave += rippleWave * temporalDamping * 0.35;
    }

    // Color from theme
    float brightness = wave * 0.5 + 0.5;
    vec3 waterColor = mix(u_baseColor, u_midColor, brightness);

    // Specular on crests (tighter and slightly sharper for water)
    float specular = pow(max(wave * 1.2, 0.0), 5.0) * 0.7;
    waterColor += u_highlightColor * specular;

    // Depth fade
    float depthFade = mix(0.4, 1.0, uv.y);
    waterColor *= depthFade;

    // Vignette
    float vignette = 1.0 - length((uv - 0.5) * 1.3);
    vignette = smoothstep(0.0, 0.7, vignette);
    waterColor *= vignette;

    gl_FragColor = vec4(waterColor, 1.0);
  }
`;

interface Ripple {
  x: number;
  y: number;
  birthTime: number;
}

interface WaterCanvasProps {
  mouseX: number;
  mouseY: number;
}

export default function WaterCanvas({ mouseX, mouseY }: WaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastRipplePosRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    uTime: WebGLUniformLocation;
    uRipples: WebGLUniformLocation;
    uRippleCount: WebGLUniformLocation;
    canvas: HTMLCanvasElement;
  } | null>(null);

  // Add ripples as mouse moves (every ~30px distance)
  useEffect(() => {
    if (!glRef.current) return;
    const { canvas } = glRef.current;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const mx = mouseX * dpr;
    const my = mouseY * dpr;

    const dx = mx - lastRipplePosRef.current.x;
    const dy = my - lastRipplePosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 30 * dpr) {
      const now = (performance.now() - startTimeRef.current) / 1000;
      ripplesRef.current.push({ x: mx, y: canvas.height - my, birthTime: now });

      // Keep only recent ripples
      if (ripplesRef.current.length > MAX_RIPPLES) {
        ripplesRef.current.shift();
      }

      lastRipplePosRef.current = { x: mx, y: my };
    }
  }, [mouseX, mouseY]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return;

    // Read theme colors
    const cs = getComputedStyle(document.documentElement);
    const bgHex = cs.getPropertyValue("--color-bg-primary").trim() || "#080C18";
    const base = hexToRgb(bgHex);
    // Water mid/highlight — slightly brighter/bluer than bg
    const mid = [
      Math.min(base[0] + 0.04, 1),
      Math.min(base[1] + 0.08, 1),
      Math.min(base[2] + 0.18, 1),
    ];
    const highlight = [
      Math.min(base[0] + 0.1, 1),
      Math.min(base[1] + 0.2, 1),
      Math.min(base[2] + 0.4, 1),
    ];

    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram()!;
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

    const uResolution = gl.getUniformLocation(program, "u_resolution")!;
    const uTime = gl.getUniformLocation(program, "u_time")!;
    const uBaseColor = gl.getUniformLocation(program, "u_baseColor")!;
    const uMidColor = gl.getUniformLocation(program, "u_midColor")!;
    const uHighlightColor = gl.getUniformLocation(program, "u_highlightColor")!;
    const uRipples = gl.getUniformLocation(program, "u_ripples")!;
    const uRippleCount = gl.getUniformLocation(program, "u_rippleCount")!;

    gl.uniform3f(uBaseColor, base[0], base[1], base[2]);
    gl.uniform3f(uMidColor, mid[0], mid[1], mid[2]);
    gl.uniform3f(uHighlightColor, highlight[0], highlight[1], highlight[2]);

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(uResolution, canvas.width, canvas.height);
    }

    startTimeRef.current = performance.now();

    glRef.current = { gl, uTime, uRipples, uRippleCount, canvas };

    function animate() {
      if (!gl || !canvas) return;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      gl.uniform1f(uTime, elapsed);

      // Upload ripple data
      const ripples = ripplesRef.current;
      const count = Math.min(ripples.length, MAX_RIPPLES);
      gl.uniform1i(uRippleCount, count);

      const rippleData = new Float32Array(MAX_RIPPLES * 4);
      for (let i = 0; i < count; i++) {
        rippleData[i * 4] = ripples[i].x;
        rippleData[i * 4 + 1] = ripples[i].y;
        rippleData[i * 4 + 2] = ripples[i].birthTime;
        rippleData[i * 4 + 3] = 0;
      }
      gl.uniform4fv(uRipples, rippleData);

      // Clean old ripples (older than 3 seconds)
      ripplesRef.current = ripples.filter((r) => elapsed - r.birthTime < 3.0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      glRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}
