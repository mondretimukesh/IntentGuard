import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { TopBar } from '../components/layout';
import { RiskGauge } from '../components/ui/RiskGauge';
import { RiskBar } from '../components/ui/RiskBar';
import { EvidenceCard } from '../components/ui/EvidenceCard';
import { PermissionCard } from '../components/ui/PermissionCard';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { ThreatRadarChart } from '../components/ui/ThreatRadarChart';
import { ManifestInspectorModal } from '../components/ui/ManifestInspectorModal';
import { ExportModal } from '../components/ui/ExportModal';
import { useScan } from '../context/ScanContext';
import type { RiskLevel } from '../types';

const tabs = ['Evidence', 'Permissions', 'Attack Pathway', 'Recommendations'] as const;
type TabKey = (typeof tabs)[number];

export function DashboardPage() {
  const navigate = useNavigate();
  const { activeReport } = useScan();
  const report = activeReport;

  const [activeTab, setActiveTab] = useState<TabKey>('Evidence');
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!report) {
    return (
      <AppLayout>
        <TopBar title="CTI Analysis Dashboard" />
        <main className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <MaterialIcon name="dashboard" className="text-amber-500 text-3xl" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">No Active Analysis Report Selected</h2>
          <p className="font-body text-xs text-slate-400">
            Run a static APK scan or select a completed scan report from your history to view full CTI metrics.
          </p>
          <button onClick={() => navigate('/scan')} className="btn-primary text-xs px-6 py-2.5">
            Start New APK Scan
          </button>
        </main>
      </AppLayout>
    );
  }

  const getRiskColor = (score: number): string => {
    if (score >= 80) return '#EF4444';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#FBBF24';
    return '#10B981';
  };

  const copyHash = () => {
    navigator.clipboard.writeText(report.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Group permissions
  const permGroups = {
    expected: report.permissions.filter((p) => p.category === 'expected'),
    questionable: report.permissions.filter((p) => p.category === 'questionable'),
    unexpected: report.permissions.filter((p) => p.category === 'unexpected'),
  };

  return (
    <AppLayout>
      <TopBar
        title="Security Analysis Dashboard"
        subtitle={`${report.appName} (${report.packageName})`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManifestOpen(true)}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <MaterialIcon name="code" className="text-base text-amber-500" />
              Inspect Manifest
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <MaterialIcon name="download" className="text-base" />
              Export Report
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Row: App Identity, Risk Gauge & Threat Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="glass-panel p-5 flex flex-col justify-between border-amber-500/30">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/30 shrink-0">
                <MaterialIcon name="android" className="text-amber-500 text-3xl" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-xl font-bold text-white truncate">{report.appName}</h3>
                <p className="font-mono text-xs text-slate-400 truncate mt-0.5">{report.packageName}</p>
                <span className="inline-block mt-2 font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                  Size: {report.fileSize} • Scan: {report.scanDate.slice(0, 10)}
                </span>
              </div>
            </div>

            <div className="mt-4 bg-[#07090E] p-3 rounded-lg border border-white/10 flex justify-between items-center">
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-slate-500 uppercase font-bold">SHA-256 Hash</p>
                <p className="font-mono text-xs text-cyan-400 truncate w-44 md:w-56">{report.sha256}</p>
              </div>
              <button
                onClick={copyHash}
                className="text-slate-400 hover:text-amber-400 transition-colors shrink-0 p-1"
                title="Copy Hash"
              >
                <MaterialIcon name={copiedHash ? 'check' : 'content_copy'} className="text-base" />
              </button>
            </div>
          </div>

          {/* Risk Gauge & Radar Combined Panel */}
          <div className="glass-panel p-5 col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-amber-500/30">
            {/* Gauge Column */}
            <div className="flex items-center gap-4">
              <RiskGauge score={report.riskScore} color={getRiskColor(report.riskScore)} size={120} />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xl font-bold text-white">
                    {report.riskScore >= 80 ? 'Critical Threat' : report.riskScore >= 60 ? 'High Risk' : 'Review Required'}
                  </h3>
                  <SeverityBadge level={report.riskLevel as RiskLevel} score={report.riskScore} />
                </div>
                <p className="font-body text-xs text-slate-400 leading-relaxed">
                  {report.riskClassification ||
                    'Static manifest decompilation detected overlay window injection and SMS interception hooks.'}
                </p>
                <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  6-Factor Formula Score Applied
                </span>
              </div>
            </div>

            {/* Radar Chart Column */}
            <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                6-Factor Threat Radar Matrix
              </span>
              <ThreatRadarChart components={report.riskComponents} size={200} />
            </div>
          </div>
        </div>

        {/* 6-Factor Weighted Risk Components Grid */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
              6-Factor Weighted Risk Components (Fixed Formula)
            </h4>
            <span className="font-mono text-xs text-slate-400">Total Formula Weight: 1.00 (100%)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.riskComponents.map((comp) => (
              <RiskBar key={comp.id} {...comp} />
            ))}
          </div>
        </div>

        {/* Interactive Tabbed Detail Section */}
        <div className="glass-panel overflow-hidden border-white/10">
          {/* Tab Headers */}
          <div className="border-b border-white/10 bg-[#090C14] flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 font-heading text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-amber-400 font-bold border-b-2 border-amber-400 bg-amber-500/5'
                    : 'text-slate-400 font-semibold hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Body */}
          <div className="p-6 bg-[#07090E]/60">
            {activeTab === 'Evidence' && (
              <div className="space-y-3">
                {report.evidence.map((ev) => (
                  <EvidenceCard key={ev.id} evidence={ev} />
                ))}
              </div>
            )}

            {activeTab === 'Permissions' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PermissionCard category="expected" permissions={permGroups.expected} />
                <PermissionCard category="questionable" permissions={permGroups.questionable} />
                <PermissionCard category="unexpected" permissions={permGroups.unexpected} />
              </div>
            )}

            {activeTab === 'Attack Pathway' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white mb-1">
                    {report.attackPathway.title}
                  </h3>
                  <p className="font-body text-xs text-slate-400 leading-relaxed">
                    {report.attackPathway.summary}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                  {report.attackPathway.steps.map((step, i) => {
                    const stepColors: Record<string, string> = {
                      critical: '#EF4444',
                      high: '#F59E0B',
                      medium: '#FBBF24',
                      low: '#10B981',
                    };
                    const color = stepColors[step.severity] || '#64748B';
                    return (
                      <div key={step.id} className="contents">
                        <div
                          className="flex-1 bg-[#090C14] rounded-xl p-4 border border-white/10 hover:-translate-y-0.5 transition-all"
                          style={{ borderLeft: `3px solid ${color}` }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}
                            >
                              <MaterialIcon name={step.icon} className="text-lg" style={{ color }} />
                            </div>
                            <span className="font-mono text-xs font-bold text-white">{step.label}</span>
                          </div>
                          <p className="font-body text-xs text-slate-400 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        {i < report.attackPathway.steps.length - 1 && (
                          <div className="hidden md:flex items-center justify-center">
                            <MaterialIcon name="arrow_forward" className="text-slate-600 text-lg" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'Recommendations' && (
              <div className="space-y-3">
                {report.recommendations.map((rec) => {
                  const recColors: Record<string, string> = {
                    critical: '#EF4444',
                    warning: '#FBBF24',
                    info: '#06B6D4',
                  };
                  const color = recColors[rec.severity] || '#64748B';
                  return (
                    <div
                      key={rec.id}
                      className="bg-[#090C14] border border-white/10 p-4 rounded-xl flex items-start gap-4 hover:-translate-y-0.5 transition-all"
                      style={{ borderLeft: `3px solid ${color}` }}
                    >
                      <div
                        className="p-2.5 rounded-lg shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <MaterialIcon name={rec.icon} className="text-lg" />
                      </div>
                      <div>
                        <h4 className="font-heading text-sm font-bold text-white">{rec.title}</h4>
                        <p className="font-body text-xs text-slate-400 mt-1 leading-relaxed">
                          {rec.guidance}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manifest Code Inspector Modal */}
      <ManifestInspectorModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        manifestXml={report.manifestXml}
        appName={report.appName}
        packageName={report.packageName}
      />

      {/* Report Export Studio Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} report={report} />
    </AppLayout>
  );
}
