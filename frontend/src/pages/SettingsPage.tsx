import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { TopBar } from '../components/layout';
import { MaterialIcon } from '../components/ui/MaterialIcon';

export function SettingsPage() {
  // User Account State
  const [account, setAccount] = useState({
    name: 'Bharath',
    email: 'bharath@intentguard.sec',
    role: 'Lead Security Analyst',
    emailAlerts: true,
  });

  // Analyst Preferences State
  const [preferences, setPreferences] = useState({
    autoDeleteApks: true,
    retainHistory: true,
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new && passwordForm.new === passwordForm.confirm) {
      setShowPasswordSuccess(true);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setShowPasswordSuccess(false), 3000);
    }
  };

  return (
    <AppLayout>
      <TopBar title="Account & Profile Settings" subtitle="Manage your user profile, security credentials, and analyst preferences" />

      <main className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Quick Auth Actions Banner */}
        {/* <div className="glass-panel p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <MaterialIcon name="account_circle" className="text-amber-500 text-xl" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white">Account Authentication Shortcuts</h3>
              <p className="font-mono text-xs text-slate-400">Quick sign in or register new user / admin accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-xs px-4 py-2">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary text-xs px-4 py-2">
              Sign Up
            </Link>
          </div>
        </div> */}

        {/* Section 1: User Account Profile */}
        <section className="glass-panel p-6 space-y-6 border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-heading text-2xl font-bold text-amber-500 shadow-glow">
                {account.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xl font-bold text-white">{account.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold uppercase">
                    {account.role}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-400 mt-0.5">{account.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="btn-secondary text-xs px-4 py-2"
            >
              <MaterialIcon name="tune" className="text-sm" />
              {isEditingProfile ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1.5">Full Name:</label>
              <input
                type="text"
                disabled={!isEditingProfile}
                value={account.name}
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-70"
              />
            </div>
            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1.5">Email Address:</label>
              <input
                type="email"
                disabled={!isEditingProfile}
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-70"
              />
            </div>
            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1.5">Role Title:</label>
              <input
                type="text"
                disabled={!isEditingProfile}
                value={account.role}
                onChange={(e) => setAccount({ ...account, role: e.target.value })}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-70"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Account Password & Security Settings */}
        <section className="glass-panel p-6 space-y-6 border-white/10">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <MaterialIcon name="lock" className="text-amber-500 text-xl" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Account Password & Security</h3>
              <p className="font-mono text-xs text-slate-400">Password updates </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Password Change Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4 font-mono text-xs">
              <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Change Password</h4>
              <div>
                <label className="text-slate-400 block mb-1">Current Password:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">New Password:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Confirm New Password:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary text-xs px-4 py-2">
                  Update Password
                </button>
                {showPasswordSuccess && (
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <MaterialIcon name="check_circle" className="text-sm" /> Password Updated!
                  </span>
                )}
              </div>
            </form>

            {/* Notification Toggles */}
            {/* <div className="space-y-6 font-mono text-xs">
              <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Security Notifications</h4>

              <div className="flex items-center justify-between p-4 bg-[#07090E] rounded-xl border border-white/10">
                <div>
                  <p className="text-white font-bold">Security Email Alerts</p>
                  <p className="text-slate-400 font-body text-xs mt-0.5">Receive alerts when new logins or account updates occur</p>
                </div>
                <button
                  onClick={() => setAccount({ ...account, emailAlerts: !account.emailAlerts })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    account.emailAlerts ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#07090E] transition-transform ${account.emailAlerts ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div> */}
          </div>
        </section>

        {/* Section 3: Workspace Preferences & Data Retention */}
        <section className="glass-panel p-6 space-y-6 border-white/10">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <MaterialIcon name="cleaning_services" className="text-amber-500 text-xl" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Analyst Preferences & Data Retention</h3>
              <p className="font-mono text-xs text-slate-400">Configure file cleanup and local storage options</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="flex items-center justify-between p-4 bg-[#07090E] rounded-xl border border-white/10">
              <div>
                <p className="text-white font-bold">Auto-Delete Temporary APK Binary Files</p>
                <p className="text-slate-400 font-body text-xs mt-0.5">Purge uploaded payload after static extraction</p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, autoDeleteApks: !preferences.autoDeleteApks })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  preferences.autoDeleteApks ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#07090E] transition-transform ${preferences.autoDeleteApks ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#07090E] rounded-xl border border-white/10">
              <div>
                <p className="text-white font-bold">Persist Scan History in Local Storage</p>
                <p className="text-slate-400 font-body text-xs mt-0.5">Save completed reports across browser sessions</p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, retainHistory: !preferences.retainHistory })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  preferences.retainHistory ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#07090E] transition-transform ${preferences.retainHistory ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
