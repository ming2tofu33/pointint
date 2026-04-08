import { getTranslations } from "next-intl/server";
import Header from "@/components/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import SettingsBar from "@/components/SettingsBar";

export default async function Home() {
  const t = await getTranslations("landing");

  const steps = [
    { number: 1, title: t("step1Title"), sub: t("step1Sub") },
    { number: 2, title: t("step2Title"), sub: t("step2Sub") },
    { number: 3, title: t("step3Title"), sub: t("step3Sub") },
  ];

  const faqItems = [
    { question: t("faq1Q"), answer: t("faq1A") },
    { question: t("faq2Q"), answer: t("faq2A") },
    { question: t("faq3Q"), answer: t("faq3A") },
    { question: t("faq4Q"), answer: t("faq4A") },
    { question: t("faq5Q"), answer: t("faq5A") },
    { question: t("faq6Q"), answer: t("faq6A") },
  ];

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Pointint",
    url: "https://pointtint.com",
    applicationCategory: "DesignApplication",
    operatingSystem: "Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Turn your image into a custom Windows cursor. Upload, edit hotspot, simulate, and download .cur — free, no account needed.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <HowItWorks steps={steps} />
        <FAQ items={faqItems} />
      </main>
      <Footer tagline={t("footerTagline")} />
      <SettingsBar />
    </>
  );
}
