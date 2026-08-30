import React from 'react';
import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { ThreatCore3D } from '../components/landing/ThreatCore3D';

const threatCards = [
  { icon: 'accessibility_new', title: 'Accessibility Service Abuse', desc: 'Allows silent interaction with banking and auth dialogs without user consent.' },
  { icon: 'layers', title: 'System Overlay Injections', desc: 'Draws deceptive fake login screens over legitimate financial applications.' },
  { icon: 'chat', title: 'SMS OTP Interception', desc: 'Reads incoming SMS messages to steal 2FA verification codes in real-time.' },
  { icon: 'notifications_active', title: 'Notification Listener', desc: 'Extracts push-notification OTPs and authenticator alerts before display.' },
];

const attackChain = [
  { icon: 'layers', label: '1. Overlay Target', color: '#F59E0B' },
  { icon: 'chat', label: '2. SMS Listener', color: '#F59E0B' },
  { icon: 'accessibility_new', label: '3. Accessibility Keylogger', color: '#EF4444' },
  { icon: 'warning', label: '4. Fraud Execution', color: '#EF4444' },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Native SHA-256 Hash Generation',
    desc: 'Uses Web Crypto API to hash the APK directly in the browser before static analysis or network transmission.',
    icon: 'key',
  },
  {
    step: '02',
    title: 'Manifest & DEX Parsing',
    desc: 'Decompiles AndroidManifest.xml and classes.dex to extract permissions, intent filters, services, and receiver hooks.',
    icon: 'code',
  },
  {
    step: '03',
    title: 'Intent-Permission Correlation',
    desc: 'Cross-checks declared permissions against the app category to identify stealthy overlay and accessibility vectors.',
    icon: 'tune',
  },
  {
    step: '04',
    title: '6-Factor Risk Score Calculation',
    desc: 'Computes a 0–100 contextual risk score using weighted multi-vector risk models and threat intelligence heuristics.',
    icon: 'radar',
  },
];

