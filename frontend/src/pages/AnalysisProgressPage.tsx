import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { TopBar } from '../components/layout';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useScan } from '../context/ScanContext';
import type { AnalysisJobStatus } from '../types';

interface StepDef {
  code: AnalysisJobStatus;
  label: string;
  desc: string;
}

const PIPELINE_STEPS_MAP: StepDef[] = [
  { code: 'queued', label: '1. Queue Allocation', desc: 'Job initialized in high-priority CTI queue' },
  { code: 'validating', label: '2. APK Unpacking & Validation', desc: 'ZIP integrity verified, AndroidManifest extracted' },
  { code: 'static_analysis', label: '3. Static Bytecode Parsing', desc: '124 DEX classes extracted, intent filters parsed' },
  { code: 'purpose_matching', label: '4. Purpose vs Permission Correlation', desc: 'Matching declared category against requested permissions' },
  { code: 'transparency_eval', label: '5. Transparency & C2 Telemetry', desc: 'Evaluating privacy disclosures against network endpoints' },
  { code: 'ml_classification', label: '6. Malware ML Model Inference', desc: 'Bytecode graph classification for trojan signatures' },
  { code: 'threat_intel', label: '7. Threat Intel Enrichment', desc: 'Enriching hash against CTI feeds & VirusTotal signatures' },
  { code: 'risk_scoring', label: '8. 6-Factor Contextual Risk Engine', desc: 'Applying R = 0.30(Malware) + 0.25(Capability) formula' },
];

export function AnalysisProgressPage() {
  const navigate = useNavigate();
  const { activeJobId, activeJobStatus } = useScan();

  const currentStatus = activeJobStatus?.status || 'queued';
  const logs = activeJobStatus?.logs || [];
  const timeRemaining = activeJobStatus?.estimatedTimeRemaining ?? 12;

  useEffect(() => {
    if (currentStatus === 'complete') {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, navigate]);

  const getStepState = (stepCode: AnalysisJobStatus) => {
    const stepCodes = PIPELINE_STEPS_MAP.map((s) => s.code);
    const currentIndex = stepCodes.indexOf(currentStatus as AnalysisJobStatus);
    const targetIndex = stepCodes.indexOf(stepCode);

    if (currentStatus === 'complete' || targetIndex < currentIndex) {
      return 'completed';
    }
    if (targetIndex === currentIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <AppLayout>
      <TopBar
        title="Analysis Progress"
        subtitle={activeJobId ? `Job ID: ${activeJobId}` : 'Running Analysis Pipeline'}
        actions={
          <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
            <MaterialIcon name="timer" className="text-amber-500 text-sm" />
            Est. Remaining: <span className="text-amber-400 font-bold">{timeRemaining}s</span>
          </div>
        }
      />

      <div className="flex-grow p-6 flex flex-col lg:flex-row gap-6 items-stretch justify-center max-w-7xl mx-auto w-full relative mt-2">
        {/* Left Column: Pipeline Stepper */}
        <div className="glass-panel p-6 flex-1 max-w-md flex flex-col relative border-amber-500/30">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <MaterialIcon name="memory" className="text-amber-500 text-xl" />
              Pipeline Execution
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 font-mono text-[10px] text-amber-400 font-bold uppercase">
              {currentStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="relative flex-grow flex flex-col space-y-4">
            {PIPELINE_STEPS_MAP.map((step, i) => {
              const state = getStepState(step.code);
              return (
                <div key={step.code} className="flex gap-3.5 relative">
                  {/* Vertical connector line */}
                  {i < PIPELINE_STEPS_MAP.length - 1 && (
                    <div
                      className="absolute left-3.5 top-7 bottom-0 w-0.5"
                      style={{
                        backgroundColor: state === 'completed' ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                      }}
                    />
                  )}

                  {/* Node icon */}
                  <div
                    className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor:
                        state === 'completed'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : state === 'active'
                          ? 'rgba(245, 158, 11, 0.25)'
                          : '#07090E',
                      border: `1.5px solid ${state === 'pending' ? 'rgba(255, 255, 255, 0.15)' : '#F59E0B'}`,
                      boxShadow: state === 'active' ? '0 0 12px rgba(245, 158, 11, 0.5)' : undefined,
                    }}
                  >
                    {state === 'completed' && (
                      <MaterialIcon name="check" className="text-xs text-amber-500 icon-fill font-bold" />
                    )}
                    {state === 'active' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
                    {state === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  </div>

                  {/* Details */}
                  <div>
                    <p
                      className={`font-heading text-xs font-bold ${
                        state === 'active' ? 'text-amber-400' : state === 'pending' ? 'text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`font-mono text-[11px] mt-0.5 ${
                        state === 'active' ? 'text-amber-400/80' : 'text-slate-400'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Hacker Terminal Console */}
        <div className="glass-panel flex-1 max-w-2xl flex flex-col overflow-hidden border-white/10 shadow-2xl min-h-[480px]">
          {/* Header */}
          <div className="bg-[#090C14] px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MaterialIcon name="terminal" className="text-amber-500 text-base" />
              <span className="font-mono text-xs text-slate-200 font-bold">analysis_engine.log</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400">STREAMING</span>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 flex-grow overflow-y-auto terminal-scrollbar terminal-scanline bg-[#07090E] font-mono text-xs space-y-2">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">Initializing stream listeners...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                  <span
                    className="font-bold shrink-0"
                    style={{ color: log.color || (log.level === 'ERROR' ? '#EF4444' : '#06B6D4') }}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
            <div className="flex items-center gap-2 pt-2 text-amber-500">
              <span className="w-2 h-4 bg-amber-500 animate-pulse inline-block" />
              <span className="text-slate-500 italic">Processing pipeline step...</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
