import { useMemo } from 'react';
import type { RiskComponent } from '../../types';

interface ThreatRadarChartProps {
  components: RiskComponent[];
  size?: number;
}

export function ThreatRadarChart({ components, size = 320 }: ThreatRadarChartProps) {
  const center = size / 2;
  const radius = size * 0.38;

  const pointsData = useMemo(() => {
    if (!components || components.length === 0) return [];
    const count = components.length;

    return components.map((comp, idx) => {
      const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
      const normalizedScore = Math.max(0, Math.min(100, comp.score)) / 100;
      const x = center + radius * normalizedScore * Math.cos(angle);
      const y = center + radius * normalizedScore * Math.sin(angle);

      // Vertex grid boundary point (100% mark)
      const maxX = center + radius * Math.cos(angle);
      const maxY = center + radius * Math.sin(angle);

      // Label anchor position (slightly outside radius)
      const labelRadius = radius + 24;
      const labelX = center + labelRadius * Math.cos(angle);
      const labelY = center + labelRadius * Math.sin(angle);

      return {
        ...comp,
        x,
        y,
        maxX,
        maxY,
        labelX,
        labelY,
        angle,
      };
    });
  }, [components, center, radius]);

  const polygonPath = useMemo(() => {
    if (pointsData.length === 0) return '';
    return pointsData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  }, [pointsData]);

  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Grid Rings */}
        {rings.map((ringScale, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * ringScale}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeDasharray={idx === 3 ? 'none' : '3 3'}
            strokeWidth={1}
          />
        ))}

        {/* Radial Axis Lines */}
        {pointsData.map((p, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.maxX}
            y2={p.maxY}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={1}
          />
        ))}

        {/* Data Radar Polygon */}
        <polygon
          points={polygonPath}
          fill="rgba(245, 158, 11, 0.25)"
          stroke="#F59E0B"
          strokeWidth={2.5}
          className="transition-all duration-500 ease-out"
          style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))' }}
        />

        {/* Vertex Data Points */}
        {pointsData.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={5}
              fill="#F59E0B"
              stroke="#07090E"
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:scale-150"
            />
            {/* Value Tooltip Hover Badge */}
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono text-[10px] font-bold fill-slate-300 group-hover:fill-amber-400 transition-colors"
            >
              {p.name.split(' ')[0]} ({p.score})
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
