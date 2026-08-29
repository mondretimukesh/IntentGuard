import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  score: number;
  color: string;
  size?: number;
  label?: string;
}

const circumference = 2 * Math.PI * 40;

export function RiskGauge({ score, color, size = 128, label }: RiskGaugeProps) {
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const target = circumference - (score / 100) * circumference;
    const timer = setTimeout(() => setAnimatedOffset(target), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        {/* Background track */}
        <circle
          cx="50" cy="50" fill="none" r="40"
          stroke="#2F3645"
          strokeWidth="8"
        />
        {/* Active track */}
        <circle
          cx="50" cy="50" fill="none" r="40"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{
            transition: 'stroke-dashoffset 0.8s ease-out',
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span
          className="font-mono text-3xl font-bold leading-none"
          style={{ color }}
        >
          {score}
        </span>
        {label && (
          <span className="font-mono text-xs text-on-surface-dim mt-1 tracking-wide">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
