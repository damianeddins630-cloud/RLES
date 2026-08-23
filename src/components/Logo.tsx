import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 200, className, ...props }: LogoProps) {
  const height = size * 0.72;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 320 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="League Master System"
      {...props}
    >
      <defs>
        <linearGradient id="lmsBlue" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="lmsSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Top arc — blue outer, silver inner */}
      <path
        d="M 40 95 A 120 120 0 0 1 280 95"
        fill="none"
        stroke="url(#lmsBlue)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 52 95 A 108 108 0 0 1 268 95"
        fill="none"
        stroke="url(#lmsSilver)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Bottom arc — silver outer, blue inner */}
      <path
        d="M 40 125 A 120 120 0 0 0 280 125"
        fill="none"
        stroke="url(#lmsSilver)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 52 125 A 108 108 0 0 0 268 125"
        fill="none"
        stroke="url(#lmsBlue)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* L */}
      <text
        x="88"
        y="118"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="72"
        fontWeight="700"
        fontStyle="italic"
        fill="url(#lmsBlue)"
      >
        L
      </text>

      {/* M — silver with notch effect via clip or separate path */}
      <text
        x="160"
        y="118"
        textAnchor="middle"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="72"
        fontWeight="700"
        fontStyle="italic"
        fill="url(#lmsSilver)"
      >
        M
      </text>
      <path
        d="M 148 72 L 152 88 L 140 88 Z"
        fill="url(#lmsBlue)"
      />

      {/* S */}
      <text
        x="232"
        y="118"
        textAnchor="end"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="72"
        fontWeight="700"
        fontStyle="italic"
        fill="url(#lmsBlue)"
      >
        S
      </text>

      {/* LEAGUE MASTER wing lines */}
      <line x1="48" y1="148" x2="88" y2="148" stroke="url(#lmsBlue)" strokeWidth="3" />
      <line x1="232" y1="148" x2="272" y2="148" stroke="url(#lmsBlue)" strokeWidth="3" />

      <text
        x="160"
        y="154"
        textAnchor="middle"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="3"
        fill="url(#lmsBlue)"
      >
        LEAGUE MASTER
      </text>

      {/* SYSTEM */}
      <line x1="100" y1="178" x2="120" y2="178" stroke="#94a3b8" strokeWidth="1" />
      <line x1="200" y1="178" x2="220" y2="178" stroke="#94a3b8" strokeWidth="1" />

      <text
        x="160"
        y="182"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="14"
        fontWeight="400"
        letterSpacing="8"
        fill="url(#lmsSilver)"
      >
        SYSTEM
      </text>
    </svg>
  );
}
