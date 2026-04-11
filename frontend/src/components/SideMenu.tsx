"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();
  const navItems = [
    {
      href: "/explore",
      label: t("explore"),
      active: pathname.startsWith("/explore"),
    },
    {
      href: "/studio",
      label: t("studio"),
      active: pathname.startsWith("/studio"),
    },
  ];

  return (
    <>
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
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1rem 0",
            flex: 1,
          }}
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={item.active}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </div>
    </>
  );
}

function MenuItem({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
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
