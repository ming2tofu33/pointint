"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-primary)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          textDecoration: "none",
          letterSpacing: "-0.02em",
        }}
      >
        Pointint
      </Link>

      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link
          href="/studio"
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-secondary)")
          }
        >
          Studio
        </Link>
      </nav>
    </header>
  );
}
