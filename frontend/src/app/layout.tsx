import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pointint — Your Point, Your Tint.",
  description:
    "Turn your image into a custom Windows cursor. The easiest way to make your own cursor.",
  openGraph: {
    title: "Pointint — Your Point, Your Tint.",
    description:
      "Turn your image into a custom Windows cursor. The easiest way to make your own cursor.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pointint — Your Point, Your Tint.",
    description:
      "Turn your image into a custom Windows cursor. The easiest way to make your own cursor.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
