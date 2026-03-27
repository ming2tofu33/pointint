import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold" style={{ color: "var(--color-text-primary)" }}>
        Pointint
      </h1>
      <p className="mt-4 text-lg" style={{ color: "var(--color-text-secondary)" }}>
        Your Point, Your Tint.
      </p>
      <div
        className="mt-8 h-1 w-16"
        style={{ backgroundColor: "var(--color-accent)" }}
      />
      <ThemeToggle />
    </main>
  );
}
