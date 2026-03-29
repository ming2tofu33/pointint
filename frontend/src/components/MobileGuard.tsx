"use client";

import Link from "next/link";

export default function MobileGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 1024px 미만: 모바일 안내 */}
      <div
        className="flex lg:hidden fixed inset-0 z-[200] flex-col items-center justify-center gap-6 p-8 text-center"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
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

      {/* 1024px 이상: 스튜디오 */}
      <div className="hidden lg:flex flex-col h-screen">
        {children}
      </div>
    </>
  );
}
