"use client";

import StudioBar from "@/components/StudioBar";
import ThemeToggle from "@/components/ThemeToggle";

export default function StudioPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <StudioBar />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Toolbar */}
        <aside
          style={{
            width: "3.5rem",
            borderRight: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "1rem",
            gap: "0.5rem",
            flexShrink: 0,
          }}
        >
          <ToolButton label="Move" active />
          <ToolButton label="Size" />
          <ToolButton label="Hot" />
          <ToolButton label="Rot" />
        </aside>

        {/* Canvas Area */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-bg-primary)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "256px",
              height: "256px",
              border: "1px dashed var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            Upload image
          </div>
        </main>

        {/* Right Panel */}
        <aside
          style={{
            width: "16rem",
            borderLeft: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
            padding: "1.25rem",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <PanelSection title="Cursor">
            <PanelRow label="Size" value="32 × 32" />
            <PanelRow label="Hotspot" value="0, 0" />
          </PanelSection>

          <PanelSection title="Preview">
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <PreviewChip label="Normal" active />
              <PreviewChip label="Text" />
              <PreviewChip label="Link" />
            </div>
          </PanelSection>
        </aside>
      </div>

      {/* Bottom Bar — Simulation */}
      <footer
        style={{
          height: "8rem",
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.8125rem",
          flexShrink: 0,
        }}
      >
        Simulation preview
      </footer>

      <ThemeToggle />
    </div>
  );
}

function ToolButton({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      title={label}
      style={{
        width: "2.25rem",
        height: "2.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.625rem",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        backgroundColor: active
          ? "var(--color-accent-subtle)"
          : "transparent",
        color: active
          ? "var(--color-accent)"
          : "var(--color-text-muted)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.8125rem",
        marginBottom: "0.375rem",
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}

function PreviewChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        fontSize: "0.6875rem",
        padding: "0.25rem 0.625rem",
        backgroundColor: active
          ? "var(--color-accent-subtle)"
          : "transparent",
        color: active
          ? "var(--color-accent)"
          : "var(--color-text-muted)",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        cursor: "pointer",
      }}
    >
      {label}
    </span>
  );
}
