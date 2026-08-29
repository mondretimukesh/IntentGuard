import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { TopBar } from '../components/layout';
import { RiskGauge } from '../components/ui/RiskGauge';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useScan } from '../context/ScanContext';

const recColors: Record<string, string> = {
  critical: '#F87171',
  warning: '#FBBF24',
  info: '#4FB8A6',
};

export function RecommendationsPage() {
  const navigate = useNavigate();
  const { activeReport } = useScan();
  const report = activeReport;

  if (!report) {
    return (
      <AppLayout>
        <TopBar title="Recommendations & Export" />
        <main className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <MaterialIcon name="document_scanner" className="text-amber-500 text-3xl" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">No Active Analysis Report Selected</h2>
          <p className="font-body text-xs text-slate-400">
            Please run an APK scan or select a completed report from history to view recommendations and export reports.
          </p>
          <button onClick={() => navigate('/scan')} className="btn-primary text-xs px-6 py-2.5">
            Start New APK Scan
          </button>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TopBar title="Recommendations & Export" />

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Status Badge */}
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 text-teal border border-teal/30 mb-3">
            <MaterialIcon name="check_circle" className="text-sm" filled />
            <span className="font-mono text-xs">Analysis Complete</span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-on-surface">Recommendations & Export</h2>
          <p className="text-on-surface-dim mt-1 max-w-2xl font-body text-sm">
            Review critical mitigations based on the identified threat vectors and generate a comprehensive CTI report for distribution.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recommendations */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h3 className="font-heading text-xl font-semibold text-on-surface border-b border-border-subtle pb-2">
              Actionable Guidance
            </h3>
            <div className="flex flex-col gap-3">
              {report.recommendations.map((rec, i) => {
                const color = recColors[rec.severity] || '#64748B';
                return (
                  <div
                    key={rec.id}
                    className="bg-surface-high/50 backdrop-blur-md border border-border-subtle p-5 rounded-xl flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
                    style={{
                      animationDelay: `${i * 70}ms`,
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <div
                      className="p-2.5 rounded-lg flex-shrink-0 mt-0.5 transition-transform duration-200 hover:scale-105"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <MaterialIcon name={rec.icon} className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{rec.title}</h4>
                      <p className="text-on-surface-dim mt-1 font-mono text-xs">{rec.guidance}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-border-subtle">
              <button className="bg-primary text-background font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:shadow-glow-lg hover:brightness-110 transition-all duration-200 group text-sm">
                <MaterialIcon
                  name="download"
                  className="text-lg transition-transform duration-200 group-hover:translate-y-0.5"
                />
                Download PDF Report
              </button>
              <button
                onClick={() => navigate('/scan')}
                className="btn-secondary text-sm"
              >
                <MaterialIcon name="document_scanner" className="text-lg" />
                Scan another APK
              </button>
            </div>
          </div>

          {/* Right Column: Export Overview */}
          <div className="lg:col-span-4">
            <div className="bg-surface/60 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 h-full flex flex-col shadow-glass">
              <h3 className="font-mono text-xs tracking-wider text-on-surface-dim uppercase mb-4 flex items-center justify-between">
                Export Overview
                <MaterialIcon name="summarize" className="text-sm" />
              </h3>

              {/* Gauge */}
              <div className="flex flex-col items-center justify-center py-4 mb-4 border-b border-border-subtle">
                <RiskGauge score={report.riskScore} color="#F87171" size={120} />
                <span className="font-mono text-xs text-severity-critical mt-2 uppercase tracking-wider">
                  High Risk
                </span>
              </div>

              {/* App Identity */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between items-center bg-white/[0.02] p-1.5 rounded">
                  <span className="font-mono text-xs text-on-surface-dim">Package</span>
                  <span className="font-mono text-xs text-on-surface truncate ml-3">{report.packageName}</span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded">
                  <span className="font-mono text-xs text-on-surface-dim">Version</span>
                  <span className="font-mono text-xs text-on-surface">{report.version}</span>
                </div>
                <div className="flex justify-between items-center bg-white/[0.02] p-1.5 rounded">
                  <span className="font-mono text-xs text-on-surface-dim">SHA-256</span>
                  <span className="font-mono text-xs text-primary truncate ml-3">{report.sha256.slice(0, 12)}...</span>
                </div>
              </div>

              {/* Key Findings */}
              <div className="flex-1">
                <h4 className="font-mono text-xs text-on-surface-dim mb-2">Key Findings</h4>
                <ul className="space-y-2">
                  {report.evidence.slice(0, 3).map((ev) => {
                    const evColor = recColors[ev.severity] || recColors.warning;
                    return (
                      <li key={ev.id} className="flex items-start gap-2 text-xs font-mono text-on-surface">
                        <MaterialIcon
                          name={ev.severity === 'critical' ? 'warning' : 'info'}
                          className="text-sm mt-0.5 flex-shrink-0"
                          style={{ color: evColor }}
                        />
                        <span>{ev.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
