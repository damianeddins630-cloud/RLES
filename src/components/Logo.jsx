export default function Logo({ size = 'large', className = '' }) {
  const dimensions = size === 'large' ? { width: 320, height: 140 } : { width: 180, height: 80 }

  return (
    <svg
      viewBox="0 0 320 140"
      width={dimensions.width}
      height={dimensions.height}
      className={`logo ${className}`}
      aria-label="RLES 2v2"
      role="img"
    >
      <defs>
        <linearGradient id="rles-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e8e8e8" />
          <stop offset="55%" stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="4" stdDeviation="0" floodColor="#000" floodOpacity="1" />
        </filter>
      </defs>

      <g transform="rotate(-8 160 70)">
        {/* Blue outer border layer */}
        <text
          x="160"
          y="72"
          textAnchor="middle"
          fontFamily="'Bebas Neue', Impact, sans-serif"
          fontSize="72"
          fontWeight="400"
          fontStyle="italic"
          fill="none"
          stroke="#00a8ff"
          strokeWidth="10"
          strokeLinejoin="round"
        >
          RLES
        </text>

        {/* Black shadow layer */}
        <text
          x="162"
          y="74"
          textAnchor="middle"
          fontFamily="'Bebas Neue', Impact, sans-serif"
          fontSize="72"
          fontWeight="400"
          fontStyle="italic"
          fill="#000"
        >
          RLES
        </text>

        {/* White main text */}
        <text
          x="160"
          y="72"
          textAnchor="middle"
          fontFamily="'Bebas Neue', Impact, sans-serif"
          fontSize="72"
          fontWeight="400"
          fontStyle="italic"
          fill="url(#rles-shine)"
          stroke="#000"
          strokeWidth="2"
        >
          RLES
        </text>

        {/* 2v2 blue border */}
        <text
          x="160"
          y="118"
          textAnchor="middle"
          fontFamily="'Permanent Marker', cursive"
          fontSize="36"
          fill="none"
          stroke="#00a8ff"
          strokeWidth="6"
          strokeLinejoin="round"
        >
          2v2
        </text>

        {/* 2v2 black shadow */}
        <text
          x="162"
          y="120"
          textAnchor="middle"
          fontFamily="'Permanent Marker', cursive"
          fontSize="36"
          fill="#000"
        >
          2v2
        </text>

        {/* 2v2 purple text */}
        <text
          x="160"
          y="118"
          textAnchor="middle"
          fontFamily="'Permanent Marker', cursive"
          fontSize="36"
          fill="#9b30ff"
        >
          2v2
        </text>
      </g>
    </svg>
  )
}
