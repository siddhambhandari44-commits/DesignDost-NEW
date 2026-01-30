
import React, { useState, useEffect } from 'react';

interface RadarMapProps {
  data: number[]; // Array of values (0-100)
  labels: string[];
  size?: number;
}

const RadarMap: React.FC<RadarMapProps> = ({ data, labels, size = 400 }) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [animatedData, setAnimatedData] = useState<number[]>(data.map(() => 0));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  // Use a fixed viewbox to ensure consistent internal geometry
  const VIEWBOX_SIZE = 420;
  const CENTER = VIEWBOX_SIZE / 2;
  const CHART_RADIUS = 120; // Radius of the grid
  const LABEL_RADIUS = 155; // Radius where labels sit
  
  const angleStep = (Math.PI * 2) / data.length;

  // Helper to get cartesian coordinates from index and value/radius
  // Rotates by -PI/2 so index 0 is at the top
  const getCoordinates = (index: number, radiusScale: number) => {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: CENTER + radiusScale * Math.cos(angle),
      y: CENTER + radiusScale * Math.sin(angle),
      angle
    };
  };

  // Points for the data polygon
  const points = animatedData.map((val, i) => {
    // Map 0-100 value to pixel radius
    const r = (val / 100) * CHART_RADIUS;
    return getCoordinates(i, r);
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-radial from-[#7c9473]/10 to-transparent opacity-50 blur-2xl pointer-events-none"></div>

      <svg 
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#7c9473" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c9473" stopOpacity="0.05" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid Levels (25%, 50%, 75%, 100%) */}
        {[25, 50, 75, 100].map((level, lvlIdx) => (
          <path
            key={level}
            d={labels.map((_, i) => {
              const r = (level / 100) * CHART_RADIUS;
              const c = getCoordinates(i, r);
              return `${i === 0 ? 'M' : 'L'} ${c.x},${c.y}`;
            }).join(' ') + ' Z'}
            fill="none"
            stroke="white"
            strokeOpacity={lvlIdx === 3 ? 0.2 : 0.05}
            strokeWidth={1.5}
            strokeDasharray={lvlIdx === 3 ? "0" : "4 4"}
          />
        ))}

        {/* Axis Lines */}
        {labels.map((_, i) => {
          const end = getCoordinates(i, CHART_RADIUS);
          return <line key={i} x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke="white" strokeOpacity={0.1} strokeWidth={1} />;
        })}

        {/* Data Polygon */}
        <path
          d={pathData}
          fill="url(#radarFill)"
          stroke="#7c9473"
          strokeWidth="3"
          filter="url(#glow)"
          className="transition-[d] duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />

        {/* Interactive Points & Labels */}
        {labels.map((label, i) => {
          const pt = points[i];
          const isActive = activeNode === i;
          
          // Calculate Label Position
          const labelPos = getCoordinates(i, LABEL_RADIUS);
          
          // Determine Text Alignment based on angle (in degrees 0-360)
          let degrees = (labelPos.angle * 180 / Math.PI);
          degrees = (degrees + 360) % 360; // Normalize

          let textAnchor = 'middle';
          let dominantBaseline = 'middle';
          let xOffset = 0;
          let yOffset = 0;

          // Logic for 5-axis symmetry (Pentagon) or general
          // 270 is TOP. 
          // 0 is RIGHT.
          // 90 is BOTTOM.
          // 180 is LEFT.

          if (degrees > 260 && degrees < 280) { 
            // Top
            textAnchor = 'middle';
            dominantBaseline = 'auto'; // sit on top
            yOffset = -5;
          } else if (degrees >= 280 || degrees < 45) {
            // Top Right & Right
            textAnchor = 'start';
            dominantBaseline = 'middle';
            xOffset = 10;
          } else if (degrees >= 45 && degrees < 135) {
            // Bottom Right & Bottom
            // For Pentagon (54deg) vs Bottom (90deg) vs BotLeft (126deg)
            // 54deg
            if (degrees < 80) {
                textAnchor = 'start';
                dominantBaseline = 'hanging';
                xOffset = 5;
                yOffset = 5;
            } else if (degrees > 100) {
                textAnchor = 'end';
                dominantBaseline = 'hanging';
                xOffset = -5;
                yOffset = 5;
            } else {
                textAnchor = 'middle';
                dominantBaseline = 'hanging';
                yOffset = 10;
            }
          } else if (degrees >= 135 && degrees < 225) {
            // Bottom Left & Left
            textAnchor = 'end';
            dominantBaseline = 'middle';
            xOffset = -10;
          } else {
            // Top Left
            textAnchor = 'end';
            dominantBaseline = 'middle';
            xOffset = -10;
            yOffset = -5;
          }

          return (
            <g 
              key={i} 
              onMouseEnter={() => setActiveNode(i)}
              onMouseLeave={() => setActiveNode(null)}
              className="cursor-pointer group"
            >
              {/* Invisible Hit Area */}
              <circle cx={pt.x} cy={pt.y} r="30" fill="transparent" />

              {/* Node Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 8 : 4}
                fill={isActive ? '#fff' : '#7c9473'}
                stroke="#050608"
                strokeWidth="2"
                className="transition-all duration-300"
              />

              {/* Label Text */}
              <text
                x={labelPos.x + xOffset}
                y={labelPos.y + yOffset}
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                className={`text-[13px] font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? 'fill-white text-[15px]' : 'fill-gray-400'}`}
                style={{ 
                  textShadow: isActive ? '0 0 20px rgba(255,255,255,0.6)' : 'none',
                  pointerEvents: 'none'
                }}
              >
                {label}
              </text>

              {/* Tooltip Value */}
              <g 
                className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                transform={`translate(${pt.x}, ${pt.y - 30})`}
              >
                <rect x="-24" y="-20" width="48" height="28" rx="8" fill="#7c9473" stroke="#fff" strokeWidth="2" />
                <text 
                  x="0" y="-6" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-[14px] font-bold fill-white"
                  dy="1"
                >
                  {Math.round(animatedData[i])}
                </text>
                <path d="M -6 10 L 0 16 L 6 10 Z" fill="#7c9473" stroke="#fff" strokeWidth="1" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarMap;
    