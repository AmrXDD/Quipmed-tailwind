import { motion } from "framer-motion";

/**
 * A stylised CT-scan / radar console based on the hero concept asset.
 * Pure SVG — scales cleanly, animates independently, and is accessible.
 * Uses a deep medical-green radar scope with a glowing neon-green line
 * scan, a red status LED, and four horizontal control indentations.
 */
export default function CTScanDevice({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-12, 12, -12] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      aria-label="QuipMed diagnostic imaging console"
      role="img"
    >
      <svg
        viewBox="0 0 360 420"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-console"
      >
        <defs>
          <linearGradient id="consoleBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--bg-tertiary)" />
            <stop offset="1" stopColor="var(--bg-secondary)" />
          </linearGradient>
          <radialGradient id="scopeGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#00FFA0" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#0A3A18" stopOpacity="0.9" />
            <stop offset="1" stopColor="#041409" />
          </radialGradient>
          <linearGradient id="scanBar" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#00FF7F" stopOpacity="0" />
            <stop offset="0.5" stopColor="#00FF9D" stopOpacity="1" />
            <stop offset="1" stopColor="#00FF7F" stopOpacity="0" />
          </linearGradient>
          <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="scopeClip">
            <circle cx="180" cy="180" r="92" />
          </clipPath>
        </defs>

        {/* ── Outer console shell ─────────────────────────────── */}
        <rect
          x="8"
          y="8"
          width="344"
          height="404"
          rx="42"
          fill="url(#consoleBody)"
          stroke="var(--border-color)"
          strokeWidth="1.5"
        />
        {/* Subtle highlight */}
        <rect
          x="8"
          y="8"
          width="344"
          height="60"
          rx="42"
          fill="var(--text-muted)"
          opacity="0.1"
        />

        {/* ── Top status bar ──────────────────────────────────── */}
        <rect x="28" y="26" width="120" height="6" rx="3" fill="#1E2D47" />
        <rect x="28" y="38" width="70" height="4" rx="2" fill="#243654" />
        {/* Red status LED */}
        <circle cx="320" cy="34" r="6" fill="#FF3A3A">
          <animate
            attributeName="opacity"
            values="1;0.45;1"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="320"
          cy="34"
          r="12"
          fill="#FF3A3A"
          opacity="0.25"
          filter="url(#softGlow)"
        />

        {/* ── Central radar scope ─────────────────────────────── */}
        <circle cx="180" cy="180" r="110" fill="#07130A" />
        <circle cx="180" cy="180" r="100" fill="url(#scopeGlow)" />
        <circle cx="180" cy="180" r="100" fill="none" stroke="#0C3F1F" strokeWidth="1.5" />

        {/* concentric rings */}
        <g stroke="#00FF9D" fill="none" opacity="0.55">
          <circle cx="180" cy="180" r="20" strokeWidth="0.8" />
          <circle cx="180" cy="180" r="40" strokeWidth="0.8" />
          <circle cx="180" cy="180" r="60" strokeWidth="0.8" />
          <circle cx="180" cy="180" r="80" strokeWidth="0.8" />
          <circle cx="180" cy="180" r="95" strokeWidth="0.8" opacity="0.4" />
        </g>
        {/* crosshair */}
        <g stroke="#00FF9D" opacity="0.3" strokeWidth="0.6">
          <line x1="80" y1="180" x2="280" y2="180" />
          <line x1="180" y1="80" x2="180" y2="280" />
        </g>

        {/* sweeping radar arm */}
        <g clipPath="url(#scopeClip)">
          <g style={{ transformOrigin: "180px 180px" }}>
            <path
              d="M180 180 L180 85 A95 95 0 0 1 272 180 Z"
              fill="#00FF9D"
              opacity="0.14"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 180 180"
                to="360 180 180"
                dur="5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>

        {/* central core */}
        <circle cx="180" cy="180" r="6" fill="#00FF9D" />
        <circle
          cx="180"
          cy="180"
          r="14"
          fill="#00FF9D"
          opacity="0.25"
          filter="url(#softGlow)"
        />

        {/* ── Neon-green horizontal line-scan ─────────────────── */}
        <g transform="translate(60, 305)">
          <rect
            width="240"
            height="16"
            rx="8"
            fill="#050D07"
            stroke="#0C3F1F"
            strokeWidth="1"
          />
          <rect
            x="8"
            y="6"
            width="224"
            height="4"
            rx="2"
            fill="url(#scanBar)"
            filter="url(#neonBlur)"
          >
            <animate
              attributeName="x"
              values="8;120;8"
              dur="2.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
            />
          </rect>
          <rect
            x="8"
            y="6"
            width="224"
            height="4"
            rx="2"
            fill="url(#scanBar)"
          >
            <animate
              attributeName="x"
              values="8;120;8"
              dur="2.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
            />
          </rect>
        </g>

        {/* ── Four horizontal control indentations ─────────────── */}
        <g transform="translate(60, 345)">
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(0, ${i * 14})`}>
              <rect
                width="240"
                height="8"
                rx="4"
                fill="#050D17"
                stroke="#1A2A46"
                strokeWidth="0.75"
              />
              <rect
                x="4"
                y="2"
                width={60 + i * 20}
                height="4"
                rx="2"
                fill="#2A3D5E"
              />
            </g>
          ))}
        </g>

        {/* ── Brand dot in corner ─────────────────────────────── */}
        <circle cx="34" cy="394" r="4" fill="#00FFFF" opacity="0.8" />
      </svg>
    </motion.div>
  );
}
