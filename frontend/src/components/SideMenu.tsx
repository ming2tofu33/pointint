"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t("openMenu")}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "4px",
          width: "2rem",
          height: "2rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
        }}
      >
        <span
          style={{
            width: "1rem",
            height: "1.5px",
            backgroundColor: "var(--color-text-secondary)",
            transition: "background-color 0.2s",
          }}
        />
        <span
          style={{
            width: "1rem",
            height: "1.5px",
            backgroundColor: "var(--color-text-secondary)",
          }}
        />
        <span
          style={{
            width: "0.625rem",
            height: "1.5px",
            backgroundColor: "var(--color-text-secondary)",
          }}
        />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 90,
            transition: "opacity 0.2s",
          }}
        />
      )}

      {/* Side Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "15rem",
          backgroundColor: "var(--color-bg-secondary)",
          borderRight: "1px solid var(--color-border)",
          zIndex: 100,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: open ? "transform 0.25s ease-out" : "transform 0.2s ease-in",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Menu Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            borderBottom: "1px solid var(--color-border)",
            height: "3rem",
          }}
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            poin+tint
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "1.125rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Menu Items */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1rem 0",
            flex: 1,
          }}
        >
          <MenuItem href="/" label={t("home")} onClick={() => setOpen(false)} />
          <MenuItem
            href="/studio"
            label={t("studio")}
            active
            onClick={() => setOpen(false)}
          />

          <div
            style={{
              margin: "0.75rem 1.25rem",
              height: "1px",
              backgroundColor: "var(--color-border)",
            }}
          />

          <MenuLabel>{t("comingSoon")}</MenuLabel>
          <MenuItem href="#" label={t("gallery")} disabled />
          <MenuItem href="#" label={t("guide")} disabled />
        </nav>

        {/* Menu Footer */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid var(--color-border)",
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
          }}
        >
          Your Point, Your Tint.
        </div>
      </div>
    </>
  );
}

function MenuItem({
  href,
  label,
  active,
  disabled,
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (disabled) {
    return (
      <span
        style={{
          display: "block",
          padding: "0.5rem 1.25rem",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
          opacity: 0.5,
          cursor: "default",
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        padding: "0.5rem 1.25rem",
        fontSize: "0.8125rem",
        color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
        textDecoration: "none",
        transition: "color 0.15s",
        borderLeft: active
          ? "2px solid var(--color-accent)"
          : "2px solid transparent",
      }}
    >
      {label}
    </Link>
  );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "block",
        padding: "0.25rem 1.25rem",
        fontSize: "0.625rem",
        fontWeight: 600,
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}
    >
      {children}
    </span>
  );
}
