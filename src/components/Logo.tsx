interface LogoProps {
  className?: string;
  /** "light" renders white (for navy bg), "dark" renders navy. */
  tone?: "light" | "dark";
}

/**
 * QuipMed wordmark — recreates the Outfit-based logo from the brand kit.
 * Stacked "QUIP / MED" with the trailing D extended into a curved swoosh.
 */
export default function Logo({ className, tone = "light" }: LogoProps) {
  const logoSrc = tone === "light" ? "/brand-logo-main.png" : "/logo-secondary-black.png";
  
  return (
    <span
      className={className}
      style={{ display: "inline-block" }}
      aria-label="QuipMed"
    >
      <img
        src={logoSrc}
        alt="QuipMed Logo"
        className="h-full w-auto object-contain"
      />
    </span>
  );
}
