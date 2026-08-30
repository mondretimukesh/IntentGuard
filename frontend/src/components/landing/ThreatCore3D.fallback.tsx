import React, { useState } from 'react';
import { RiskGauge } from '../ui/RiskGauge';
import { ThreatTelemetry } from './ThreatTelemetry';
import { MaterialIcon } from '../ui/MaterialIcon';

export interface ThreatFactor {
  id: string;
  name: string;
  weight: string;
  weightVal: number;
  icon: string;
  desc: string;
}

export const RISK_FACTORS: ThreatFactor[] = [
  {
    id: 'malware',
    name: 'Malware Evidence',
    weight: '30%',
    weightVal: 30,
    icon: 'shield_lock',
    desc: 'Detection of known malware signatures, DEX byte patterns, and C2 payload heuristics.',
  },
  {
    id: 'capability',
    name: 'Capability Risk',
    weight: '25%',
    weightVal: 25,
    icon: 'accessibility_new',
    desc: 'High-risk permissions such as Accessibility Services, System Overlays, and Notification Listeners.',
  },
  {
    id: 'purpose',
    name: 'Purpose Mismatch',
    weight: '15%',
    weightVal: 15,
    icon: 'warning',
    desc: 'Discrepancy between declared app functionality and requested capabilities.',
  },
  {
    id: 'behavioral',
    name: 'Behavioral Anomalies',
    weight: '15%',
    weightVal: 15,
    icon: 'terminal',
    desc: 'Unusual runtime artifacts including BOOT_COMPLETED auto-restart and dynamic loading.',
  },
  {
    id: 'fraud',
    name: 'Fraud Pathway',
    weight: '10%',
    weightVal: 10,
    icon: 'layers',
    desc: 'Combined attack chains where overlays capture credentials and SMS interception steals 2FA.',
  },
  {
    id: 'cert',
    name: 'Certificate Reputation',
    weight: '5%',
    weightVal: 5,
    icon: 'check_circle',
    desc: 'Verification of APK signing certificate longevity, issuer trust, and developer key reputation.',
  },
];

interface ThreatCoreFallbackProps {
  score?: number;
  packageName?: string;
  appTitle?: string;
}

