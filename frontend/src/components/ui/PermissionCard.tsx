import type { Permission, PermissionCategory } from '../../types';
import { MaterialIcon } from './MaterialIcon';

const categoryConfig: Record<PermissionCategory, { icon: string; color: string; bg: string; border: string; label: string; countBg: string }> = {
  expected: {
    icon: 'verified_user',
    color: '#4FB8A6',
    bg: 'rgba(79,184,166,0.05)',
    border: 'rgba(79,184,166,0.3)',
    label: 'Expected',
    countBg: 'rgba(79,184,166,0.15)',
  },
  questionable: {
    icon: 'warning',
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.05)',
    border: 'rgba(251,191,36,0.3)',
    label: 'Questionable',
    countBg: 'rgba(251,191,36,0.15)',
  },
  unexpected: {
    icon: 'dangerous',
    color: '#F87171',
    bg: 'rgba(248,113,113,0.05)',
    border: 'rgba(248,113,113,0.4)',
    label: 'Unexpected / High Risk',
    countBg: 'rgba(248,113,113,0.15)',
  },
};

interface PermissionCardProps {
  category: PermissionCategory;
  permissions: Permission[];
}

export function PermissionCard({ category, permissions }: PermissionCardProps) {
  const config = categoryConfig[category];
  const hasUnexpected = category === 'unexpected';
  return (
    <div
      className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-all duration-300"
      style={{
        borderLeft: hasUnexpected ? `4px solid ${config.color}` : `1px solid ${config.border}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
        <MaterialIcon name={config.icon} className="text-lg" style={{ color: config.color }} />
        <span className="font-body text-on-surface font-medium text-sm">{config.label}</span>
        <span
          className="ml-auto font-mono text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: config.countBg, color: config.color }}
        >
          {permissions.length} Found
        </span>
      </div>
      <div className="flex flex-col gap-1 mt-1">
        {permissions.map((perm) => (
          <div
            key={perm.name}
            className="p-2 rounded-lg bg-surface-high border border-transparent hover:border-border-subtle transition-colors"
            style={hasUnexpected ? { borderColor: `${config.color}30`, backgroundColor: `${config.color}08` } : undefined}
          >
            <span className="font-mono text-xs block" style={{ color: config.color }}>
              {perm.name}
            </span>
            <span className="text-on-surface-dim text-xs mt-1 block">{perm.justification}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
