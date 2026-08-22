interface LogoProps {
  className?: string
  width?: number
}

export default function Logo({ className = '', width = 280 }: LogoProps) {
  const height = width * 0.45

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 280 126"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RLES 2v2"
      role="img"
    >
      <defs>
        <linearGradient id="letterFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="rotate(-4 140 63)" filter="url(#glow)">
        {/* RLES - outer blue stroke */}
        <text
          x="140"
          y="62"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', sans-serif"
          fontSize="72"
          fontWeight="900"
          fontStyle="italic"
          fill="none"
          stroke="#00b4ff"
          strokeWidth="10"
          strokeLinejoin="round"
        >
          RLES
        </text>
        {/* RLES - black outline */}
        <text
          x="140"
          y="62"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', sans-serif"
          fontSize="72"
          fontWeight="900"
          fontStyle="italic"
          fill="none"
          stroke="#000000"
          strokeWidth="5"
          strokeLinejoin="round"
        >
          RLES
        </text>
        {/* RLES - fill */}
        <text
          x="140"
          y="62"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', sans-serif"
          fontSize="72"
          fontWeight="900"
          fontStyle="italic"
          fill="url(#letterFill)"
        >
          RLES
        </text>

        {/* 2v2 - outer blue stroke */}
        <text
          x="148"
          y="108"
          textAnchor="middle"
          fontFamily="'Segoe Script', 'Brush Script MT', cursive"
          fontSize="44"
          fontWeight="700"
          fill="none"
          stroke="#00b4ff"
          strokeWidth="7"
          strokeLinejoin="round"
        >
          2v2
        </text>
        {/* 2v2 - black outline */}
        <text
          x="148"
          y="108"
          textAnchor="middle"
          fontFamily="'Segoe Script', 'Brush Script MT', cursive"
          fontSize="44"
          fontWeight="700"
          fill="none"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        >
          2v2
        </text>
        {/* 2v2 - purple fill */}
        <text
          x="148"
          y="108"
          textAnchor="middle"
          fontFamily="'Segoe Script', 'Brush Script MT', cursive"
          fontSize="44"
          fontWeight="700"
          fill="#9b30ff"
        >
          2v2
        </text>
      </g>
    </svg>
  )
}
