import React from 'react';

interface MitraMascotProps {
  size?: number;
  isThinking?: boolean;
  isOpen?: boolean;
  isWaving?: boolean;
  className?: string;
}

const MitraMascot: React.FC<MitraMascotProps> = ({ 
  size = 64, 
  isThinking = false, 
  isOpen = false, 
  isWaving = false,
  className = "" 
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-1000 ${className} ${!isOpen ? 'animate-float' : ''}`}
      style={{ width: size, height: size }}
    >
      <style>
        {`
          @keyframes mascot-wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-30deg); }
            75% { transform: rotate(10deg); }
          }
          .animate-wave {
            animation: mascot-wave 0.6s ease-in-out infinite;
            transform-origin: 35px 65px;
          }
        `}
      </style>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(124,148,115,0.3)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Orbital Ring - Spatial Reasoning Symbol */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#7c9473"
          strokeWidth="1.5"
          strokeDasharray="10 20"
          className={`opacity-40 origin-center ${isThinking ? 'animate-spin' : 'animate-[spin_10s_linear_infinite]'}`}
        />

        {/* Outer Halo */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="white"
          strokeWidth="0.5"
          className="opacity-10"
        />

        {/* Main Body Shell */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c9473" />
            <stop offset="100%" stopColor="#4b5d44" />
          </linearGradient>
          <filter id="glassBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
        </defs>

        {/* Waving Arm / Connector */}
        <g className={isWaving ? "animate-wave" : "transition-transform"}>
          <rect
            x="22"
            y="55"
            width="14"
            height="8"
            rx="4"
            fill="#7c9473"
            className="opacity-80"
          />
          <circle
            cx="22"
            cy="59"
            r="5"
            fill="#7c9473"
          />
        </g>

        {/* Main Body Shell */}
        <rect
          x="28"
          y="32"
          width="44"
          height="36"
          rx="18"
          fill="url(#bodyGradient)"
          className="transition-all duration-700"
        />

        {/* Visor Screen */}
        <rect
          x="32"
          y="38"
          width="36"
          height="18"
          rx="9"
          fill="#07080a"
          className="opacity-90"
        />

        {/* Eyes - Expressive LEDs */}
        <g className="transition-all duration-500">
          <rect
            x={isThinking ? "40" : "40"}
            y="45"
            width={isThinking ? "6" : "4"}
            height="3"
            rx="1.5"
            fill="#7c9473"
            className={`${isThinking ? 'animate-pulse' : ''}`}
          />
          <rect
            x={isThinking ? "54" : "56"}
            y="45"
            width={isThinking ? "6" : "4"}
            height="3"
            rx="1.5"
            fill="#7c9473"
            className={`${isThinking ? 'animate-pulse' : ''}`}
          />
        </g>

        {/* Inner Core Pulse Glow */}
        {isThinking && (
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="white"
            className="opacity-20 animate-pulse"
            filter="url(#glassBlur)"
          />
        )}
      </svg>
      
      {/* Reflection Highlight */}
      <div className="absolute top-[35%] left-[35%] w-[15%] h-[10%] bg-white/20 rounded-full blur-[2px] transform -rotate-45 pointer-events-none"></div>
    </div>
  );
};

export default MitraMascot;