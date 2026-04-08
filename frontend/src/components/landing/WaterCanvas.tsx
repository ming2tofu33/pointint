"use client";

import { useEffect, useRef } from "react";

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
  uniform vec2 u_mouse;
  uniform vec3 u_accent;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;

    // Perspective distortion — compress toward top for depth
    float perspective = 0.5 + uv.y * 0.5;
    p.x /= perspective;

    // Base water waves — multiple sine layers
    float wave = 0.0;
    wave += sin(p.x * 6.0 + u_time * 0.4) * 0.15;
    wave += sin(p.x * 10.0 - u_time * 0.6 + p.y * 3.0) * 0.08;
    wave += sin(p.y * 8.0 + u_time * 0.3) * 0.1;
    wave += sin((p.x + p.y) * 12.0 + u_time * 0.5) * 0.05;

    // Mouse ripple — distance-based wave from cursor
    vec2 mouseNorm = u_mouse / u_resolution;
    vec2 mouseP = (u_mouse - u_resolution * 0.5) / u_resolution.y;
    float dist = length(p - mouseP);
    float ripple = sin(dist * 30.0 - u_time * 3.0) * 0.12 * smoothstep(0.6, 0.0, dist);
    wave += ripple;

    // Color: dark base + accent highlights on wave peaks
    float brightness = wave * 0.5 + 0.5;
    vec3 darkBase = vec3(0.03, 0.045, 0.09); // matches --color-bg-primary
    vec3 highlight = u_accent * brightness * brightness * 0.35;

    // Subtle specular on wave crests
    float specular = pow(max(wave, 0.0), 3.0) * 0.4;
    vec3 specColor = u_accent * specular;

    // Depth fade — darker at top (far), brighter at bottom (near)
    float depthFade = mix(0.3, 1.0, uv.y);

    vec3 color = darkBase + (highlight + specColor) * depthFade;

    // Vignette
    float vignette = 1.0 - length((uv - 0.5) * 1.2);
    vignette = smoothstep(0.0, 0.7, vignette);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function hexToRgbNormalized(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export default function WaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return; // WebGL not supported — graceful fallback

    // Read accent color
    const computedStyle = getComputedStyle(document.documentElement);
    const accentHex = computedStyle.getPropertyValue("--color-accent").trim() || "#E8496A";
    const accentRgb = hexToRgbNormalized(accentHex);

    // Compile shaders
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

    // Full-screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uAccent = gl.getUniformLocation(program, "u_accent");

    gl.uniform3f(uAccent, accentRgb[0], accentRgb[1], accentRgb[2]);

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(uResolution, canvas.width, canvas.height);
      // Set default mouse to center
      mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    }

    const startTime = performance.now();

    function animate() {
      if (!gl || !canvas) return;
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseRef.current.x, canvas.height - mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      mouseRef.current = {
        x: (e.clientX - rect.left) * dpr,
        y: (e.clientY - rect.top) * dpr,
      };
    }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
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
