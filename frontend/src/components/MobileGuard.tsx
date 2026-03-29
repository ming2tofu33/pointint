"use client";

import Link from "next/link";

export default function MobileGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 모바일에서만 보이는 안내 */}
      <div
        className="block md:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          backgroundColor: "var(--color-bg-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          poin+tint Studio
        </span>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            maxWidth: "20rem",
          }}
        >
          Cursor creation works best on desktop. Open this page on a computer to
          start making your cursor.
        </p>
        <Link
          href="/"
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-accent)",
            textDecoration: "none",
            padding: "0.5rem 1.5rem",
            border: "1px solid var(--color-accent)",
          }}
        >
          Go to Home
        </Link>
      </div>

      {/* 데스크톱에서만 보이는 스튜디오 */}
      <div className="hidden md:flex" style={{ flexDirection: "column", height: "100vh" }}>
        {children}
      </div>
    </>
  );
}
