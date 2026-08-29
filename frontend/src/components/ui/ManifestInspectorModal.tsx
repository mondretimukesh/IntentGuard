import { useState, useMemo } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface ManifestInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestXml?: string;
  appName?: string;
  packageName?: string;
}

export function ManifestInspectorModal({
  isOpen,
  onClose,
  manifestXml = '',
  appName = 'Target Application',
  packageName = 'com.example.app',
}: ManifestInspectorModalProps) {
  const [activeFile, setActiveFile] = useState<'manifest' | 'strings' | 'network'>('manifest');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleStringsJson = `{
  "package": "${packageName}",
  "suspicious_paths": [
    "com.fraud.overlay.WindowService",
    "com.fraud.accessibility.KeyloggerService",
    "com.spy.sms.SMSReceiver"
  ],
  "hardcoded_urls": [
    "https://c2.threat-actor-domain.com/gate.php",
    "http://185.220.101.5/api/inject"
  ],
  "crypto_ciphers": ["AES/CBC/PKCS5Padding", "DES"]
}`;

  const sampleNetworkConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

  const activeContent = useMemo(() => {
    if (activeFile === 'strings') return sampleStringsJson;
    if (activeFile === 'network') return sampleNetworkConfig;
    return manifestXml;
  }, [activeFile, manifestXml, sampleStringsJson, sampleNetworkConfig]);

  const lines = useMemo(() => activeContent.split('\n'), [activeContent]);

  const filteredLines = useMemo(() => {
    if (!search) return lines.map((text, idx) => ({ lineNum: idx + 1, text }));
    const q = search.toLowerCase();
    return lines
      .map((text, idx) => ({ lineNum: idx + 1, text }))
      .filter((item) => item.text.toLowerCase().includes(q));
  }, [lines, search]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in-up">
      <div className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="px-6 py-3.5 bg-[#0D111D] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <MaterialIcon name="code" className="text-amber-500 text-lg" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-100">
                Decompiled Security Asset Inspector
              </h3>
              <p className="font-mono text-xs text-slate-400">{packageName} • {appName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <MaterialIcon name={copied ? 'check' : 'content_copy'} className="text-sm" />
              {copied ? 'Copied' : 'Copy File'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <MaterialIcon name="close" className="text-xl" />
            </button>
          </div>
        </div>

        {/* Tab Explorer Bar */}
        <div className="px-6 bg-[#090C14] border-b border-white/10 flex items-center justify-between">
          <div className="flex gap-1 pt-2">
            {[
              { id: 'manifest', name: 'AndroidManifest.xml', icon: 'description' },
              { id: 'strings', name: 'classes.dex.strings', icon: 'data_object' },
              { id: 'network', name: 'network_security_config.xml', icon: 'shield' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFile(tab.id as any)}
                className={`px-4 py-2 font-mono text-xs rounded-t-lg border-t border-x flex items-center gap-2 transition-colors ${
                  activeFile === tab.id
                    ? 'bg-[#0B0F19] border-white/10 text-amber-400 font-bold border-b-transparent'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MaterialIcon name={tab.icon} className="text-sm" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Search Bar inside Inspector */}
          <div className="relative py-2 w-64">
            <MaterialIcon
              name="search"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"
            />
            <input
              type="text"
              placeholder="Search code tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#07090E] border border-white/10 rounded-md py-1 pl-8 pr-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Code Content Viewport */}
        <div className="p-4 flex-1 overflow-y-auto font-mono text-xs bg-[#07090E] text-slate-300 space-y-1 terminal-scrollbar">
          {filteredLines.map(({ lineNum, text }) => {
            let color = 'text-slate-400';
            if (text.includes('uses-permission')) color = 'text-red-400 font-semibold';
            else if (text.includes('service') || text.includes('suspicious')) color = 'text-amber-400';
            else if (text.includes('intent-filter') || text.includes('action')) color = 'text-cyan-400';
            else if (text.includes('<manifest') || text.includes('<application')) color = 'text-amber-500 font-bold';

            return (
              <div key={lineNum} className="flex hover:bg-white/[0.04] px-2 py-0.5 rounded transition-colors group">
                <span className="w-12 shrink-0 text-slate-600 select-none group-hover:text-slate-400">
                  {lineNum}
                </span>
                <span className={`whitespace-pre ${color}`}>{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
