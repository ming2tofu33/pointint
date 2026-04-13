import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import ConsentBanner from "@/components/ConsentBanner";
import Header from "@/components/Header";
import { ANALYTICS_CONSENT_COOKIE } from "@/lib/analytics-consent";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://pointtint.com"),
    alternates: {
      canonical: "https://pointtint.com",
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      url: "https://pointtint.com",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get(ANALYTICS_CONSENT_COOKIE)?.value;
  const initialConsent =
    consentCookie === "accepted" || consentCookie === "declined"
      ? consentCookie
      : "unknown";

  return (
    <html lang={locale} data-theme="dark">
      <head>
        <meta name="theme-color" content="#0D0F12" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <AnalyticsPageView />
          <ConsentBanner initialConsent={initialConsent} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
