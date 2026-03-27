import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <>
      <Header />
      <main
        className="flex flex-col items-center justify-center"
        style={{ minHeight: "calc(100vh - 3.5rem)" }}
      >
        <h1
          className="text-4xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          poin+tint
        </h1>
        <p
          className="mt-4 text-lg"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Your Point, Your Tint.
        </p>
        <div
          className="mt-8 h-1 w-16"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      </main>
      <ThemeToggle />
    </>
  );
}
