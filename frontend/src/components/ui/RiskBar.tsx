interface RiskBarProps {
  name: string;
  score: number;
  weight: number;
  color: string;
  large?: boolean;
}

export function RiskBar({ name, score, color, large = false }: RiskBarProps) {
  return (
    <div
      className={`glass-card rounded-lg p-4 transition-all duration-200 ${
        large ? 'flex flex-col justify-center min-h-[140px]' : ''
      }`}
      style={{ '--hover-border': `${color}40` } as React.CSSProperties}
    >
      <div className="flex justify-between items-center mb-3">
        <span className={`font-body text-on-surface font-medium ${large ? 'text-base' : 'text-sm'}`}>
          {name}
        </span>
        <span
          className="font-mono font-bold"
          style={{ color, fontSize: large ? '1.25rem' : '0.75rem' }}
        >
          {score}%
        </span>
      </div>
      <div className={`bg-surface-highest rounded-full overflow-hidden ${large ? 'h-3' : 'h-2'}`}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`,
            transition: 'width 1s ease-out',
          }}
        />
      </div>
    </div>
  );
}
