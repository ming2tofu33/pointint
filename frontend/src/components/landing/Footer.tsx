interface FooterProps {
  tagline: string;
}

export default function Footer({ tagline }: FooterProps) {
  return (
    <footer
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "min(1200px, calc(100% - 2rem))",
        margin: "0 auto",
        padding: "1.35rem 0 2.4rem",
        borderTop: "1px solid var(--landing-divider)",
      }}
    >
      <span
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "var(--color-text-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        poin+tint
      </span>
      <span
        style={{
          fontSize: "0.78rem",
          color: "var(--color-text-muted)",
          fontStyle: "italic",
        }}
      >
        {tagline}
      </span>
    </footer>
  );
}
