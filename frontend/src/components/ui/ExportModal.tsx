import { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import type { AnalysisReport } from '../../types';
import { exportReportPdf } from '../../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AnalysisReport;
}

export function ExportModal({ isOpen, onClose, report }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'json' | 'stix' | 'markdown'>('pdf');

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (selectedFormat === 'pdf') {
        const blob = await exportReportPdf(report.jobId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IntentShield_Report_${report.packageName}_${report.jobId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (selectedFormat === 'json') {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `IntentShield_${report.packageName}.json`;
        a.click();
      } else if (selectedFormat === 'stix') {
        const stixBundle = {
          type: 'bundle',
          id: `bundle--${crypto.randomUUID ? crypto.randomUUID() : '10203040'}`,
          objects: [
            {
              type: 'indicator',
              id: `indicator--${crypto.randomUUID ? crypto.randomUUID() : '50607080'}`,
              name: `Malware Indicator: ${report.appName}`,
              pattern: `[file:hashes.'SHA-256' = '${report.sha256}']`,
              valid_from: new Date().toISOString(),
              confidence: report.riskScore,
            },
          ],
        };
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stixBundle, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `STIX2.1_IntentShield_${report.sha256.slice(0, 8)}.json`;
        a.click();
      } else if (selectedFormat === 'markdown') {
        const mdContent = `# IntentShield Security Analysis Report

- **Application**: ${report.appName} (\`${report.packageName}\`)
- **SHA-256**: \`${report.sha256}\`
- **Risk Score**: ${report.riskScore}/100 (${report.riskLevel.toUpperCase()})
- **Scan Date**: ${report.scanDate}

## 6-Factor Risk Breakdown
${report.riskComponents.map((c) => `- **${c.name}**: ${c.score}/100 (Weight: ${c.weight})`).join('\n')}

## Flagged Evidence
${report.evidence.map((e) => `- **[${e.severity.toUpperCase()}] ${e.title}**: ${e.description}`).join('\n')}

## Recommendations
${report.recommendations.map((r) => `- **${r.title}**: ${r.guidance}`).join('\n')}
`;
        const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(mdContent);
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `IntentShield_Report_${report.packageName}.md`;
        a.click();
      }
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in-up">
      <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <MaterialIcon name="download" className="text-primary text-xl" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-on-surface">Export Security Report</h3>
              <p className="font-mono text-xs text-on-surface-dim">{report.appName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-dim hover:text-on-surface">
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <label className="font-mono text-xs text-on-surface-dim uppercase tracking-wider font-semibold block">
            Select Export Format:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'pdf', title: 'PDF Executive', desc: 'Formatted PDF with risk charts & recommendations', icon: 'picture_as_pdf' },
              { id: 'json', title: 'Structured JSON', desc: 'Complete raw report schema for REST consumption', icon: 'data_object' },
              { id: 'stix', title: 'STIX 2.1 Bundle', desc: 'Cyber Threat Intelligence (CTI) bundle', icon: 'security' },
              { id: 'markdown', title: 'Markdown Doc', desc: 'Clean documentation format for security tickets', icon: 'description' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFormat === fmt.id
                    ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(232,147,90,0.2)]'
                    : 'bg-surface-high border-border-subtle hover:border-border-hover'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MaterialIcon name={fmt.icon} className="text-primary text-base" />
                  <span className="font-heading text-xs font-bold text-on-surface">{fmt.title}</span>
                </div>
                <p className="font-body text-[11px] text-on-surface-dim">{fmt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle">
          <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
          >
            <MaterialIcon name={isExporting ? 'sync' : 'download'} className={`text-base ${isExporting ? 'animate-spin' : ''}`} />
            {isExporting ? 'Generating Export...' : `Download ${selectedFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
