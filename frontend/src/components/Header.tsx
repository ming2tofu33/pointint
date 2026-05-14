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
  const studioT = useTranslations("studio");
  const pathname = usePathname();
  const isStudioPath = pathname === "/studio" || pathname.startsWith("/studio/");

  const navItems = [
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
    <header
      className={`app-header${isStudioPath ? " app-header--studio" : ""}`}
      data-testid="app-header"
      data-studio-header={isStudioPath ? "true" : undefined}
      style={{
        borderBottom: "1px solid var(--app-header-border)",
        background:
          "linear-gradient(180deg, var(--app-header-highlight), var(--app-header-backdrop))",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(18px) saturate(1.04)",
        width: "100%",
        ["--app-header-height" as string]: "4.25rem",
        boxShadow:
          "inset 0 1px 0 var(--app-header-highlight), 0 8px 18px var(--app-header-shadow)",
      }}
    >
      <div className="app-header-shell">
        <div className="app-header-left">
          {isStudioPath ? (
            <div className="app-header-studio-menu">
              <SideMenu variant="studio" />
            </div>
          ) : null}
          <Link
            href="/"
            data-testid="app-header-logo"
            style={{
              fontSize: "1.18rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            poin+tint
          </Link>
          {isStudioPath ? (
            <>
              <span className="app-header-studio-title">{t("studio")}</span>
              <span className="app-header-divider" aria-hidden="true" />
              <div
                id="studio-header-project-meta"
                className="app-header-studio-meta"
                data-testid="studio-header-project-meta"
                aria-label={studioT("untitledProject")}
              />
            </>
          ) : null}
        </div>

        {!isStudioPath ? (
          <nav className="app-header-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className="app-header-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="app-header-right">
          {isStudioPath ? (
            <div
              id="studio-header-actions"
              className="app-header-studio-actions"
              data-testid="studio-header-actions"
            />
          ) : null}
          <ThemeToggle />
          <HeaderUtilityMenu />
          <div className="app-header-mobile-menu">
            {isStudioPath ? null : <SideMenu />}
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
          gap: 0.75rem;
          min-width: 0;
        }

        .app-header--studio .app-header-shell {
          width: min(1600px, calc(100% - 2rem));
          grid-template-columns: minmax(0, 1fr) auto;
        }

        .app-header-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.9rem, 2vw, 1.35rem);
        }

        .app-header-link {
          display: inline-flex;
          align-items: center;
          min-height: 2.75rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: var(--color-text-secondary);
          box-shadow: inset 0 -2px 0 transparent;
          transition: color 0.2s, box-shadow 0.2s;
        }

        .app-header-link:hover,
        .app-header-link:focus-visible {
          color: var(--color-text-primary);
          box-shadow: inset 0 -2px 0 var(--color-accent);
        }

        .app-header-link[aria-current="page"] {
          color: var(--color-text-primary);
          box-shadow: inset 0 -2px 0 var(--color-accent);
        }

        .app-header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .app-header-studio-title {
          color: var(--color-text-primary);
          font-size: 0.95rem;
          font-weight: 760;
          line-height: 1;
          white-space: nowrap;
        }

        .app-header-divider {
          width: 1px;
          height: 1rem;
          background-color: var(--app-header-border);
          flex: 0 0 auto;
        }

        .app-header-studio-meta {
          min-width: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          color: var(--color-text-secondary);
          font-size: 0.78rem;
          font-weight: 650;
          line-height: 1;
          white-space: nowrap;
        }

        .app-header-project-title {
          max-width: 18rem;
          overflow: hidden;
          color: var(--color-text-primary);
          text-overflow: ellipsis;
        }

        .app-header-muted-separator,
        .app-header-save-status {
          color: var(--color-text-muted);
        }

        .app-header-studio-actions {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          min-width: 0;
        }

        .app-header-mobile-menu {
          display: none;
        }

        .app-header-studio-menu {
          display: none;
        }

        .app-header--studio .app-header-studio-menu {
          display: inline-flex;
          align-items: center;
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