const sixFactors = [
  {
    name: 'Malware Evidence',
    weight: '30%',
    icon: 'shield_lock',
    color: '#E8935A',
    desc: 'Detection of known malware signatures, DEX byte patterns, and C2 payload heuristics.',
  },
  {
    name: 'Capability Risk',
    weight: '25%',
    icon: 'accessibility_new',
    color: '#F87171',
    desc: 'High-risk permissions such as Accessibility Services, System Overlays, and Notification Listeners.',
  },
  {
    name: 'Purpose Mismatch',
    weight: '15%',
    icon: 'warning',
    color: '#FBBF24',
    desc: 'Discrepancy between the app declared functionality (e.g. calculator) and requested permissions.',
  },
  {
    name: 'Behavioral Anomalies',
    weight: '15%',
    icon: 'terminal',
    color: '#FBBF24',
    desc: 'Unusual runtime artifacts including BOOT_COMPLETED auto-restart, hardcoded IPs, and dynamic loading.',
  },
  {
    name: 'Fraud Pathway',
    weight: '10%',
    icon: 'layers',
    color: '#F87171',
    desc: 'Combined attack chains where overlays capture credentials and SMS interception steals 2FA OTPs.',
  },
  {
    name: 'Certificate Reputation',
    weight: '5%',
    icon: 'check_circle',
    color: '#4FB8A6',
    desc: 'Verification of APK signing certificate longevity, issuer trust rating, and developer key reputation.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-400">
      {/* Top Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#07090E]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <MaterialIcon name="shield" className="text-amber-500 text-xl icon-fill" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white">IntentShield</span>
            </Link>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 font-mono text-[10px] text-amber-400 font-bold uppercase hidden sm:inline-block">
              CTI v1.4
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-7 font-mono text-xs text-slate-300">
            <a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-1 font-bold text-amber-400">
              <MaterialIcon name="shield" className="text-sm icon-fill" />
              Home
            </a>
            <a href="#problem" className="hover:text-amber-400 transition-colors">Threat Vector</a>
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">How It Works & 6-Factor Scoring</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg border border-white/10 font-mono text-xs text-slate-200 hover:text-amber-400 hover:border-amber-500/40 transition-colors bg-[#07090E]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn-primary font-mono text-xs px-3.5 py-1.5 hidden sm:inline-flex"
            >
              Sign Up
            </Link>
            <Link
              to="/scan"
              className="btn-primary text-xs px-4 py-1.5 shadow-glow"
            >
              Launch Workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-grid-pattern">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-purple-500/10 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center relative z-10 py-12">
            {/* Left Hero Text */}
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Analyst-Grade Static APK Analysis
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
                Expose hidden app intent <span className="text-gradient-gold">before execution</span>.
              </h1>

              <p className="font-body text-base text-slate-400 max-w-xl leading-relaxed">
                IntentShield performs deep static APK manifest decompilation, intent correlation, and 6-factor risk scoring to uncover dangerous capabilities and fraud pathways.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/scan" className="btn-primary text-sm px-7 py-3.5">
                  <MaterialIcon name="document_scanner" className="text-lg" />
                  Analyze an APK
                </Link>
                <a href="#how-it-works" className="btn-secondary text-sm px-6 py-3.5">
                  <MaterialIcon name="radar" className="text-lg" />
                  How It Works & 6-Factor Scoring
                </a>
              </div>
            </div>

            {/* Right Hero Threat Core Visual Card */}
            <div className="relative flex justify-center items-center w-full">
              <ThreatCore3D score={85} />
            </div>
          </div>
        </section>

        {/* Threat Grid Section */}
        <section className="py-20 bg-[#0A0D16] border-y border-white/10" id="problem">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14 max-w-3xl mx-auto space-y-3">
              <h2 className="font-heading text-3xl font-extrabold text-white">The Fraud Kill-Chain Vector</h2>
              <p className="font-body text-sm text-slate-400">
                Sophisticated Android malware combines seemingly benign permissions into dangerous attack chains.
              </p>
            </div>

            {/* Threat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {threatCards.map((card) => (
                <div
                  key={card.title}
                  className="glass-panel p-6 hover:border-amber-500/40 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MaterialIcon name={card.icon} className="text-amber-500 text-2xl" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="font-body text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Attack Chain Flow */}
            <div className="glass-panel p-6 border-white/10 relative overflow-hidden">
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-bold block mb-6">
                Targeted Attack Sequence
              </span>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {attackChain.map((step, i) => (
                  <div key={step.label} className="contents">
                    <div className="flex flex-col items-center text-center p-3 w-full md:w-1/4 bg-[#07090E] rounded-xl border border-white/10">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}40` }}
                      >
                        <MaterialIcon name={step.icon} className="text-xl" style={{ color: step.color }} />
                      </div>
                      <span className="font-mono text-xs text-slate-200 font-bold">{step.label}</span>
                    </div>
                    {i < attackChain.length - 1 && (
                      <MaterialIcon name="arrow_forward" className="hidden md:block text-slate-500 text-xl" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works & 6-Factor Scoring Section */}
        <section className="py-20 bg-[#07090E] border-b border-white/10" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 font-mono text-xs text-amber-400 font-bold uppercase">
                <MaterialIcon name="science" className="text-sm" />
                Analysis Pipeline & Scoring Architecture
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white">
                How It Works & 6-Factor Scoring
              </h2>
              <p className="font-body text-sm text-slate-400 leading-relaxed">
                Our analyst-grade CTI engine decomposes APK binaries in real-time through a 4-step static pipeline evaluated against a 6-Factor Risk Weighting formula.
              </p>
            </div>

            {/* 4-Step Pipeline Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorksSteps.map((step) => (
                <div key={step.step} className="glass-panel p-6 flex flex-col justify-between border-white/10 relative group hover:border-amber-500/40">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xl font-extrabold text-amber-400">{step.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MaterialIcon name={step.icon} className="text-amber-500 text-xl" />
                      </div>
                    </div>
                    <h3 className="font-heading text-base font-bold text-white">{step.title}</h3>
                    <p className="font-body text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 6-Factor Risk Weighting Deep Dive */}
            <div className="glass-panel p-8 border-amber-500/30 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
                    <MaterialIcon name="radar" className="text-amber-500 text-2xl" />
                    The 6-Factor Contextual Risk Scoring Model
                  </h3>
                  <p className="font-mono text-xs text-slate-400 mt-1">
                    Multi-dimensional risk evaluation model summing to 100% total weight factor
                  </p>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-400 font-bold">
                  Weight Total: 100% (1.00)
                </span>
              </div>

              {/* Mathematical Formula Banner */}
              <div className="bg-[#07090E] p-4 rounded-xl border border-white/10 space-y-2">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-bold block">
                  Hardcoded CTI Risk Formula:
                </span>
                <div className="bg-[#0D111D] p-3 rounded-lg border border-white/10 font-mono text-xs text-cyan-400 overflow-x-auto font-semibold">
                  R = 0.30 × Malware Evidence + 0.25 × Capability Risk + 0.15 × Purpose Mismatch + 0.15 × Behavioral Anomalies + 0.10 × Fraud Pathway + 0.05 × Certificate Reputation
                </div>
              </div>

              {/* 6 Factors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sixFactors.map((factor) => (
                  <div key={factor.name} className="bg-[#07090E] p-5 rounded-xl border border-white/10 flex flex-col justify-between space-y-3 hover:border-amber-500/30 transition-colors">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <MaterialIcon name={factor.icon} className="text-lg" style={{ color: factor.color }} />
                          <h4 className="font-heading text-sm font-bold text-white">{factor.name}</h4>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10" style={{ color: factor.color }}>
                          {factor.weight}
                        </span>
                      </div>
                      <p className="font-body text-xs text-slate-400 leading-relaxed">{factor.desc}</p>
                    </div>

                    <div className="w-full bg-[#0D111D] h-2 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: factor.weight, backgroundColor: factor.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#07090E] border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-slate-500">
          <span>&copy; 2026 IntentShield CTI Platform</span>
          <div className="flex gap-6">
            <Link to="/scan" className="hover:text-amber-400 transition-colors">Workspace</Link>
            <Link to="/settings" className="hover:text-amber-400 transition-colors">API Config</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
