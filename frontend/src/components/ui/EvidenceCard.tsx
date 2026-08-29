import type { Evidence, EvidenceSeverity } from '../../types';
import { MaterialIcon } from './MaterialIcon';

const severityStyles: Record<EvidenceSeverity, { color: string; bg: string; border: string; glow: string }> = {
  critical: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: '#F87171', glow: '0 0 15px rgba(248,113,113,0.2)' },
  high: { color: '#FB923C', bg: 'rgba(251,146,60,0.1)', border: '#FB923C', glow: '0 0 15px rgba(251,146,60,0.2)' },
  medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: '#FBBF24', glow: '0 0 15px rgba(251,191,36,0.2)' },
  low: { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', border: '#4ADE80', glow: '0 0 15px rgba(74,222,128,0.2)' },
};

const severityLabels: Record<EvidenceSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

interface EvidenceCardProps {
  evidence: Evidence;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const style = severityStyles[evidence.severity];
  return (
    <div
      className="bg-surface rounded-lg p-4 border-t border-r border-b border-border-subtle flex justify-between items-center hover:bg-surface-high transition-all duration-200"
      style={{ borderLeft: `2px solid ${style.border}` }}
    >
      <div className="flex items-center gap-3">
        <MaterialIcon
          name={evidence.icon}
          className="text-lg transition-transform hover:scale-105"
          style={{ color: style.color }}
        />
        <div className="min-w-0">
          <span className="font-body text-sm text-on-surface font-medium block">{evidence.title}</span>
          <span className="font-mono text-xs text-on-surface-dim block mt-0.5">{evidence.description}</span>
        </div>
      </div>
      <span
        className="px-2.5 py-1 rounded-full font-mono text-xs border whitespace-nowrap ml-3 flex-shrink-0"
        style={{
          backgroundColor: style.bg,
          color: style.color,
          borderColor: `${style.color}40`,
          boxShadow: style.glow,
        }}
      >
        {severityLabels[evidence.severity]}
      </span>
    </div>
  );
}
