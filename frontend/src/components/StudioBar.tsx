"use client";

import SideMenu from "./SideMenu";

export default function StudioBar() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.625rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
        height: "3rem",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <SideMenu />
        <span
          style={{
            width: "1px",
            height: "1rem",
            backgroundColor: "var(--color-border)",
          }}
        />
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          Studio
        </span>
      </div>

      <button
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          padding: "0.375rem 1rem",
          backgroundColor: "var(--color-accent)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            "var(--color-accent-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-accent)")
        }
      >
        Download
      </button>
    </header>
  );
}
