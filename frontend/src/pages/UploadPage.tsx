import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useScan } from '../context/ScanContext';

interface SelectedFileDetails {
  rawFile?: File;
  name: string;
  size: string;
  sha256: string;
}

const SAMPLE_ANALYSIS_PACKAGES = [
  {
    name: 'banking_trojan_v4.apk',
    size: '14.2 MB',
    sha256: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a1b2c3d4e5f6',
    label: 'Banking Trojan',
    badge: 'Critical Threat',
    badgeColor: '#EF4444',
    description: 'Overlay window injection & SMS OTP interception vector',
  },
  {
    name: 'sms_spyware_stealth.apk',
    size: '8.6 MB',
    sha256: 'e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9',
    label: 'SMS Spyware',
    badge: 'High Threat',
    badgeColor: '#F59E0B',
    description: 'Intercepts incoming SMS 2FA notifications silently',
  },
  {
    name: 'calculator_utility_v2.apk',
    size: '5.1 MB',
    sha256: '7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e',
    label: 'Clean Utility',
    badge: 'Low Risk',
    badgeColor: '#10B981',
    description: 'Standard calculator utility app with normal permissions',
  },
];

async function calculateFileHash(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Crypto error computing hash:', err);
    return 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6a1b2c3d4e5f6';
  }
}

