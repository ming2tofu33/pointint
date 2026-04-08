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
        padding: "2rem",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "var(--color-text-muted)",
          letterSpacing: "-0.02em",
        }}
      >
        poin+tint
      </span>
      <span
        style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          fontStyle: "italic",
        }}
      >
        {tagline}
      </span>
    </footer>
  );
}
