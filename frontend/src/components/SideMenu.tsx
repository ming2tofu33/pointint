"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface SideMenuProps {
  variant?: "default" | "studio";
}

export default function SideMenu({ variant = "default" }: SideMenuProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isStudioVariant = variant === "studio";
  const menuId = isStudioVariant
    ? "studio-navigation-drawer"
    : "site-navigation-drawer";
  const navItems = [
    ...(isStudioVariant
      ? [
          {
            href: "/",
            label: t("home"),
            active: pathname === "/",
          },
        ]
      : []),
    {
      href: "/studio",
      label: t("studio"),
      active: pathname.startsWith("/studio"),
    },
    {
      href: "/tools",
      label: t("tools"),
      active: pathname === "/tools" || pathname.startsWith("/tools/"),
    },
    {
      href: "/guides",
      label: t("guides"),
      active: pathname === "/guides" || pathname.startsWith("/guides/"),
    },
    {
      href: "/explore",
      label: t("explore"),
      active: pathname.startsWith("/explore"),
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("openMenu")}
        aria-controls={menuId}
        aria-expanded={open}
        data-testid={isStudioVariant ? "studio-header-menu-trigger" : undefined}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "4px",
          width: "2rem",
          height: "2rem",
          background: isStudioVariant
            ? "var(--studio-button-bg, transparent)"
            : "none",
          border: isStudioVariant
            ? "1px solid var(--color-border)"
            : "none",
          cursor: "pointer",
          padding: "0.25rem",
          color: "var(--color-text-secondary)",
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
            width: "100vw",
            height: "100dvh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 90,
            transition: "opacity 0.2s",
          }}
        />
      )}

      {open ? (
        <aside
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${menuId}-title`}
          data-testid={
            isStudioVariant ? "studio-navigation-drawer" : "site-navigation-drawer"
          }
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: isStudioVariant ? "17.5rem" : "15rem",
            height: "100dvh",
            backgroundColor: isStudioVariant
              ? "var(--studio-chrome-bg, var(--color-bg-secondary))"
              : "var(--color-bg-secondary)",
            borderRight: "1px solid var(--color-border)",
            boxShadow: isStudioVariant
              ? "18px 0 52px rgba(0, 0, 0, 0.22)"
              : undefined,
            zIndex: 100,
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
            minHeight: "3.5rem",
          }}
        >
          <Link
            id={`${menuId}-title`}
            href="/"
            onClick={() => setOpen(false)}
            style={{
              fontSize: "0.95rem",
              fontWeight: 760,
              color: "var(--color-text-primary)",
              textDecoration: "none",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            poin+tint
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              lineHeight: 1,
              width: "2rem",
              height: "2rem",
            }}
          >
            x
          </button>
        </div>

        <nav
          aria-label={
            isStudioVariant ? "Studio navigation drawer" : "Site navigation drawer"
          }
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
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
        </aside>
      ) : null}
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
        padding: "0.58rem 1.25rem",
        fontSize: "0.8125rem",
        fontWeight: active ? 760 : 650,
        color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
        textDecoration: "none",
        transition: "color 0.15s, background-color 0.15s",
        borderLeft: active
          ? "2px solid var(--color-accent)"
          : "2px solid transparent",
        backgroundColor: active
          ? "color-mix(in srgb, var(--color-accent) 9%, transparent)"
          : "transparent",
      }}
    >
      {label}
    </Link>
  );
}
