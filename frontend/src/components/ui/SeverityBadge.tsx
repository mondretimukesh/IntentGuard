import type { RiskLevel } from '../../types';

const severityConfig: Record<RiskLevel, { bg: string; text: string; border: string; dot?: boolean }> = {
  critical: { bg: 'bg-severity-critical/10', text: 'text-severity-critical', border: 'border-severity-critical/30', dot: true },
  high: { bg: 'bg-severity-high/10', text: 'text-severity-high', border: 'border-severity-high/30', dot: true },
  review: { bg: 'bg-severity-review/10', text: 'text-severity-review', border: 'border-severity-review/30', dot: true },
  low: { bg: 'bg-severity-low/10', text: 'text-severity-low', border: 'border-severity-low/30', dot: true },
  insufficient: { bg: 'bg-severity-insufficient/10', text: 'text-severity-insufficient', border: 'border-severity-insufficient/30' },
};

const levelLabels: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High Risk',
  review: 'Review Required',
  low: 'Low Risk',
  insufficient: 'Insufficient Evidence',
};

interface SeverityBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

export function SeverityBadge({ level, score, className = '' }: SeverityBadgeProps) {
  const config = severityConfig[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${level === 'critical' ? 'animate-pulse' : ''}`} />
      )}
      {score !== undefined && <span className="font-semibold">{score}</span>}
      <span>{levelLabels[level]}</span>
    </span>
  );
}
