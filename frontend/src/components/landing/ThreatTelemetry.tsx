import React from 'react';

export interface TelemetryItem {
  label: string;
  value: string;
  status?: 'active' | 'warning' | 'normal';
}

const defaultTelemetry: TelemetryItem[] = [
  { label: 'MANIFEST', value: 'ANALYZED', status: 'normal' },
  { label: 'PERMISSIONS', value: '23 FOUND', status: 'normal' },
  { label: 'BEHAVIOR', value: '7 ANOMALIES', status: 'warning' },
  { label: 'CTI CORRELATION', value: '4 MATCHES', status: 'warning' },
  { label: 'RISK ENGINE', value: 'ACTIVE', status: 'active' },
];

interface ThreatTelemetryProps {
  items?: TelemetryItem[];
  className?: string;
}

export const ThreatTelemetry: React.FC<ThreatTelemetryProps> = ({
  items = defaultTelemetry,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-[#07090E]/90 rounded-xl border border-white/10 backdrop-blur-md font-mono text-[11px] ${className}`}
    >
      {items.map((item) => {
        let statusDot = 'bg-slate-400';
        let valColor = 'text-slate-200';
        
        if (item.status === 'active') {
          statusDot = 'bg-amber-400 animate-pulse';
          valColor = 'text-amber-400 font-bold';
        } else if (item.status === 'warning') {
          statusDot = 'bg-amber-500';
          valColor = 'text-amber-300';
        }

        return (
          <div
            key={item.label}
            className="flex flex-col justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/5"
          >
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold truncate">
              {item.label}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              <span className={`tracking-tight ${valColor}`}>{item.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