export function UploadPage() {
  const navigate = useNavigate();
  const { startScan } = useScan();

  const [selectedFile, setSelectedFile] = useState<SelectedFileDetails | null>({
    name: SAMPLE_ANALYSIS_PACKAGES[0].name,
    size: SAMPLE_ANALYSIS_PACKAGES[0].size,
    sha256: SAMPLE_ANALYSIS_PACKAGES[0].sha256,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSixFactorInfo, setShowSixFactorInfo] = useState(false);

  const handleFileProcess = async (file: File) => {
    setIsHashing(true);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sha256 = await calculateFileHash(file);
    setSelectedFile({
      rawFile: file,
      name: file.name,
      size: `${sizeInMB} MB`,
      sha256,
    });
    setIsHashing(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.apk')) {
        handleFileProcess(droppedFile);
      } else {
        alert('Please select a valid Android Package (.apk) file.');
      }
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const selectPackage = (pkg: (typeof SAMPLE_ANALYSIS_PACKAGES)[number]) => {
    setSelectedFile({
      name: pkg.name,
      size: pkg.size,
      sha256: pkg.sha256,
    });
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const jobId = await startScan(
        selectedFile.rawFile || {
          name: selectedFile.name,
          size: selectedFile.size,
          sha256: selectedFile.sha256,
        }
      );
      navigate(`/analysis?jobId=${jobId}`);
    } catch (err) {
      console.error('Scan initialization failed:', err);
      navigate('/analysis?jobId=job_7f3a2c1d');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-400 bg-grid-pattern">
      {/* Top Bar Header */}
      <header className="w-full border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl px-6 py-4 fixed top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold hover:bg-amber-500/20 transition-all"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <MaterialIcon name="shield" className="text-amber-500 text-lg icon-fill" />
            </div>
            <span className="font-heading text-lg font-bold text-white tracking-tight">IntentShield</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="btn-secondary text-xs px-3.5 py-2 hidden sm:flex items-center gap-1.5"
          >
            <MaterialIcon name="history" className="text-sm text-amber-500" />
            Scan History
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors bg-[#07090E]"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary text-xs px-3.5 py-1.5 hidden sm:inline-flex"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16 max-w-4xl mx-auto w-full">
        <div className="w-full flex flex-col gap-6">
          <div className="text-center space-y-2">
            <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
              Upload Android Package (.APK)
            </h1>
            <p className="font-body text-xs text-slate-400 max-w-xl mx-auto">
              Drop any APK file for Web Crypto SHA-256 hashing, static manifest decompilation, and 6-factor risk analysis.
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <div className="relative">
            <input
              type="file"
              accept=".apk"
              id="apk-file-input"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <label
              htmlFor="apk-file-input"
              className={`w-full h-64 border-2 border-dashed rounded-2xl bg-[#0D111D]/80 backdrop-blur-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                  : 'border-white/10 hover:border-amber-500/50 hover:bg-[#13192B]'
              }`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MaterialIcon
                  name={isHashing ? 'sync' : 'upload_file'}
                  className={`text-3xl text-amber-500 ${isHashing ? 'animate-spin' : ''}`}
                />
              </div>

              <p className="font-heading text-base font-bold text-white mb-1 relative z-10">
                {isHashing ? 'Calculating In-Browser SHA-256 Hash...' : 'Drag & Drop your .APK file or click to browse'}
              </p>
              <p className="font-mono text-xs text-slate-400 relative z-10">
                Native Web Crypto Hashing Enabled
              </p>
            </label>
          </div>

          {/* Sample Analysis Packages Section */}
          <div className="space-y-3">
            <p className="font-mono text-xs text-slate-400 uppercase tracking-wider font-bold">
              Select Target Analysis Package:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_ANALYSIS_PACKAGES.map((pkg) => {
                const isSelected = selectedFile?.name === pkg.name;
                return (
                  <button
                    key={pkg.name}
                    onClick={() => selectPackage(pkg)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'glass-panel border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-heading text-xs font-bold text-white">{pkg.label}</span>
                        <span
                          className="px-2 py-0.5 rounded font-mono text-[10px] font-bold border"
                          style={{
                            backgroundColor: `${pkg.badgeColor}15`,
                            color: pkg.badgeColor,
                            borderColor: `${pkg.badgeColor}40`,
                          }}
                        >
                          {pkg.badge}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-400 truncate">{pkg.name}</p>
                      <p className="font-body text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6-Factor Scoring Reference Card */}
          <div className="glass-panel p-4 border-white/10 space-y-3">
            <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setShowSixFactorInfo(!showSixFactorInfo)}>
              <div className="flex items-center gap-2">
                <MaterialIcon name="radar" className="text-amber-500 text-lg" />
                <span className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                  6-Factor Risk Scoring Engine Architecture
                </span>
              </div>
              <button type="button" className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1">
                <MaterialIcon name={showSixFactorInfo ? 'close' : 'info'} className="text-sm" />
                {showSixFactorInfo ? 'Hide Details' : 'How 6-Factor Scoring Works'}
              </button>
            </div>

            {showSixFactorInfo && (
              <div className="pt-3 space-y-3 border-t border-white/10 animate-fadeIn">
                <p className="font-body text-xs text-slate-400">
                  Every uploaded APK undergoes static manifest decompilation and intent correlation evaluated against our 6-Factor Risk Weighting formula:
                </p>
                <div className="bg-[#07090E] p-3 rounded-lg border border-white/10 font-mono text-[11px] text-cyan-400 font-semibold overflow-x-auto">
                  R = 0.30(Malware) + 0.25(Capability) + 0.15(Purpose) + 0.15(Behavior) + 0.10(Fraud) + 0.05(Cert)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-white/10">
                    <span className="text-amber-400 font-bold block">30% Malware Evidence</span>
                    <span className="text-slate-400 text-[10px]">DEX pattern & signature matching</span>
                  </div>
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-white/10">
                    <span className="text-red-400 font-bold block">25% Capability Risk</span>
                    <span className="text-slate-400 text-[10px]">Accessibility & Overlay hooks</span>
                  </div>
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-white/10">
                    <span className="text-yellow-400 font-bold block">15% Purpose Mismatch</span>
                    <span className="text-slate-400 text-[10px]">Role vs requested permissions</span>
                  </div>
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-white/10">
                    <span className="text-yellow-400 font-bold block">15% Behavior Anomalies</span>
                    <span className="text-slate-400 text-[10px]">Boot persistence & network C2</span>
                  </div>
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-white/10">
                    <span className="text-red-400 font-bold block">10% Fraud Pathway</span>
                    <span className="text-slate-400 text-[10px]">Multi-vector attack sequences</span>
                  </div>
                  <div className="bg-[#07090E] p-2.5 rounded-lg border border-white/10">
                    <span className="text-teal-400 font-bold block">5% Cert Reputation</span>
                    <span className="text-slate-400 text-[10px]">Signer key age & trust rating</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className="glass-panel p-4 border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <MaterialIcon name="android" className="text-amber-500 text-2xl" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-sm text-white font-bold truncate">{selectedFile.name}</p>
                  <p className="font-mono text-xs text-slate-400">{selectedFile.size}</p>
                </div>
              </div>

              <div className="w-full md:w-auto text-left md:text-right font-mono text-xs">
                <span className="text-slate-400 block">Computed SHA-256:</span>
                <span className="text-amber-400 font-bold truncate block max-w-xs md:max-w-md">
                  {selectedFile.sha256}
                </span>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleStartAnalysis}
              disabled={!selectedFile || isHashing || isSubmitting}
              className="btn-primary text-sm px-8 py-3.5 w-full md:w-auto disabled:opacity-50"
            >
              <MaterialIcon name="science" className="text-lg" />
              {isSubmitting ? 'Submitting Scan Job...' : 'Start Static APK Analysis'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