export const ThreatCoreFallback: React.FC<ThreatCoreFallbackProps> = ({
  score = 85,
  packageName = 'com.bank.overlay.trojan',
  appTitle = 'Banking Trojan Overlay',
}) => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const leftNodes = RISK_FACTORS.slice(0, 3);
  const rightNodes = RISK_FACTORS.slice(3, 6);

  return (
    <div
      aria-label={`Threat Analysis Visualization: Risk score ${score}, 6 risk factors evaluated`}
      className="relative w-full max-w-[540px] mx-auto rounded-2xl border border-white/10 bg-[#0A0C14]/90 backdrop-blur-xl p-5 shadow-2xl overflow-hidden group"
    >
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#E8935A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info Bar */}
      <div className="relative z-10 flex justify-between items-center pb-3 mb-4 border-b border-white/10">
        <div className="min-w-0 pr-2">
          <span className="font-mono text-[11px] text-slate-400 block truncate">{packageName}</span>
          <span className="font-heading text-sm font-bold text-white tracking-tight">{appTitle}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8935A]/10 border border-[#E8935A]/30 text-[#E8935A] font-mono text-xs font-bold shrink-0">
          <MaterialIcon name="warning" className="text-sm" />
          <span>RISK {score}</span>
        </div>
      </div>

      {/* Main Threat Core & Surrounding Nodes Layout */}
      <div className="relative z-10 my-4">
        {/* Desktop Layout: Left 3 Nodes | Central Core | Right 3 Nodes */}
        <div className="hidden md:grid grid-cols-12 gap-3 items-center">
          {/* Left Column: 3 Nodes */}
          <div className="col-span-4 space-y-3">
            {leftNodes.map((factor) => {
              const isActive = activeNode === factor.id;
              return (
                <button
                  key={factor.id}
                  onMouseEnter={() => setActiveNode(factor.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(factor.id)}
                  onBlur={() => setActiveNode(null)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-300 relative group/node ${
                    isActive
                      ? 'bg-[#E8935A]/15 border-[#E8935A] shadow-[0_0_15px_rgba(232,147,90,0.25)] translate-x-1'
                      : 'bg-surface-low/80 border-white/10 hover:border-[#E8935A]/50 hover:bg-surface/80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <MaterialIcon
                        name={factor.icon}
                        className={`text-base shrink-0 transition-colors ${
                          isActive ? 'text-[#E8935A]' : 'text-slate-400 group-hover/node:text-[#E8935A]'
                        }`}
                      />
                      <span className="font-heading text-xs font-semibold text-slate-200 truncate">
                        {factor.name}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#E8935A] bg-[#E8935A]/10 px-1.5 py-0.5 rounded border border-[#E8935A]/20 shrink-0">
                      {factor.weight}
                    </span>
                  </div>

                  {/* Node Hover Tooltip */}
                  {isActive && (
                    <div className="absolute left-0 right-0 -bottom-10 z-30 p-2 bg-[#07090E] rounded-lg border border-[#E8935A]/40 text-[10px] font-mono text-slate-300 shadow-xl pointer-events-none">
                      <span className="text-[#E8935A] font-bold">{factor.name} — {factor.weight}</span>: {factor.desc}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Central APK Core */}
          <div className="col-span-4 flex flex-col items-center justify-center relative py-2">
            <div className="relative p-3 rounded-full bg-surface-low/60 border border-[#E8935A]/30 shadow-[0_0_25px_rgba(232,147,90,0.15)] flex flex-col items-center">
              <RiskGauge score={score} color="#E8935A" size={140} label="APK CORE" />
              <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-[#E8935A]/90">
                <MaterialIcon name="radar" className="text-xs animate-spin" />
                <span>6-FACTOR ENGINE</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Nodes */}
          <div className="col-span-4 space-y-3">
            {rightNodes.map((factor) => {
              const isActive = activeNode === factor.id;
              return (
                <button
                  key={factor.id}
                  onMouseEnter={() => setActiveNode(factor.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(factor.id)}
                  onBlur={() => setActiveNode(null)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-300 relative group/node ${
                    isActive
                      ? 'bg-[#E8935A]/15 border-[#E8935A] shadow-[0_0_15px_rgba(232,147,90,0.25)] -translate-x-1'
                      : 'bg-surface-low/80 border-white/10 hover:border-[#E8935A]/50 hover:bg-surface/80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <MaterialIcon
                        name={factor.icon}
                        className={`text-base shrink-0 transition-colors ${
                          isActive ? 'text-[#E8935A]' : 'text-slate-400 group-hover/node:text-[#E8935A]'
                        }`}
                      />
                      <span className="font-heading text-xs font-semibold text-slate-200 truncate">
                        {factor.name}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#E8935A] bg-[#E8935A]/10 px-1.5 py-0.5 rounded border border-[#E8935A]/20 shrink-0">
                      {factor.weight}
                    </span>
                  </div>

                  {/* Node Hover Tooltip */}
                  {isActive && (
                    <div className="absolute left-0 right-0 -bottom-10 z-30 p-2 bg-[#07090E] rounded-lg border border-[#E8935A]/40 text-[10px] font-mono text-slate-300 shadow-xl pointer-events-none">
                      <span className="text-[#E8935A] font-bold">{factor.name} — {factor.weight}</span>: {factor.desc}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile / Tablet Compact Stack Layout */}
        <div className="md:hidden flex flex-col items-center space-y-4">
          <div className="p-3 rounded-full bg-surface-low/60 border border-[#E8935A]/30 shadow-[0_0_20px_rgba(232,147,90,0.15)] flex flex-col items-center">
            <RiskGauge score={score} color="#E8935A" size={130} label="APK CORE" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            {RISK_FACTORS.map((factor) => {
              const isActive = activeNode === factor.id;
              return (
                <button
                  key={factor.id}
                  onMouseEnter={() => setActiveNode(factor.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(factor.id)}
                  onBlur={() => setActiveNode(null)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-[#E8935A]/15 border-[#E8935A] shadow-glow'
                      : 'bg-surface-low/80 border-white/10 hover:border-[#E8935A]/40'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name={factor.icon} className="text-base text-[#E8935A]" />
                      <span className="font-heading text-xs font-semibold text-slate-200">{factor.name}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#E8935A]">{factor.weight}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Telemetry HUD Bottom Overlay */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/10">
        <ThreatTelemetry />
      </div>
    </div>
  );
};
