"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import HeaderUtilityMenu from "@/components/HeaderUtilityMenu";
import SideMenu from "@/components/SideMenu";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
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
    <header
      style={{
        borderBottom: "1px solid var(--landing-divider)",
        background:
          "linear-gradient(180deg, var(--landing-header-highlight), var(--landing-header-backdrop))",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(18px) saturate(1.15)",
        width: "100%",
        ["--app-header-height" as string]: "4.25rem",
        boxShadow:
          "inset 0 1px 0 var(--landing-header-highlight), 0 12px 28px var(--landing-header-shadow)",
      }}
    >
      <div className="app-header-shell">
        <div className="app-header-left">
          <Link
            href="/"
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            poin+tint
          </Link>
        </div>

        <nav className="app-header-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className="app-header-link"
              style={{
                color: item.active
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                boxShadow: item.active
                  ? "inset 0 -1px 0 var(--color-accent)"
                  : "none",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="app-header-right">
          <ThemeToggle />
          <HeaderUtilityMenu />
          <div className="app-header-mobile-menu">
            <SideMenu />
          </div>
        </div>
      </div>
      <style>{`
        .app-header-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          width: min(1200px, calc(100% - 2rem));
          min-height: var(--app-header-height);
          margin: 0 auto;
          gap: 1rem;
        }

        .app-header-left {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .app-header-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.35rem;
        }

        .app-header-link {
          display: inline-flex;
          align-items: center;
          min-height: 2.75rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color 0.2s, box-shadow 0.2s;
        }

        .app-header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .app-header-mobile-menu {
          display: none;
        }

        @media (max-width: 767px) {
          .app-header-shell {
            grid-template-columns: minmax(0, 1fr) auto;
          }

          .app-header-nav {
            display: none;
          }

          .app-header-mobile-menu {
            display: inline-flex;
            align-items: center;
          }
        }
      `}</style>
    </header>
  );
}
