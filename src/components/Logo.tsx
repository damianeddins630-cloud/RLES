import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 200, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 320 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RLES 2V2"
      {...props}
    >
      <defs>
        <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#b0b0b0" />
        </linearGradient>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer blue stroke */}
      <path
        d="M28 42 L292 28 L308 148 L44 162 Z"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Black badge background */}
      <path
        d="M32 46 L288 34 L302 144 L48 156 Z"
        fill="#0a0a0a"
        stroke="#1a1a1a"
        strokeWidth="2"
      />

      {/* RLES text */}
      <text
        x="160"
        y="78"
        textAnchor="middle"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="52"
        fontWeight="700"
        fontStyle="italic"
        fill="url(#whiteGrad)"
        letterSpacing="4"
      >
        RLES
      </text>

      {/* Glossy highlight on RLES */}
      <text
        x="160"
        y="78"
        textAnchor="middle"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="52"
        fontWeight="700"
        fontStyle="italic"
        fill="white"
        opacity="0.3"
        letterSpacing="4"
        clipPath="inset(0 0 55% 0)"
      >
        RLES
      </text>

      {/* 2V2 text */}
      <text
        x="160"
        y="132"
        textAnchor="middle"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="48"
        fontWeight="700"
        fill="url(#purpleGrad)"
        letterSpacing="6"
        filter="url(#glow)"
      >
        2V2
      </text>
    </svg>
  );
}
